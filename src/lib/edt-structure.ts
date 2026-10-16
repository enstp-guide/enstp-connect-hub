// Official ENSTP class structure (S1 2026/2027), used by the timetable filters and the assistant.
export type Unit = { value: string; label: string };
export type Structure = { summary: string; unitName: string; units: Unit[]; note?: string; promo?: boolean };

const range = (n: number, label: (i: number) => string, value = (i: number) => String(i)) =>
  Array.from({ length: n }, (_, k) => ({ value: value(k + 1), label: label(k + 1) }));

const roomNote =
  "Particularité DIB : dans ce planning, les colonnes indiquent directement les numéros de salles (et non des numéros de groupes). Choisissez la salle de votre section.";

export const STRUCTURE: Record<string, Structure> = {
  CP1: { summary: "1ère année Prépa : 10 groupes répartis sur 2 sections", unitName: "Groupe", units: range(10, (i) => `Groupe ${i}`) },
  CP2: { summary: "2ème année Prépa : 12 groupes répartis sur 2 sections", unitName: "Groupe", units: range(12, (i) => `Groupe ${i}`) },
  DIB1: {
    summary: "3ème année DIB : 4 groupes / sections — colonnes = numéros de salles",
    unitName: "Salle",
    units: ["2", "6", "7", "8", "9", "25"].map((r) => ({ value: r, label: `Salle ${r}` })),
    note: roomNote,
  },
  DMS1: { summary: "3ème année DMS : 4 groupes / sections", unitName: "Section", units: range(4, (i) => `Section ${i}`, (i) => `SEC ${i}`) },
  DIB2: {
    summary: "4ème année DIB : 2 sections — colonnes = numéros de salles",
    unitName: "Salle",
    units: ["5", "22", "25", "LABO"].map((r) => ({ value: r, label: r === "LABO" ? "Laboratoire" : `Salle ${r}` })),
    note: roomNote,
  },
  DMS2: { summary: "4ème année DMS : 2 sections", unitName: "Section", units: range(2, (i) => `Section ${i}`, (i) => `Section 0${i}`) },
  DIB3: { summary: "5ème année DIB : 1 promo (promotion complète)", unitName: "Promo", units: [], promo: true },
  DMS3: { summary: "5ème année DMS : 1 promo (promotion complète)", unitName: "Promo", units: [], promo: true },
};

type S = { sections: string[] };
/** A session applies to a unit when it lists it, or when it is common (no specific unit). */
export function sessionMatches(group: string, s: S, unit: string): boolean {
  const st = STRUCTURE[group];
  if (!unit || !st || st.promo) return true;
  const known = new Set(st.units.map((u) => u.value));
  const own = s.sections.filter((x) => known.has(x));
  return own.length === 0 || own.includes(unit);
}

export const STRUCTURE_TEXT = Object.entries(STRUCTURE)
  .map(([id, s]) => `- ${id} : ${s.summary}${s.note ? ` (${s.note})` : ""}`)
  .join("\n");
