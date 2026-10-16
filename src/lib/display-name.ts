export type NameParts = {
  first_name?: string | null;
  last_name?: string | null;
  academic_year?: number | null;
  specialty?: string | null;
};

export function yearLabel(y: number | null | undefined): string {
  if (!y) return "";
  return y === 1 ? "1ère année" : `${y}ème année`;
}

/** "[Nom] [Prénom] - [Année] - [Spécialité]" */
export function displayName(p: NameParts | null | undefined, fallback = ""): string {
  if (!p) return fallback;
  const who = `${(p.last_name ?? "").trim()} ${(p.first_name ?? "").trim()}`.trim();
  if (!who) return fallback;
  return [who, yearLabel(p.academic_year), p.specialty ?? ""].filter(Boolean).join(" - ");
}

export function isProfileComplete(p: NameParts | null | undefined): boolean {
  return !!(
    p &&
    p.first_name?.trim() &&
    p.last_name?.trim() &&
    p.academic_year &&
    p.academic_year >= 1 &&
    p.academic_year <= 5 &&
    (p.specialty === "DIB" || p.specialty === "DMS")
  );
}
