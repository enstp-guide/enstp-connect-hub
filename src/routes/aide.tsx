import { displayName } from "@/lib/display-name";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { BackLink } from "@/components/BackLink";

export const Route = createFileRoute("/aide")({
  validateSearch: (search: Record<string, unknown>) => ({
    embed: search["embed"] === true || search["embed"] === "true",
    lang: (["ar", "fr", "en"].includes(String(search["lang"])) ? String(search["lang"]) : undefined) as Lang | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Communauté ENSTP · Centre d’aide" },
      { name: "description", content: "Groupes d’entraide par wilaya, vidéo de présentation et partage de cours entre étudiants de l’ENSTP." },
      { property: "og:title", content: "Communauté ENSTP · Centre d’aide" },
      { property: "og:description", content: "Échangez par wilaya et partagez cours et résumés entre étudiants de l’ENSTP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Aide,
});

type Lang = "ar" | "fr" | "en";
type Tab = "home" | "wilayas" | "knowledge";

const T = {
  ar: { brand: "فضاء طلبة ENSTP", statFiles: "ملفات مشتركة", statMsgs: "رسائل في الولايات", msgs: "رسالة", replyBtn: "رد", replyPh: "اكتب ردك…", brandSub: "فضاء الطلبة حسب الولاية", navHome: "الرئيسية", navVideo: "🎬 فيديو تعريفي", navWilayas: "الولايات", navKnowledge: "فضاء المعارف", heroSchool: "المدرسة الوطنية العليا للأشغال العمومية", heroWelcome: "مرحبًا بك في الدعم والمساعدة", heroDesc: "مجموعات نقاش لطلبة ENSTP مصنّفة حسب الولاية، وفضاء لتبادل الملفات.", watchVideoBtn: "شاهد الفيديو التعريفي", exploreBtn: "تصفح الولايات", videoTitle: "تعرف على مدرسة ENSTP", videoDesc: "نبذة تاريخية، البرامج الأكاديمية، الهيكل التنظيمي ومعلومات الاتصال.", wilayasTitle: "مجموعات الولايات", wilayasDesc: "اختر ولايتك وتابع رسائل زملائك أو شارك استفسارك.", newPostBtn: "+ منشور جديد", shareFileBtn: "+ مشاركة ملف", knowledgeDesc: "دروس، ملخصات ومواضيع امتحانات يشاركها طلبة ENSTP.", wilaya: "الولاية", search: "ابحث عن ولاية…", noPosts: "لا توجد رسائل بعد. كن أول من يكتب!", write: "اكتب رسالتك…", publish: "نشر", back: "← كل الولايات", noFiles: "لا توجد ملفات بعد.", fileTitle: "عنوان الملف", pickFile: "اختر ملفًا (حتى 20 ميغابايت)", send: "مشاركة", cancel: "إلغاء", download: "تحميل", del: "حذف", login: "سجّل الدخول للمشاركة في المجتمع.", loginBtn: "تسجيل الدخول", chooseWilaya: "اختر الولاية" },
  fr: { brand: "Communauté ENSTP", statFiles: "fichiers partagés", statMsgs: "messages dans les wilayas", msgs: "messages", replyBtn: "Répondre", replyPh: "Votre réponse…", brandSub: "L’espace étudiant par wilaya", navHome: "Accueil", navVideo: "🎬 Vidéo", navWilayas: "Wilayas", navKnowledge: "Espace savoirs", heroSchool: "École Nationale Supérieure des Travaux Publics", heroWelcome: "Bienvenue au centre d’aide", heroDesc: "Des groupes de discussion d’étudiants ENSTP par wilaya et un espace de partage de fichiers.", watchVideoBtn: "Voir la vidéo", exploreBtn: "Parcourir les wilayas", videoTitle: "Découvrez l’ENSTP", videoDesc: "Histoire, programmes, organigramme et contact.", wilayasTitle: "Groupes par wilaya", wilayasDesc: "Choisissez votre wilaya, lisez les messages ou posez votre question.", newPostBtn: "+ Nouveau message", shareFileBtn: "+ Partager un fichier", knowledgeDesc: "Cours, résumés et sujets d’examen partagés par les étudiants.", wilaya: "Wilaya", search: "Rechercher une wilaya…", noPosts: "Aucun message. Soyez le premier !", write: "Votre message…", publish: "Publier", back: "← Toutes les wilayas", noFiles: "Aucun fichier pour l’instant.", fileTitle: "Titre du fichier", pickFile: "Choisir un fichier (20 Mo max)", send: "Partager", cancel: "Annuler", download: "Télécharger", del: "Supprimer", login: "Connectez-vous pour participer.", loginBtn: "Se connecter", chooseWilaya: "Choisir la wilaya" },
  en: { brand: "ENSTP Community", statFiles: "shared files", statMsgs: "wilaya messages", msgs: "messages", replyBtn: "Reply", replyPh: "Your reply…", brandSub: "Student space by wilaya", navHome: "Home", navVideo: "🎬 Video", navWilayas: "Wilayas", navKnowledge: "Knowledge hub", heroSchool: "National Higher School of Public Works", heroWelcome: "Welcome to help & support", heroDesc: "ENSTP student discussion groups by wilaya and a file-sharing space.", watchVideoBtn: "Watch the video", exploreBtn: "Browse wilayas", videoTitle: "Discover ENSTP", videoDesc: "History, programs, org chart and contact.", wilayasTitle: "Wilaya groups", wilayasDesc: "Pick your wilaya to read classmates’ messages or ask a question.", newPostBtn: "+ New post", shareFileBtn: "+ Share a file", knowledgeDesc: "Courses, summaries and exam papers shared by students.", wilaya: "Wilaya", search: "Search a wilaya…", noPosts: "No messages yet. Be the first!", write: "Write your message…", publish: "Post", back: "← All wilayas", noFiles: "No files yet.", fileTitle: "File title", pickFile: "Choose a file (max 20 MB)", send: "Share", cancel: "Cancel", download: "Download", del: "Delete", login: "Sign in to join the community.", loginBtn: "Sign in", chooseWilaya: "Choose wilaya" },
} as const;

const WILAYAS = ["أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار","البليدة","البويرة","تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر","الجلفة","جيجل","سطيف","سعيدة","سكيكدة","سيدي بلعباس","عنابة","قالمة","قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة","وهران","البيض","إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي","خنشلة","سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت","غرداية","غليزان","تيميمون","برج باجي مختار","أولاد جلال","بني عباس","عين صالح","عين قزام","تقرت","جانت","المغير","المنيعة"];

type Post = { id: string; user_id: string; author_name: string; wilaya_code: number; content: string; parent_id?: string | null; created_at: string };
type FileRow = { id: string; user_id: string; author_name: string; title: string; path: string; file_type: string; created_at: string };

function Aide() {
  const { embed, lang: initial } = Route.useSearch();
  const root = useRef<HTMLElement>(null);
  const [lang] = useState<Lang>(initial ?? "fr");
  const [tab, setTab] = useState<Tab>("home");
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [name, setName] = useState("");
  const t = T[lang];
  const [stats, setStats] = useState<{ files: number; msgs: number; by: Record<number, number> }>({ files: 0, msgs: 0, by: {} });
  useEffect(() => {
    if (!uid) return;
    (async () => {
      const [f, w] = await Promise.all([
        supabase.from("shared_files").select("id", { count: "exact", head: true }),
        supabase.from("wilaya_posts").select("wilaya_code").limit(10000),
      ]);
      const by: Record<number, number> = {};
      (w.data ?? []).forEach((r) => { by[r.wilaya_code] = (by[r.wilaya_code] ?? 0) + 1; });
      setStats({ files: f.count ?? 0, msgs: (w.data ?? []).length, by });
    })();
  }, [uid, tab]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUid(data.user?.id ?? null);
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("first_name,last_name,academic_year,specialty").eq("id", data.user.id).maybeSingle();
      setName(displayName(p, (data.user.email ?? "").split("@")[0] ?? ""));
    });
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!embed || !el) return;
    const report = () => window.parent.postMessage({ type: "enstp-aide-height", height: Math.ceil(el.getBoundingClientRect().height) }, window.location.origin);
    const ob = new ResizeObserver(report);
    ob.observe(el);
    report();
    return () => ob.disconnect();
  }, [embed]);

  const dir = lang === "ar" ? "rtl" : "ltr";
  const tabs: [Tab, string][] = [["home", t.navHome], ["wilayas", t.navWilayas], ["knowledge", t.navKnowledge]];

  return (
    <main ref={root} className={embed ? "bg-background text-foreground" : "min-h-screen bg-background px-4 py-8 text-foreground"}>
      <div className="mx-auto max-w-4xl">
        <Toaster />
        {!embed && <BackLink />}
        <div dir={dir} lang={lang} className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background/60 px-6 py-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground shadow-sm">E</div>
              <div>
                <h1 className="text-base font-bold tracking-tight">{t.brand}</h1>
                <p className="text-xs text-muted-foreground">{t.brandSub}</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-1 rounded-full border border-border bg-card p-1">
              {tabs.map(([k, label]) => (
                <button key={k} onClick={() => setTab(k)} className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${tab === k ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{label}{uid && k !== "home" && <span className="ms-1.5 rounded-full bg-mint px-1.5 text-[10px] font-bold text-foreground">{k === "wilayas" ? stats.msgs : stats.files}</span>}</button>
              ))}
            </nav>
          </header>

          <div className="min-h-[360px] p-6 md:p-8">
            {tab === "home" && (
              <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-6 py-12 text-center text-primary-foreground">
                <div className="mb-3 text-xs uppercase tracking-widest opacity-75">{t.heroSchool}</div>
                <h2 className="mb-3 text-2xl font-extrabold md:text-3xl">{t.heroWelcome}</h2>
                <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed opacity-90">{t.heroDesc}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => setTab("wilayas")} className="rounded-full bg-mint px-5 py-2.5 text-sm font-bold text-foreground transition-transform hover:scale-[1.03]">{t.exploreBtn}</button>
                  <button onClick={() => setTab("knowledge")} className="rounded-full border border-primary-foreground/40 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-primary-foreground/10">{t.navKnowledge}</button>
                </div>
                {uid && (
                  <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3">
                    {([[stats.files, t.statFiles, "knowledge"], [stats.msgs, t.statMsgs, "wilayas"]] as const).map(([n, l, k]) => (
                      <button key={k} onClick={() => setTab(k)} className="rounded-2xl bg-primary-foreground/10 p-4 transition-colors hover:bg-primary-foreground/20">
                        <div className="text-3xl font-extrabold">{n}</div>
                        <div className="text-xs opacity-80">{l}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {(tab === "wilayas" || tab === "knowledge") && uid === null && (
              <div className="grid place-items-center py-16 text-center">
                <p className="text-sm font-semibold">{t.login}</p>
                <Link to="/" target={embed ? "_top" : "_self"} className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">{t.loginBtn}</Link>
              </div>
            )}
            {tab === "wilayas" && uid && <Wilayas t={t} uid={uid} name={name} counts={stats.by} />}
            {tab === "knowledge" && uid && <Knowledge t={t} uid={uid} name={name} />}
          </div>
        </div>
      </div>
    </main>
  );
}


type TT = (typeof T)[Lang];
const fmt = (d: string) => new Date(d).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
const code = (n: number) => String(n).padStart(2, "0");

function Wilayas({ t, uid, name, counts }: { t: TT; uid: string; name: string; counts: Record<number, number> }) {
  const [sel, setSel] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (!sel) return;
    supabase.from("wilaya_posts").select("*").eq("wilaya_code", sel).order("created_at", { ascending: true }).limit(100).then(({ data }) => setPosts(data ?? []));
  }, [sel]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const c = text.trim();
    if (!c || !sel) return;
    setBusy(true);
    const { data, error } = await supabase.from("wilaya_posts").insert({ user_id: uid, author_name: name, wilaya_code: sel, content: c.slice(0, 1000) }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setPosts((p) => [...p, data]);
    setText("");
  }
  async function remove(id: string) {
    const { error } = await supabase.from("wilaya_posts").delete().eq("id", id);
    if (!error) setPosts((p) => p.filter((x) => x.id !== id && x.parent_id !== id));
  }
  async function sendReply(parent: string) {
    const c = replyText.trim();
    if (!c || !sel) return;
    setBusy(true);
    const { data, error } = await supabase.from("wilaya_posts").insert({ user_id: uid, author_name: name, wilaya_code: sel, content: c.slice(0, 1000), parent_id: parent }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setPosts((p) => [...p, data]);
    setReplyText(""); setReplyTo(null);
  }
  const roots = posts.filter((p) => !p.parent_id).reverse();
  const initials = (n: string) => (n || "?").split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

  if (sel)
    return (
      <div>
        <button onClick={() => setSel(null)} className="mb-3 text-xs font-semibold text-primary hover:underline">{t.back}</button>
        <h2 className="mb-3 text-base font-bold">{WILAYAS[sel - 1]} · {t.wilaya} {code(sel)}</h2>
        <form onSubmit={submit} className="mb-4 flex gap-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} rows={2} placeholder={t.write} className="flex-1 resize-none rounded-lg border border-border bg-card p-2 text-sm" />
          <button disabled={busy || !text.trim()} className="self-end rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{t.publish}</button>
        </form>
        <div className="flex flex-col gap-3">
          {roots.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">{t.noPosts}</p>}
          {roots.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-background/50 p-4">
              <PostBody p={p} uid={uid} t={t} onDel={remove} initials={initials} />
              <div className="ms-11 mt-2 flex flex-col gap-2">
                {posts.filter((r) => r.parent_id === p.id).map((r) => (
                  <div key={r.id} className="rounded-xl border border-border bg-card p-3"><PostBody p={r} uid={uid} t={t} onDel={remove} initials={initials} /></div>
                ))}
                {replyTo === p.id ? (
                  <div className="flex gap-2">
                    <input autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply(p.id)} maxLength={1000} placeholder={t.replyPh} className="flex-1 rounded-full border border-border bg-card px-4 py-1.5 text-sm" />
                    <button disabled={busy || !replyText.trim()} onClick={() => sendReply(p.id)} className="rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground disabled:opacity-50">{t.publish}</button>
                  </div>
                ) : (
                  <button onClick={() => { setReplyTo(p.id); setReplyText(""); }} className="self-start text-xs font-semibold text-primary hover:underline">↩ {t.replyBtn}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  const list = WILAYAS.map((n, i) => ({ n, c: i + 1 })).filter((w) => w.n.includes(q) || code(w.c).includes(q));
  return (
    <div>
      <h2 className="mb-1 text-base font-bold">{t.wilayasTitle}</h2>
      <p className="mb-3 text-xs text-muted-foreground">{t.wilayasDesc}</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.search} className="mb-3 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
      <div className="grid max-h-[420px] grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2 overflow-y-auto p-1">
        {list.map((w) => (
          <button key={w.c} onClick={() => setSel(w.c)} className="rounded-lg border border-border bg-card p-2.5 text-center transition-colors hover:border-primary">
            <div className="text-sm font-bold">{w.n}</div>
            <div className="text-[10px] text-muted-foreground">{t.wilaya} {code(w.c)}</div>
            {(counts[w.c] ?? 0) > 0 && <div className="mt-1 inline-block rounded-full bg-mint px-2 text-[10px] font-bold text-foreground">{counts[w.c]} {t.msgs}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function Knowledge({ t, uid, name }: { t: TT; uid: string; name: string }) {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [open, setOpen] = useState(true);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("shared_files").select("*").order("created_at", { ascending: false }).limit(200).then(({ data }) => setFiles(data ?? []));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    if (file.size > 20 * 1024 * 1024) { toast.error("20 MB max"); return; }
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const path = `${uid}/${crypto.randomUUID()}${ext ? "." + ext : ""}`;
    const up = await supabase.storage.from("knowledge").upload(path, file, { contentType: file.type });
    if (up.error) { setBusy(false); { toast.error(up.error.message); return; } }
    const { data, error } = await supabase.from("shared_files").insert({ user_id: uid, author_name: name, title: title.trim().slice(0, 150), path, file_type: ext.toUpperCase() }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setFiles((f) => [data, ...f]);
    setTitle(""); setFile(null); setOpen(false);
  }
  async function download(f: FileRow) {
    const { data, error } = await supabase.storage.from("knowledge").createSignedUrl(f.path, 120);
    if (error) { toast.error(error.message); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  }
  async function remove(f: FileRow) {
    await supabase.storage.from("knowledge").remove([f.path]);
    const { error } = await supabase.from("shared_files").delete().eq("id", f.id);
    if (!error) setFiles((x) => x.filter((y) => y.id !== f.id));
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-bold">{t.navKnowledge}</h2>
        <button onClick={() => setOpen((o) => !o)} className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground">{t.shareFileBtn}</button>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">{t.knowledgeDesc}</p>
      {open && (
        <form onSubmit={submit} className="mb-4 flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} placeholder={t.fileTitle} className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <label className="text-xs text-muted-foreground">{t.pickFile}
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full cursor-pointer rounded-md border border-dashed border-border bg-background p-3 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-primary-foreground" />
          </label>
          <div className="flex gap-2">
            <button disabled={busy || !file || !title.trim()} className="rounded-md bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-50">{busy ? "…" : t.send}</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-md px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent">{t.cancel}</button>
          </div>
        </form>
      )}
      <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto">
        {files.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">{t.noFiles}</p>}
        {files.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">{f.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{f.author_name || "—"}</span> · {f.file_type || "FILE"} · {fmt(f.created_at)}</div>
            </div>
            <div className="flex shrink-0 gap-1">
              {f.user_id === uid && <button onClick={() => remove(f)} className="rounded-md px-2 py-1.5 text-[11px] text-destructive hover:bg-accent">{t.del}</button>}
              <button onClick={() => download(f)} className="rounded-md bg-muted px-3 py-1.5 text-[11px] font-semibold hover:bg-accent">{t.download}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PostBody({ p, uid, t, onDel, initials }: { p: Post; uid: string; t: TT; onDel: (id: string) => void; initials: (n: string) => string }) {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint text-[11px] font-bold text-foreground">{initials(p.author_name)}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-bold">{p.author_name || "—"}</span>
          <span className="text-[10px] text-muted-foreground">{fmt(p.created_at)}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed">{p.content}</p>
        {p.user_id === uid && <button onClick={() => onDel(p.id)} className="mt-1 text-[10px] text-destructive hover:underline">{t.del}</button>}
      </div>
    </div>
  );
}
