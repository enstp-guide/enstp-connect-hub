import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

type Profile = {
  first_name: string;
  last_name: string;
  email: string;
  academic_year: number | null;
  specialty: string | null;
};

function Index() {
  const [userId, setUserId] = useState<string | null>(null);
  const [guideKey, setGuideKey] = useState(0);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
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
        const p: Profile = data ?? { first_name: "", last_name: "", email: "", academic_year: null, specialty: null };
        // Hand the profile to the guide page (same origin).
        const year = p.academic_year ? p.academic_year - 1 : 5;
        const dept = p.specialty === "DIB" ? 0 : p.specialty === "DMS" ? 1 : null;
        localStorage.setItem("enstp-go-email", p.email || "etudiant");
        localStorage.setItem(
          "enstp-go-profile",
          JSON.stringify({ name: p.first_name || "Étudiant", year, dept }),
        );
        // Reload the guide so it picks up the freshly stored profile.
        setGuideKey((k) => k + 1);
      });
  }, [userId]);

  // The guide is public: guests and signed-in students browse it freely.
  return (
    <>
      <iframe key={guideKey} title="ENSTP Go" src="/guide.html" className="fixed inset-0 h-full w-full border-0" />
      <Assistant />
    </>
  );
}
