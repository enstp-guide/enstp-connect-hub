import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { BackLink } from "@/components/BackLink";
import video from "@/assets/ecole-presentation.mp4.asset.json";

export const Route = createFileRoute("/aide")({
  head: () => ({
    meta: [
      { title: "مجتمع ENSTP · Centre d’aide" },
      { name: "description", content: "Groupes d’entraide par wilaya, vidéo de présentation et partage de cours entre étudiants de l’ENSTP." },
      { property: "og:title", content: "مجتمع ENSTP · Centre d’aide" },
      { property: "og:description", content: "Échangez par wilaya et partagez cours et résumés entre étudiants de l’ENSTP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Aide,
});

type Lang = "ar" | "fr" | "en";
type Tab = "home" | "video" | "wilayas" | "knowledge";

const T = {
  ar: { brandSub: "فضاء الطلبة حسب الولاية", navHome: "الرئيسية", navVideo: "🎬 فيديو تعريفي", navWilayas: "الولايات", navKnowledge: "فضاء المعارف", heroSchool: "المدرسة الوطنية العليا للأشغال العمومية", heroWelcome: "مرحبًا بك في الدعم والمساعدة", heroDesc: "مجموعات نقاش لطلبة ENSTP مصنّفة حسب الولاية، وفضاء لتبادل الملفات والفيديو التعريفي.", watchVideoBtn: "شاهد الفيديو التعريفي", exploreBtn: "تصفح الولايات", videoTitle: "تعرف على مدرسة ENSTP", videoDesc: "نبذة تاريخية، البرامج الأكاديمية، الهيكل التنظيمي ومعلومات الاتصال.", wilayasTitle: "مجموعات الولايات", wilayasDesc: "اختر ولايتك وتابع رسائل زملائك أو شارك استفسارك.", newPostBtn: "+ منشور جديد", shareFileBtn: "+ مشاركة ملف", knowledgeDesc: "دروس، ملخصات ومواضيع امتحانات يشاركها طلبة ENSTP.", wilaya: "الولاية", search: "ابحث عن ولاية…", noPosts: "لا توجد رسائل بعد. كن أول من يكتب!", write: "اكتب رسالتك…", publish: "نشر", back: "← كل الولايات", noFiles: "لا توجد ملفات بعد.", fileTitle: "عنوان الملف", pickFile: "اختر ملفًا (حتى 20 ميغابايت)", send: "مشاركة", cancel: "إلغاء", download: "تحميل", del: "حذف", login: "سجّل الدخول للمشاركة في المجتمع.", loginBtn: "تسجيل الدخول", chooseWilaya: "اختر الولاية" },
  fr: { brandSub: "L’espace étudiant par wilaya", navHome: "Accueil", navVideo: "🎬 Vidéo", navWilayas: "Wilayas", navKnowledge: "Espace savoirs", heroSchool: "École Nationale Supérieure des Travaux Publics", heroWelcome: "Bienvenue au centre d’aide", heroDesc: "Des groupes de discussion d’étudiants ENSTP par wilaya, un espace de partage de fichiers et la vidéo de présentation.", watchVideoBtn: "Voir la vidéo", exploreBtn: "Parcourir les wilayas", videoTitle: "Découvrez l’ENSTP", videoDesc: "Histoire, programmes, organigramme et contact.", wilayasTitle: "Groupes par wilaya", wilayasDesc: "Choisissez votre wilaya, lisez les messages ou posez votre question.", newPostBtn: "+ Nouveau message", shareFileBtn: "+ Partager un fichier", knowledgeDesc: "Cours, résumés et sujets d’examen partagés par les étudiants.", wilaya: "Wilaya", search: "Rechercher une wilaya…", noPosts: "Aucun message. Soyez le premier !", write: "Votre message…", publish: "Publier", back: "← Toutes les wilayas", noFiles: "Aucun fichier pour l’instant.", fileTitle: "Titre du fichier", pickFile: "Choisir un fichier (20 Mo max)", send: "Partager", cancel: "Annuler", download: "Télécharger", del: "Supprimer", login: "Connectez-vous pour participer.", loginBtn: "Se connecter", chooseWilaya: "Choisir la wilaya" },
  en: { brandSub: "Student space by wilaya", navHome: "Home", navVideo: "🎬 Video", navWilayas: "Wilayas", navKnowledge: "Knowledge hub", heroSchool: "National Higher School of Public Works", heroWelcome: "Welcome to help & support", heroDesc: "ENSTP student discussion groups by wilaya, a file-sharing space and the intro video.", watchVideoBtn: "Watch the video", exploreBtn: "Browse wilayas", videoTitle: "Discover ENSTP", videoDesc: "History, programs, org chart and contact.", wilayasTitle: "Wilaya groups", wilayasDesc: "Pick your wilaya to read classmates’ messages or ask a question.", newPostBtn: "+ New post", shareFileBtn: "+ Share a file", knowledgeDesc: "Courses, summaries and exam papers shared by students.", wilaya: "Wilaya", search: "Search a wilaya…", noPosts: "No messages yet. Be the first!", write: "Write your message…", publish: "Post", back: "← All wilayas", noFiles: "No files yet.", fileTitle: "File title", pickFile: "Choose a file (max 20 MB)", send: "Share", cancel: "Cancel", download: "Download", del: "Delete", login: "Sign in to join the community.", loginBtn: "Sign in", chooseWilaya: "Choose wilaya" },
} as const;

const WILAYAS = ["أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار","البليدة","البويرة","تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر","الجلفة","جيجل","سطيف","سعيدة","سكيكدة","سيدي بلعباس","عنابة","قالمة","قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة","وهران","البيض","إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي","خنشلة","سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت","غرداية","غليزان","تيميمون","برج باجي مختار","أولاد جلال","بني عباس","عين صالح","عين قزام","تقرت","جانت","المغير","المنيعة"];

type Post = { id: string; user_id: string; author_name: string; wilaya_code: number; content: string; created_at: string };
type FileRow = { id: string; user_id: string; author_name: string; title: string; path: string; file_type: string; created_at: string };

function Aide() {
  const [lang, setLang] = useState<Lang>("ar");
  const [tab, setTab] = useState<Tab>("home");
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [name, setName] = useState("");
  const t = T[lang];

  useEffect(() => {
    const saved = localStorage.getItem("hw-lang") as Lang | null;
    if (saved && saved in T) setLang(saved);
    supabase.auth.getUser().then(async ({ data }) => {
      setUid(data.user?.id ?? null);
      if (!data.user) return;
      const { data: p } = await supabase.from("profiles").select("first_name,last_name").eq("id", data.user.id).maybeSingle();
      if (p) setName(`${p.first_name} ${p.last_name}`.trim());
    });
  }, []);

  const changeLang = (l: Lang) => { setLang(l); localStorage.setItem("hw-lang", l); };
  const dir = lang === "ar" ? "rtl" : "ltr";
  const tabs: [Tab, string][] = [["home", t.navHome], ["video", t.navVideo], ["wilayas", t.navWilayas], ["knowledge", t.navKnowledge]];

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-4xl">
        <Toaster />
        <BackLink />
        <div dir={dir} lang={lang} className="overflow-hidden rounded-2xl border border-border bg-muted/40 shadow-sm" style={{ fontFamily: lang === "ar" ? "'Cairo', Tahoma, sans-serif" : undefined }}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-5 py-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-lg font-extrabold text-primary-foreground">E</div>
              <div>
                <h1 className="text-sm font-bold">مجتمع ENSTP</h1>
                <p className="text-[10px] text-muted-foreground">{t.brandSub}</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-1">
              {tabs.map(([k, label]) => (
                <button key={k} onClick={() => setTab(k)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>{label}</button>
              ))}
            </nav>
            <select value={lang} onChange={(e) => changeLang(e.target.value as Lang)} className="rounded-md border border-border bg-card px-2 py-1 text-xs font-semibold">
              <option value="ar">العربية</option><option value="fr">Français</option><option value="en">English</option>
            </select>
          </header>

          <div className="min-h-[340px] p-5">
            {tab === "home" && (
              <div className="rounded-xl bg-primary p-6 text-center text-primary-foreground">
                <div className="mb-1.5 text-[11px] opacity-80">{t.heroSchool}</div>
                <h2 className="mb-2 text-xl font-extrabold">{t.heroWelcome}</h2>
                <p className="mx-auto mb-4 max-w-md text-xs opacity-90">{t.heroDesc}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => setTab("video")} className="rounded-md bg-mint px-4 py-2 text-xs font-bold text-foreground">{t.watchVideoBtn}</button>
                  <button onClick={() => setTab("wilayas")} className="rounded-md border border-primary-foreground/40 px-4 py-2 text-xs font-semibold">{t.exploreBtn}</button>
                </div>
              </div>
            )}
            {tab === "video" && (
              <div className="text-center">
                <h2 className="mb-1.5 text-base font-bold">{t.videoTitle}</h2>
                <p className="mb-4 text-xs text-muted-foreground">{t.videoDesc}</p>
                <video controls preload="metadata" src={video.url} className="mx-auto aspect-video w-full max-w-2xl rounded-xl bg-foreground" />
              </div>
            )}
            {(tab === "wilayas" || tab === "knowledge") && uid === null && (
              <div className="grid place-items-center py-16 text-center">
                <p className="text-sm font-semibold">{t.login}</p>
                <Link to="/" className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">{t.loginBtn}</Link>
              </div>
            )}
            {tab === "wilayas" && uid && <Wilayas t={t} uid={uid} name={name} />}
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

function Wilayas({ t, uid, name }: { t: TT; uid: string; name: string }) {
  const [sel, setSel] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!sel) return;
    supabase.from("wilaya_posts").select("*").eq("wilaya_code", sel).order("created_at", { ascending: false }).limit(100).then(({ data }) => setPosts(data ?? []));
  }, [sel]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const c = text.trim();
    if (!c || !sel) return;
    setBusy(true);
    const { data, error } = await supabase.from("wilaya_posts").insert({ user_id: uid, author_name: name, wilaya_code: sel, content: c.slice(0, 1000) }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setPosts((p) => [data, ...p]);
    setText("");
  }
  async function remove(id: string) {
    const { error } = await supabase.from("wilaya_posts").delete().eq("id", id);
    if (!error) setPosts((p) => p.filter((x) => x.id !== id));
  }

  if (sel)
    return (
      <div>
        <button onClick={() => setSel(null)} className="mb-3 text-xs font-semibold text-primary hover:underline">{t.back}</button>
        <h2 className="mb-3 text-base font-bold">{WILAYAS[sel - 1]} · {t.wilaya} {code(sel)}</h2>
        <form onSubmit={submit} className="mb-4 flex gap-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} rows={2} placeholder={t.write} className="flex-1 resize-none rounded-lg border border-border bg-card p-2 text-sm" />
          <button disabled={busy || !text.trim()} className="self-end rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{t.publish}</button>
        </form>
        <div className="flex flex-col gap-2">
          {posts.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">{t.noPosts}</p>}
          {posts.map((p) => (
            <div key={p.id} className="rounded-lg border border-border bg-card p-3">
              <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                <span className="font-bold text-foreground">{p.author_name || "—"}</span>
                <span>{fmt(p.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{p.content}</p>
              {p.user_id === uid && <button onClick={() => remove(p.id)} className="mt-1 text-[10px] text-destructive hover:underline">{t.del}</button>}
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
          </button>
        ))}
      </div>
    </div>
  );
}

function Knowledge({ t, uid, name }: { t: TT; uid: string; name: string }) {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [open, setOpen] = useState(false);
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
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full text-xs" />
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
              <div className="text-[10px] text-muted-foreground">{f.file_type || "FILE"} • {f.author_name || "—"} • {fmt(f.created_at)}</div>
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
