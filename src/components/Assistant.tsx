import { useEffect, useMemo, useRef, useState } from "react";
import type { UIMessage } from "ai";
import { MessageSquarePlus, Trash2, X, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { splitTrilingual } from "@/lib/trilingual";
import { browserLanguage, detectLanguage, UI_TEXT, type Lang } from "@/lib/detect-language";
import { supabase } from "@/integrations/supabase/client";
import { chatLanguage, localReply, type Memory } from "@/lib/local-assistant";
import { groupFor } from "@/lib/enstp-data";
import think from "@/assets/avatar/think.webp.asset.json";
import load from "@/assets/avatar/load.webp.asset.json";
import hai from "@/assets/avatar/hai.webp.asset.json";
import bye from "@/assets/avatar/bye.webp.asset.json";

type Thread = { id: string; title: string; updated_at: string };

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<"hai" | "bye" | null>("hai");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => setLang(browserLanguage()), []);

  useEffect(() => {
    const t = setTimeout(() => setFlash(null), 2200);
    return () => clearTimeout(t);
  }, [flash]);

  async function loadThreads() {
    const { data } = await supabase
      .from("chat_threads")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false });
    setThreads(data ?? []);
    return data ?? [];
  }

  async function newThread() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: u.user.id })
      .select("id,title,updated_at")
      .single();
    if (error || !data) return;
    setThreads((t) => [data, ...t]);
    setActive(data.id);
    setShowList(false);
  }

  async function del(id: string) {
    await supabase.from("chat_threads").delete().eq("id", id);
    const left = threads.filter((t) => t.id !== id);
    setThreads(left);
    if (active === id) setActive(left[0]?.id ?? null);
  }

  function toggle() {
    if (open) {
      setOpen(false);
      setFlash("bye");
    } else {
      setOpen(true);
      setFlash("hai");
      loadThreads().then((list) => {
        if (!active) {
          if (list[0]) setActive(list[0].id);
          else newThread();
        }
      });
    }
  }

  const avatar =
    flash === "hai" ? hai.url : flash === "bye" ? bye.url : busy ? load.url : think.url;

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-primary px-3 py-2 text-primary-foreground">
            <img src={avatar} alt="" className="h-9 w-9 shrink-0 rounded-full border-2 border-primary-foreground/40 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight">Assistant ENSTP Go</p>
              <p className="truncate text-[11px] opacity-80">
                {busy ? UI_TEXT[lang].thinking : UI_TEXT[lang].idle}
              </p>
            </div>
            <Button
              variant="ghost"
              aria-label="Conversations"
              onClick={() => setShowList((s) => !s)}
              className="rounded p-1.5 hover:bg-primary-foreground/15"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              aria-label="Nouvelle conversation"
              onClick={newThread}
              className="rounded p-1.5 hover:bg-primary-foreground/15"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              aria-label="Fermer"
              onClick={toggle}
              className="rounded p-1.5 hover:bg-primary-foreground/15"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {showList ? (
            <div className="flex-1 overflow-y-auto p-2">
              {threads.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-1 rounded-lg ${t.id === active ? "bg-muted" : ""}`}
                >
                  <Button
                    variant="ghost"
                    className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm"
                    onClick={() => {
                      setActive(t.id);
                      setShowList(false);
                    }}
                  >
                    {t.title}
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label="Supprimer"
                    onClick={() => del(t.id)}
                    className="p-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {!threads.length && (
                <p className="p-3 text-sm text-muted-foreground">Aucune conversation.</p>
              )}
            </div>
          ) : active ? (
            <ChatThread key={active} threadId={active} onBusy={setBusy} lang={lang} onLang={setLang} />
          ) : (
            <div className="flex-1" />
          )}
        </div>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-label="Ouvrir l’assistant"
        className="fixed bottom-4 right-4 z-50 block h-16 w-16 overflow-hidden rounded-full border-4 border-primary bg-mint p-0 shadow-xl transition hover:scale-105"
      >
        <img
          src={avatar}
          alt="Assistant"
          width={64}
          height={64}
          className="block h-full w-full rounded-full object-cover"
        />
      </button>
    </>
  );
}

type LangProps = { lang: Lang; onLang: (l: Lang) => void };
function ChatThread({
  threadId,
  onBusy,
  lang,
  onLang,
}: { threadId: string; onBusy: (b: boolean) => void } & LangProps) {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  useEffect(() => {
    supabase
      .from("chat_messages")
      .select("message")
      .eq("thread_id", threadId)
      .order("created_at")
      .then(({ data }) => {
        setInitial((data ?? []).map((r) => r.message as unknown as UIMessage));
      });
  }, [threadId]);
  if (!initial) return <div className="flex-1 p-4 text-sm text-muted-foreground">Chargement…</div>;
  return <ChatBody threadId={threadId} initial={initial} onBusy={onBusy} lang={lang} onLang={onLang} />;
}

type Part = { type: string; text?: string; state?: string; output?: unknown };
type Msg = { id: string; role: "user" | "assistant" | "system"; parts: Part[] };

function ChatBody({
  threadId,
  initial,
  onBusy,
  lang,
  onLang,
}: {
  threadId: string;
  initial: UIMessage[];
  onBusy: (b: boolean) => void;
} & LangProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>(initial as unknown as Msg[]);
  const [defaultClass, setDefaultClass] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  // mémoire de la discussion (classe, groupe, jour…) reconstruite à partir de l’historique
  const [memory, setMemory] = useState<Memory>(() => {
    let m: Memory = {};
    for (const msg of initial as unknown as Msg[])
      if (msg.role === "user")
        for (const part of msg.parts)
          if (part.type === "text" && part.text) m = localReply(part.text, chatLanguage(part.text, lang), { memory: m }).memory;
    return m;
  });
  const [chips, setChips] = useState<string[]>(() => localReply("", lang).chips);
  const ta = useRef<HTMLTextAreaElement>(null);
  useEffect(() => onBusy(false), [onBusy]);
  useEffect(() => {
    ta.current?.focus();
  }, [threadId]);
  // La classe de l’étudiant (profil) sert de valeur par défaut pour ses questions d’emploi du temps.
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("first_name,academic_year,specialty")
        .eq("id", data.user.id)
        .maybeSingle();
      if (p?.academic_year) setDefaultClass(groupFor(p.academic_year, p.specialty));
      if (p?.first_name) setFirstName(p.first_name);
    });
  }, []);

  async function save(m: Msg) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("chat_messages")
      .insert({ thread_id: threadId, user_id: u.user.id, message: m as never });
    if (error) console.error("save msg", error);
  }

  // Réponse calculée sur l’appareil à partir des données du site : aucun crédit IA utilisé.
  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    const l = chatLanguage(t, lang);
    onLang(l);
    const r = localReply(t, l, { defaultClass, firstName, memory });
    setMemory(r.memory);
    setChips(r.chips);
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text: t }] };
    const reply: Msg = { id: crypto.randomUUID(), role: "assistant", parts: [{ type: "text", text: r.text }] };
    const first = messages.length === 0;
    setMessages((m) => [...m, userMsg, reply]);
    setInput("");
    void save(userMsg).then(() => save(reply));
    if (first)
      void supabase
        .from("chat_threads")
        .update({ title: t.slice(0, 50), updated_at: new Date().toISOString() })
        .eq("id", threadId)
        .then(({ error }) => error && console.error("title", error));
  }
  const submit = () => send(input);

  return (
    <>
      <Conversation className="min-h-0 flex-1 text-sm">
        <ConversationContent className="gap-4 p-3">
          {!messages.length && (
            <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
              <MessageResponse>{localReply("", lang, { firstName }).text}</MessageResponse>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role} className="max-w-full">
              <MessageContent
                className={
                  m.role === "user"
                    ? "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                    : "w-full"
                }
              >
                {m.parts.map((p, i) => {
                  if (p.type === "text" && p.text)
                    return m.role === "assistant" ? (
                      <TrilingualResponse key={i} text={p.text} />
                    ) : (
                      <MessageResponse key={i}>{p.text}</MessageResponse>
                    );
                  // anciennes conversations : carte PDF de l’ancien assistant
                  if (p.type === "tool-get_timetable" && p.state === "output-available")
                    return <PdfCard key={i} o={p.output as { label: string; pdf: string; page: number }} />;
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
        </ConversationContent>
      </Conversation>
      <div className="border-t border-border p-2">
        {chips.length > 0 && (
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1" aria-label="Suggestions">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => send(c)}
                className="shrink-0 rounded-full border border-primary/40 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/15"
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <PromptInput onSubmit={submit}>
          <PromptInputTextarea
            ref={ta}
            autoFocus
            aria-label="Votre question"
            dir="auto"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={UI_TEXT[lang].placeholder}
            className="max-h-28 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit aria-label="Envoyer" status="ready" disabled={!input.trim()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </>
  );
}

function TrilingualResponse({ text }: { text: string }) {
  const sections = splitTrilingual(text);
  if (!sections.some((section) => section.text)) {
    const l = detectLanguage(text);
    return (
      <div lang={l} dir={l === "ar" ? "rtl" : "ltr"} className="[overflow-wrap:anywhere]">
        <MessageResponse>{text}</MessageResponse>
      </div>
    );
  }
  return (
    <div className="grid w-full gap-3">
      {sections
        .filter((section) => section.text)
        .map((section) => (
          <section
            key={section.id}
            lang={section.id}
            dir={section.direction}
            aria-label={section.label}
            className="min-w-0 border-s-2 border-primary/30 ps-3 [overflow-wrap:anywhere]"
          >
            <h3 className="mb-1 text-xs font-bold text-primary">{section.label}</h3>
            <MessageResponse>{section.text}</MessageResponse>
          </section>
        ))}
    </div>
  );
}

function PdfCard({ o }: { o: { label: string; pdf: string; page: number } }) {
  return (
    <div className="mt-2 rounded-xl border border-border bg-muted/60 p-3">
      <p className="text-xs font-semibold">📄 {o.label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a href={o.pdf} download className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
          Télécharger le PDF
        </a>
        <a href={`${o.pdf}#page=${o.page}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">
          Voir (page {o.page})
        </a>
      </div>
    </div>
  );
}
