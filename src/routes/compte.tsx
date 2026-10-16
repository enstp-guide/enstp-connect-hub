import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BackLink } from "@/components/BackLink";
import { displayName } from "@/lib/display-name";

export const Route = createFileRoute("/compte")({
  head: () => ({
    meta: [
      { title: "Mon compte · ENSTP Go" },
      { name: "description", content: "Consultez et modifiez votre nom, email, année d’étude et spécialité sur ENSTP Go." },
      { property: "og:title", content: "Mon compte · ENSTP Go" },
      { property: "og:description", content: "Gérez votre profil étudiant ENSTP Go." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Compte,
});

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary";

function Compte() {
  const [uid, setUid] = useState<string | null | undefined>(undefined);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState(0);
  const [spec, setSpec] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user;
      setUid(u?.id ?? null);
      if (!u) return;
      setEmail(u.email ?? "");
      const { data: p } = await supabase
        .from("profiles")
        .select("first_name,last_name,academic_year,specialty")
        .eq("id", u.id)
        .maybeSingle();
      if (p) {
        setFirst(p.first_name);
        setLast(p.last_name);
        setYear(p.academic_year ?? 0);
        setSpec(p.specialty ?? "");
      }
    });
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!uid || busy) return;
    const f = first.trim(), l = last.trim(), em = email.trim().toLowerCase();
    if (!f || !l) return setMsg("Nom et prénom requis.");
    if (year < 1 || year > 5) return setMsg("Choisissez votre année.");
    if (year > 2 && spec !== "DIB" && spec !== "DMS") return setMsg("Choisissez votre spécialité.");
    setBusy(true);
    setMsg("");
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: f.slice(0, 60), last_name: l.slice(0, 60), academic_year: year, specialty: year > 2 ? spec : null })
      .eq("id", uid);
    let note = error ? `Erreur : ${error.message}` : "Profil enregistré ✅";
    if (!error) {
      const { data } = await supabase.auth.getUser();
      if (em && em !== data.user?.email) {
        const r = await supabase.auth.updateUser({ email: em }, { emailRedirectTo: window.location.origin });
        note = r.error
          ? `Profil enregistré, mais l’email n’a pas pu être changé : ${r.error.message}`
          : "Profil enregistré. Confirmez votre nouvel email via le lien reçu.";
      }
    }
    setBusy(false);
    setMsg(note);
  }

  if (uid === undefined) return <main className="p-8 text-sm text-muted-foreground">Chargement…</main>;
  if (uid === null)
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div>
          <p className="font-semibold">Connectez-vous pour voir votre compte.</p>
          <Link to="/" className="mt-3 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Se connecter</Link>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-8 text-foreground">
      <div className="mx-auto max-w-xl space-y-6">
        <BackLink />
        <header className="rounded-3xl bg-primary p-6 text-primary-foreground">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Mon compte</p>
          <h1 className="mt-1 text-2xl font-extrabold">
            {displayName({ first_name: first, last_name: last, academic_year: year || null, specialty: spec || null }, "Étudiant")}
          </h1>
        </header>
        <form onSubmit={save} className="grid gap-4 rounded-2xl border border-border bg-card p-6" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-semibold">Prénom<input className={inputCls} value={first} maxLength={60} onChange={(e) => setFirst(e.target.value)} /></label>
            <label className="grid gap-1.5 text-sm font-semibold">Nom<input className={inputCls} value={last} maxLength={60} onChange={(e) => setLast(e.target.value)} /></label>
          </div>
          <label className="grid gap-1.5 text-sm font-semibold">Email<input className={inputCls} type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-semibold">Année d’étude
              <select className={inputCls} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                <option value={0}>Choisir…</option>
                <option value={1}>1ère année (Prépa)</option>
                <option value={2}>2ème année (Prépa)</option>
                <option value={3}>3ème année</option>
                <option value={4}>4ème année</option>
                <option value={5}>5ème année</option>
              </select>
            </label>
            {year > 2 && (
              <label className="grid gap-1.5 text-sm font-semibold">Spécialité
                <select className={inputCls} value={spec} onChange={(e) => setSpec(e.target.value)}>
                  <option value="">Choisir…</option>
                  <option value="DIB">DIB – Infrastructures et Bâtiment</option>
                  <option value="DMS">DMS – Matériaux et Structures</option>
                </select>
              </label>
            )}
          </div>
          <button disabled={busy} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
          {msg && <p role="status" className="text-sm font-medium text-primary">{msg}</p>}
        </form>
      </div>
    </main>
  );
}
