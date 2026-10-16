import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero.webp";
import { Assistant } from "@/components/LazyAssistant";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ENSTP Go · Le guide étudiant" },
      {
        name: "description",
        content:
          "ENSTP Go : votre guide pour bien commencer à l’ENSTP — campus, démarches, vie étudiante et découvertes à Alger.",
      },
      { property: "og:title", content: "ENSTP Go · Le guide étudiant" },
      {
        property: "og:description",
        content: "Tous les repères pour votre première année à l’ENSTP et votre nouvelle vie à Alger.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "Prénom requis").max(60),
  lastName: z.string().trim().min(1, "Nom requis").max(60),
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(72),
});

type Profile = {
  first_name: string;
  last_name: string;
  email: string;
  academic_year: number | null;
  specialty: string | null;
};

type View = "login" | "signup" | "forgot";

function Index() {
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setReady(true);
    });
    const onMsg = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === "enstp-signout") {
        supabase.auth.signOut();
      }
    };
    window.addEventListener("message", onMsg);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("message", onMsg);
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      try {
        localStorage.removeItem("enstp-go-email");
        localStorage.removeItem("enstp-go-profile");
      } catch {
        /* ignore */
      }
      return;
    }
    supabase
      .from("profiles")
      .select("first_name,last_name,email,academic_year,specialty")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        const p = data ?? { first_name: "", last_name: "", email: "", academic_year: null, specialty: null };
        // Hand the profile to the guide page (same origin).
        const year = p.academic_year ? p.academic_year - 1 : 5;
        const dept = p.specialty === "DIB" ? 0 : p.specialty === "DMS" ? 1 : null;
        localStorage.setItem("enstp-go-email", p.email || "etudiant");
        localStorage.setItem(
          "enstp-go-profile",
          JSON.stringify({ name: p.first_name || "Étudiant", year, dept }),
        );
        setProfile(p);
      });
  }, [userId]);

  if (!ready) return <Shell>Chargement…</Shell>;
  if (userId && profile)
    return (
      <>
        <iframe title="ENSTP Go" src="/guide.html" className="fixed inset-0 h-full w-full border-0" />
        <Assistant />
      </>
    );
  if (userId) return <Shell>Chargement…</Shell>;
  return <AuthFlow />;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/60 px-4 py-10 text-foreground">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl md:grid md:grid-cols-[1.05fr_1fr]">
        <div className="relative h-44 md:h-auto md:min-h-[620px]">
          <img
            src={heroImg}
            alt="Le campus de l’ENSTP"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, color-mix(in oklab, var(--hero-shade) 88%, transparent), color-mix(in oklab, var(--hero-shade) 35%, transparent) 55%, color-mix(in oklab, var(--hero-shade) 15%, transparent))",
            }}
          />
          <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
            <div className="hidden md:block">
              <Brand light />
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mint">
                Votre première année, simplifiée
              </p>
              <p className="mt-2 max-w-[240px] text-lg font-extrabold leading-snug text-white">
                Nouveau chapitre. Nouveaux repères.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/75">
                Campus, démarches et vie étudiante à Alger — tout au même endroit.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-8 sm:px-8 md:px-9 md:py-10">{children}</div>
      </div>
    </main>
  );
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`grid h-10 w-10 place-items-center rounded-full ${
          light ? "bg-white/15 text-white ring-1 ring-white/25" : "bg-primary text-primary-foreground"
        }`}
      >
        <GraduationCap className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span className="leading-none">
        <span
          className={`block text-xl font-extrabold tracking-tight ${
            light ? "text-white" : "text-foreground"
          }`}
        >
          ENSTP <span className={light ? "text-mint" : "text-primary"}>Go</span>
        </span>
        <span
          className={`mt-1.5 block text-[8px] font-bold uppercase tracking-[0.3em] ${
            light ? "text-white/70" : "text-muted-foreground"
          }`}
        >
          Le guide étudiant
        </span>
      </span>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary";
const btnCls =
  "w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

function AuthFlow() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  function go(v: View) {
    setErr("");
    setInfo("");
    setView(v);
  }

  async function onSignUp(e: FormEvent) {
    e.preventDefault();
    setErr("");
    const parsed = signUpSchema.safeParse({ firstName, lastName, email, password });
    if (!parsed.success) return setErr(parsed.error.issues[0]?.message ?? "Champs invalides");
    const d = parsed.data;
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: d.email.toLowerCase(),
      password: d.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { first_name: d.firstName, last_name: d.lastName },
      },
    });
    if (!error && !data.session) {
      await supabase.auth.signInWithPassword({ email: d.email.toLowerCase(), password: d.password });
    }
    setBusy(false);
    if (error) return setErr(translate(error.message));
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setErr("");
    const em = email.trim().toLowerCase();
    if (!z.string().email().safeParse(em).success) return setErr("Email invalide");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: em, password });
    setBusy(false);
    if (error) return setErr(translate(error.message));
  }

  async function onForgot(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo("");
    const em = email.trim().toLowerCase();
    if (!z.string().email().safeParse(em).success) return setErr("Email invalide");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(em, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return setErr(translate(error.message));
    setInfo("Si un compte existe avec cet email, un lien de réinitialisation vient d’être envoyé. Pensez à vérifier vos spams.");
  }

  return (
    <Shell>
      <div className="md:hidden">
        <Brand />
      </div>
      {view === "forgot" ? (
        <>
          <h1 className="mt-3 text-2xl font-extrabold md:mt-0">Mot de passe oublié</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Entrez votre email : nous vous enverrons un lien pour choisir un nouveau mot de passe.
          </p>
          <form onSubmit={onForgot} className="mt-6 grid gap-4" noValidate>
            <Field label="Email">
              <input className={inputCls} type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <button className={btnCls} disabled={busy}>Envoyer le lien</button>
            <button type="button" onClick={() => go("login")} className="text-xs text-muted-foreground underline">
              Retour à la connexion
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="mt-3 text-2xl font-extrabold md:mt-0">
            {view === "login" ? "Bon retour parmi nous" : "Créer votre compte"}
          </h1>
          <div className="mt-5 grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-semibold">
            {(["login", "signup"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => go(v)}
                className={`rounded-lg py-2 ${view === v ? "bg-card shadow" : "text-muted-foreground"}`}
              >
                {v === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>
          <form onSubmit={view === "login" ? onLogin : onSignUp} className="mt-5 grid gap-4" noValidate>
            {view === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom">
                  <input className={inputCls} value={firstName} maxLength={60} autoComplete="given-name" onChange={(e) => setFirstName(e.target.value)} />
                </Field>
                <Field label="Nom">
                  <input className={inputCls} value={lastName} maxLength={60} autoComplete="family-name" onChange={(e) => setLastName(e.target.value)} />
                </Field>
              </div>
            )}
            <Field label="Email (personnel ou d’école)">
              <input className={inputCls} type="email" dir="ltr" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Mot de passe">
              <input
                className={inputCls}
                type="password"
                autoComplete={view === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {view === "login" && (
              <button type="button" onClick={() => go("forgot")} className="-mt-2 justify-self-end text-xs font-semibold text-primary underline">
                Mot de passe oublié ?
              </button>
            )}
            <button className={btnCls} disabled={busy}>
              {view === "login" ? "Se connecter" : "S’inscrire"}
            </button>
          </form>
        </>
      )}
      {err && <p role="alert" className="mt-4 text-sm font-medium text-destructive">{err}</p>}
      {info && <p className="mt-4 text-sm font-medium text-primary">{info}</p>}
    </Shell>
  );
}

function translate(msg: string) {
  if (/invalid login/i.test(msg)) return "Email ou mot de passe incorrect.";
  if (/already registered|already exists/i.test(msg)) return "Un compte existe déjà avec cet email. Connectez-vous.";
  if (/rate limit|too many/i.test(msg)) return "Trop de tentatives. Patientez une minute puis réessayez.";
  if (/weak|pwned|password/i.test(msg)) return "Mot de passe trop faible. Choisissez-en un plus robuste.";
  return "Une erreur est survenue. Réessayez.";
}
