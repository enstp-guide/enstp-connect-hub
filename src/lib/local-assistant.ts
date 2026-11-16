// Assistant local d’ENSTP Go : répond à partir des données du site (emplois du temps, salles,
// enseignants, services, guide) sans appeler d’IA, donc sans consommer de crédits.
import edt from "@/lib/edt-data.json";
import { DEPTS, GROUPS, PLACES, WHO_TO_ASK } from "@/lib/enstp-data";
import { STRUCTURE, normalizeSessions, sessionMatches } from "@/lib/edt-structure";
import { GUIDE_KB } from "@/lib/guide-kb";
import { detectLanguage, type Lang } from "@/lib/detect-language";

type Session = {
  day: string;
  start: string;
  end: string;
  subject: string;
  teacher: string;
  room: string;
  kind: string;
  sections: string[];
};
type ClassId = (typeof GROUPS)[number]["id"];
export type AssistantContext = { defaultClass?: string | null };

const DATA = edt as unknown as Record<string, { sessions: Session[] }>;
const DAY_ORDER = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const DAY_NAME: Record<Lang, Record<string, string>> = {
  fr: { Saturday: "Samedi", Sunday: "Dimanche", Monday: "Lundi", Tuesday: "Mardi", Wednesday: "Mercredi", Thursday: "Jeudi", Friday: "Vendredi" },
  en: { Saturday: "Saturday", Sunday: "Sunday", Monday: "Monday", Tuesday: "Tuesday", Wednesday: "Wednesday", Thursday: "Thursday", Friday: "Friday" },
  ar: { Saturday: "السبت", Sunday: "الأحد", Monday: "الإثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة" },
};

const T = {
  fr: {
    hello: "Salut ! 👋 Je réponds à partir des informations du site : emplois du temps, salles, enseignants, modules et services.",
    examples: "Exemples :\n- « Groupe 3 DIB 3ème année dimanche 8h »\n- « Emploi du temps CP1 groupe 5 lundi »\n- « Quand j’ai cours avec Gassis ? »\n- « Où est l’amphi A ? »\n- « À qui m’adresser pour une attestation ? »",
    thanks: "Avec plaisir ! 😊 N’hésite pas si tu as une autre question.",
    noClass: "Dis-moi ta classe pour que je trouve ton emploi du temps : CP1, CP2, DIB 3ème/4ème/5ème année ou DMS 3ème/4ème/5ème année. Exemple : « DIB 3ème année groupe 3 dimanche ».",
    noCourse: "Aucun cours trouvé pour ce créneau.",
    friday: "Le vendredi, il n’y a pas cours. 😉",
    pickGroup: (unit: string, list: string) => `Précise ton ${unit.toLowerCase()} (${list}) pour n’avoir que tes cours.`,
    pdf: "📄 PDF officiel",
    official: "En cas de doute, l’emploi du temps officiel fait foi.",
    teacherNone: "Enseignant non précisé",
    teacherTitle: (n: string) => `Cours avec **${n}** :`,
    subjectTitle: (n: string) => `Séances de **${n}** :`,
    room: "Salle",
    who: "Pour ça, adresse-toi à :",
    unknown: "Je n’ai pas trouvé cette information dans le site. Pour les démarches officielles, adresse-toi à la scolarité ou au secrétariat de ton département.",
    guideFound: "Voici ce que dit le guide du site :",
    roomTitle: (n: string) => `📍 **${n}**`,
    roomClasses: "Cours prévus dans cette salle :",
    more: (n: number) => `… et ${n} autre(s). Précise la classe ou le jour pour affiner.`,
    at: "à",
    next: "Pas de cours à cette heure-là. Cours suivant :",
  },
  en: {
    hello: "Hi! 👋 I answer from the information on this site: timetables, rooms, teachers, modules and services.",
    examples: "Examples:\n- “Group 3 DIB 3rd year Sunday 8am”\n- “CP1 timetable group 5 Monday”\n- “When do I have class with Gassis?”\n- “Where is amphi A?”\n- “Who do I ask for a certificate?”",
    thanks: "You’re welcome! 😊 Ask me anything else.",
    noClass: "Tell me your class so I can find your timetable: CP1, CP2, DIB 3rd/4th/5th year or DMS 3rd/4th/5th year. Example: “DIB 3rd year group 3 Sunday”.",
    noCourse: "No class found for this time slot.",
    friday: "There are no classes on Friday. 😉",
    pickGroup: (unit: string, list: string) => `Tell me your ${unit.toLowerCase()} (${list}) to see only your classes.`,
    pdf: "📄 Official PDF",
    official: "If in doubt, the official timetable prevails.",
    teacherNone: "Teacher not specified",
    teacherTitle: (n: string) => `Classes with **${n}**:`,
    subjectTitle: (n: string) => `**${n}** sessions:`,
    room: "Room",
    who: "For that, contact:",
    unknown: "I couldn’t find this on the site. For official procedures, contact the registrar or your department secretariat.",
    guideFound: "Here is what the site’s guide says:",
    roomTitle: (n: string) => `📍 **${n}**`,
    roomClasses: "Classes scheduled in this room:",
    more: (n: number) => `… and ${n} more. Add the class or the day to narrow it down.`,
    at: "at",
    next: "No class at that time. Next class:",
  },
  ar: {
    hello: "مرحبًا! 👋 أجيب انطلاقًا من معلومات الموقع: جداول التوقيت، القاعات، الأساتذة، المقاييس والمصالح.",
    examples: "أمثلة:\n- « الفوج 3 DIB السنة الثالثة الأحد 8h »\n- « جدول CP1 الفوج 5 الإثنين »\n- « متى عندي حصة مع Gassis؟ »\n- « أين المدرج A؟ »\n- « إلى من أتوجه لشهادة مدرسية؟ »",
    thanks: "العفو! 😊 اسألني متى شئت.",
    noClass: "أخبرني بقسمك لأجد جدولك: CP1، CP2، DIB السنة 3/4/5 أو DMS السنة 3/4/5. مثال: « DIB السنة الثالثة الفوج 3 الأحد ».",
    noCourse: "لا توجد حصة في هذا التوقيت.",
    friday: "لا توجد دروس يوم الجمعة. 😉",
    pickGroup: (_unit: string, list: string) => `حدّد فوجك/قسمك (${list}) لتظهر حصصك فقط.`,
    pdf: "📄 الجدول الرسمي PDF",
    official: "عند الشك، الجدول الرسمي هو المرجع.",
    teacherNone: "الأستاذ غير محدد",
    teacherTitle: (n: string) => `الحصص مع **${n}**:`,
    subjectTitle: (n: string) => `حصص **${n}**:`,
    room: "القاعة",
    who: "لهذا الأمر، توجّه إلى:",
    unknown: "لم أجد هذه المعلومة في الموقع. للإجراءات الرسمية، توجّه إلى مصلحة التمدرس أو أمانة قسمك.",
    guideFound: "هذا ما يقوله دليل الموقع:",
    roomTitle: (n: string) => `📍 **${n}**`,
    roomClasses: "الحصص المبرمجة في هذه القاعة:",
    more: (n: number) => `… و${n} أخرى. حدّد القسم أو اليوم.`,
    at: "على",
    next: "لا توجد حصة في هذا التوقيت. الحصة الموالية:",
  },
} as const;

/** minuscules, sans accents, apostrophes et ponctuation remplacées par des espaces */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'`´]/g, " ")
    .replace(/[^\p{L}\p{N}:]+/gu, " ")
    .trim();
}
const has = (q: string, words: string[]) => words.some((w) => new RegExp(`(^| )${w}( |$)`).test(q));
const toMin = (t: string) => {
  const m = /(\d{1,2})\s*[hH:]\s*(\d{2})?/.exec(t);
  return m ? Number(m[1]) * 60 + Number(m[2] ?? 0) : -1;
};

// ---------- Détection du jour, de l’heure, de la classe et du groupe ----------
const DAY_WORDS: [string, string[]][] = [
  ["Saturday", ["samedi", "saturday", "السبت", "سبت", "لسبت", "sebt", "essebt", "lsebt"]],
  ["Sunday", ["dimanche", "sunday", "الأحد", "الاحد", "لحد", "حد", "lahad", "l7ad", "lhad", "lhed", "l7ed", "el had", "el 7ad"]],
  ["Monday", ["lundi", "monday", "الإثنين", "الاثنين", "الإتنين", "الاتنين", "tnin", "letnin", "etnin", "ltnin", "el tnin", "letnine"]],
  ["Tuesday", ["mardi", "tuesday", "الثلاثاء", "الثلاثا", "تلاتا", "tlata", "tlat", "ttlata", "et tlata", "eltlata", "التلاتا"]],
  ["Wednesday", ["mercredi", "wednesday", "الأربعاء", "الاربعاء", "لاربعا", "larbaa", "larba3", "lerba3", "lerbaa", "larb3a", "الاربعا"]],
  ["Thursday", ["jeudi", "thursday", "الخميس", "لخميس", "khmis", "lkhmis", "lekhmis", "el khmis", "الخميس"]],
  ["Friday", ["vendredi", "friday", "الجمعة", "جمعة", "jemaa", "jem3a", "ljem3a", "ljemaa", "el djemaa"]],
];
const JS_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function findDay(q: string, now: Date = new Date()): string | null {
  const today = now.getDay();
  if (has(q, ["aujourd hui", "aujourdhui", "today", "اليوم", "واليوم", "lyoum", "lyom", "elyoum"])) return JS_DAYS[today]!;
  if (has(q, ["demain", "tomorrow", "غدا", "غدوة", "وغدوة", "وغدا", "ghodwa", "ghedwa", "ghdwa"])) return JS_DAYS[(today + 1) % 7]!;
  for (const [day, words] of DAY_WORDS) if (has(q, words.map(norm))) return day;
  return null;
}

function findTime(raw: string): number | null {
  const s = raw.toLowerCase();
  let m = /(\d{1,2})\s*(?:h|:)\s*(\d{2})?(?![a-z\u00e0-\u00ff])/.exec(s);
  if (m) return Number(m[1]) * 60 + Number(m[2] ?? 0);
  m = /(\d{1,2})\s*(am|pm)\b/.exec(s);
  if (m) {
    let h = Number(m[1]) % 12;
    if (m[2] === "pm") h += 12;
    return h * 60;
  }
  m = /(?:^|\s)(?:a|à|at|vers|3la|ala|f|fi|على|في|الساعة)\s*(\d{1,2})\b(?!\s*(?:e|eme|ème|ere|ère|er|st|nd|rd|th))/.exec(s);
  if (m) {
    const h = Number(m[1]);
    if (h >= 1 && h <= 18) return (h < 7 ? h + 12 : h) * 60;
  }
  return null;
}

function findGroupNumber(q: string): number | null {
  const m = /(?:^| )(?:groupe|group|grp|gr|g|section|sec|s|فوج|الفوج|قسم|القسم|foudj|fouj)\s*0?(\d{1,2})(?: |$)/.exec(q);
  return m ? Number(m[1]) : null;
}

function findYear(q: string): number | null {
  const ord: [number, string[]][] = [
    [1, ["premiere", "1ere", "1er", "first", "1st", "الأولى", "الاولى"]],
    [2, ["deuxieme", "2eme", "2e", "second", "2nd", "الثانية"]],
    [3, ["troisieme", "3eme", "3e", "third", "3rd", "الثالثة"]],
    [4, ["quatrieme", "4eme", "4e", "fourth", "4th", "الرابعة"]],
    [5, ["cinquieme", "5eme", "5e", "fifth", "5th", "الخامسة"]],
  ];
  for (const [y, w] of ord) if (has(q, w.map(norm))) return y;
  const m = /(?:annee|year|سنة|السنة|am)\s*(\d)(?: |$)/.exec(q) ?? /(?:^| )(\d)\s*(?:annee|year|a|am)(?: |$)/.exec(q);
  return m ? Number(m[1]) : null;
}

function findClass(q: string): ClassId | null {
  if (/(^| )(cp ?1|1 ?cp|1 ?acp|acp ?1|prepa ?1)( |$)/.test(q)) return "CP1";
  if (/(^| )(cp ?2|2 ?cp|2 ?acp|acp ?2|prepa ?2)( |$)/.test(q)) return "CP2";
  for (const d of ["dib", "dms"] as const) {
    // « DIB3 » collé = identifiant du site (5ème année)
    const m = new RegExp(`(^| )${d}([1-3])( |$)`).exec(q);
    if (m) return `${d.toUpperCase()}${m[2]}` as ClassId;
  }
  let year = findYear(q);
  const dept = has(q, ["dib"]) ? "DIB" : has(q, ["dms"]) ? "DMS" : null;
  // « DIB 3 » = 3ème année
  if (dept && !year) {
    const m = new RegExp(`(?:^| )${dept.toLowerCase()} ([1-5])(?: |$)`).exec(q);
    if (m) year = Number(m[1]);
  }
  const prepa = has(q, ["prepa", "preparatoire", "preparatoires", "cp", "تحضيري", "تحضيرية"]);
  if (dept) {
    // « 3ème année » = 1ère année ingénieur ; on accepte aussi « 1ère année ingénieur »
    const ing = has(q, ["ingenieur", "ing", "engineering"]);
    if (year && ing && year <= 3) return `${dept}${year}` as ClassId;
    if (year && year >= 3) return `${dept}${year - 2}` as ClassId;
    if (year && year <= 2) return `${dept}${year}` as ClassId;
    return null;
  }
  if (year === 1 || year === 2) return (prepa || !dept ? `CP${year}` : null) as ClassId | null;
  return null;
}

function unitFor(cls: string, n: number | null): string {
  if (n == null) return "";
  const st = STRUCTURE[cls];
  if (!st || st.promo) return "";
  const v = cls === "DMS1" ? `SEC ${n}` : cls === "DMS2" ? `Section 0${n}` : String(n);
  return st.units.some((u) => u.value === v) ? v : "";
}

// ---------- Index des enseignants et des modules ----------
const TITLES = new Set(["mr", "mrs", "mme", "ms", "m", "mlle", "miss", "mle", "dr", "et", "and"]);
type Hit = { cls: string; s: Session };
const ALL: Hit[] = GROUPS.flatMap((g) => normalizeSessions(g.id, DATA[g.id]?.sessions ?? []).map((s) => ({ cls: g.id, s })));

const TEACHERS = new Map<string, { name: string; hits: Hit[] }>();
for (const h of ALL) {
  for (const tok of norm(`${h.s.teacher} ${/practical/i.test(h.s.subject) ? h.s.subject : ""}`).split(" ")) {
    if (tok.length < 4 || TITLES.has(tok) || /\d/.test(tok)) continue;
    const e = TEACHERS.get(tok) ?? { name: tok.toUpperCase(), hits: [] };
    e.hits.push(h);
    TEACHERS.set(tok, e);
  }
}
// mots d’usage courant à ne jamais prendre pour un nom d’enseignant
for (const w of ["practical", "topo", "appl", "geology", "geol", "salle", "labo", "classroom", "section"]) TEACHERS.delete(w);

const SUBJECT_ALIASES: Record<string, string[]> = {
  "proba": ["probabilite", "probabilites", "probabilty", "proba stat"],
  "calculus": ["analyse", "analysis"],
  "algebra": ["algebre"],
  "physics": ["physique"],
  "chemistry": ["chimie"],
  "computer science": ["informatique", "info"],
  "english": ["anglais", "انجليزية", "الانجليزية"],
  "french": ["francais", "فرنسية"],
  "topo": ["topographie"],
  "rational mech": ["mecanique rationnelle", "meca rationnelle"],
  "fluid mechanics": ["mecanique des fluides", "mdf"],
  "general electricity": ["electricite", "electricite generale"],
  "numerical analysis": ["analyse numerique"],
  "lab": ["tp", "travaux pratiques", "laboratoire"],
};
// abréviations de modules trop proches de mots courants
const AMBIGUOUS = new Set(["edt", "td", "tp", "cours", "a", "ia"]);
const SUBJECTS = new Map<string, { label: string; hits: Hit[] }>();
for (const h of ALL) {
  const key = norm(h.s.subject.replace(/\(.*?\)/g, "")).replace(/\b\d+\b/g, "").replace(/\s+/g, " ").trim();
  if (!key || key.length < 2 || AMBIGUOUS.has(key)) continue;
  const e = SUBJECTS.get(key) ?? { label: h.s.subject.replace(/\s*\(.*?\)/g, ""), hits: [] };
  e.hits.push(h);
  SUBJECTS.set(key, e);
}
function findSubject(q: string): { label: string; hits: Hit[] } | null {
  let best: { label: string; hits: Hit[] } | null = null;
  let bestLen = 0;
  for (const [key, e] of SUBJECTS) {
    const keys = [key, ...Object.entries(SUBJECT_ALIASES).filter(([k]) => key.startsWith(k)).flatMap(([, a]) => a)];
    for (const k of keys) {
      if (k.length < 2 || k.length <= bestLen) continue;
      if (!new RegExp(`(^| )${k}( |$)`).test(q)) continue;
      best = e;
      bestLen = k.length;
    }
  }
  return best;
}

// ---------- Mise en forme ----------
const CLASS_LABEL: Record<Lang, Record<string, string>> = {
  fr: {},
  en: {
    CP1: "1st year · Preparatory class (CP1)", CP2: "2nd year · Preparatory class (CP2)",
    DIB1: "DIB · 1st engineering year (3rd year)", DIB2: "DIB · 2nd engineering year (4th year)", DIB3: "DIB · 3rd engineering year (5th year)",
    DMS1: "DMS · 1st engineering year (3rd year)", DMS2: "DMS · 2nd engineering year (4th year)", DMS3: "DMS · 3rd engineering year (5th year)",
  },
  ar: {
    CP1: "السنة الأولى تحضيري (CP1)", CP2: "السنة الثانية تحضيري (CP2)",
    DIB1: "DIB · السنة الثالثة", DIB2: "DIB · السنة الرابعة", DIB3: "DIB · السنة الخامسة",
    DMS1: "DMS · السنة الثالثة", DMS2: "DMS · السنة الرابعة", DMS3: "DMS · السنة الخامسة",
  },
};
const label = (cls: string, lang: Lang = "fr") => CLASS_LABEL[lang][cls] ?? GROUPS.find((g) => g.id === cls)?.label ?? cls;
/** « Groupe 3 » / « Group 3 » / « الفوج 3 », « Section 2 »… */
function uLabel(cls: string, value: string, lang: Lang): string {
  const st = STRUCTURE[cls];
  const fr = st?.units.find((u) => u.value === value)?.label ?? value;
  if (lang === "fr") return fr;
  const n = fr.replace(/^\D+/, "");
  const isSection = /section|sec/i.test(fr);
  if (lang === "en") return `${isSection ? "Section" : "Group"} ${n}`;
  return `${isSection ? "القسم" : "الفوج"} ${n}`;
}
function line(s: Session, lang: Lang, withDay = false, cls?: string): string {
  const t = T[lang];
  const parts = [
    `${withDay ? `${DAY_NAME[lang][s.day]} ` : ""}**${s.start}${s.end ? `–${s.end}` : ""}**`,
    `${s.subject}${s.kind ? ` (${s.kind})` : ""}`,
    s.teacher || t.teacherNone,
    s.room ? (/^\d/.test(s.room) ? `${t.room} ${s.room}` : s.room) : "",
    cls ? label(cls, lang) : "",
  ].filter(Boolean);
  return `- ${parts.join(" · ")}`;
}
const sortS = (a: Session, b: Session) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) || toMin(a.start) - toMin(b.start);
function pdfLink(cls: string, lang: Lang) {
  const g = GROUPS.find((x) => x.id === cls);
  return g ? `\n\n[${T[lang].pdf}](${g.pdf}#page=${g.page}) — ${T[lang].official}` : "";
}

// ---------- Réponses ----------
function timetable(cls: string, unit: string, day: string | null, time: number | null, lang: Lang, subjectFilter?: string): string {
  const t = T[lang];
  const st = STRUCTURE[cls]!;
  let list = normalizeSessions(cls, DATA[cls]?.sessions ?? []).filter((s) => sessionMatches(cls, s, unit));
  if (subjectFilter) list = list.filter((s) => norm(s.subject).includes(subjectFilter));
  if (day) list = list.filter((s) => s.day === day);
  let note = "";
  if (time != null) {
    const now = list.filter((s) => toMin(s.start) <= time && (s.end ? time < toMin(s.end) : toMin(s.start) === time));
    if (!now.length) {
      list = list.filter((s) => toMin(s.start) >= time).sort(sortS).slice(0, 1);
      if (list.length) note = `${t.next}\n\n`;
    } else list = now;
  }
  list.sort(sortS);
  const unitLabel = unit ? uLabel(cls, unit, lang) : "";
  const head = `📅 **${label(cls, lang)}**${unitLabel ? ` — ${unitLabel}` : ""}${day ? ` — ${DAY_NAME[lang][day]}` : ""}${time != null ? ` ${t.at} ${Math.floor(time / 60)}h${String(time % 60).padStart(2, "0")}` : ""}`;
  const grp = (s: Session) =>
    !unit && !st.promo && s.sections.length && s.sections.length <= 3
      ? ` (${s.sections.map((v) => uLabel(cls, v, lang)).join(", ")})`
      : "";
  const body = list.length ? list.map((s) => line(s, lang, !day) + grp(s)).join("\n") : t.noCourse;
  const hint = !unit && !st.promo ? `\n\n${t.pickGroup(st.unitName, st.units.map((u) => u.label.replace(/^\D+/, "")).join(", "))}` : "";
  return `${head}\n\n${note}${body}${hint}${pdfLink(cls, lang)}`;
}

function hitsList(hits: Hit[], cls: string | null, unit: string, day: string | null, lang: Lang): string {
  let h = hits;
  if (cls) h = h.filter((x) => x.cls === cls && sessionMatches(cls, x.s, unit));
  if (day) h = h.filter((x) => x.s.day === day);
  const seen = new Set<string>();
  h = h.filter((x) => {
    const k = `${x.cls}|${x.s.day}|${x.s.start}|${x.s.subject}|${x.s.room}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  h.sort((a, b) => GROUPS.findIndex((g) => g.id === a.cls) - GROUPS.findIndex((g) => g.id === b.cls) || sortS(a.s, b.s));
  if (!h.length) return T[lang].noCourse;
  const max = 15;
  const out = h.slice(0, max).map((x) => {
    const st = STRUCTURE[x.cls];
    const grp = st && !st.promo && x.s.sections.length && x.s.sections.length <= 3 ? ` (${x.s.sections.map((v) => uLabel(x.cls, v, lang)).join(", ")})` : "";
    return `${line(x.s, lang, true, cls ? undefined : x.cls)}${grp}`;
  });
  return out.join("\n") + (h.length > max ? `\n\n${T[lang].more(h.length - max)}` : "");
}

const WHO_KEYS: [RegExp, number][] = [
  [/inscri|certificat|attestation|carte (d )?etudiant|scolarite|شهادة|تسجيل|بطاقة/, 0],
  [/absen|changement de groupe|changer de groupe|emploi du temps faux|غياب|تغيير الفوج/, 1],
  [/note|rattrapage|recours|examen|خطة|نقطة|استدراك|علامات/, 2],
  [/bourse|residence|cite|transport|hebergement|منحة|إقامة|اقامة|نقل/, 3],
  [/stage|convention|partenariat|تربص/, 4],
  [/sante|malade|urgence|medecin|medical|صحة|مريض|طبيب|استعجال/, 5],
];

const HISTORY = {
  fr: `🏛️ **ENSTP « Francis Jeanson »** (Kouba, Alger)\n- 1966 : création de l’EITP\n- 1987 : institut national, double tutelle Enseignement supérieur & Travaux publics\n- 1998 : statut d’école nationale supérieure\n- Aujourd’hui : 6 000+ ingénieurs algériens et 300+ ingénieurs de 32 pays formés\n\n**Cursus :** 2 ans de classes préparatoires, puis 3 ans de cycle ingénieur dans un département :\n- **DIB** — ${DEPTS.DIB}\n- **DMS** — ${DEPTS.DMS}`,
  en: `🏛️ **ENSTP “Francis Jeanson”** (Kouba, Algiers)\n- 1966: EITP founded\n- 1987: national institute (Higher Education & Public Works)\n- 1998: national higher school status\n- Today: 6,000+ Algerian engineers and 300+ engineers from 32 countries trained\n\n**Programme:** 2 preparatory years, then 3 engineering years in a department:\n- **DIB** — ${DEPTS.DIB}\n- **DMS** — ${DEPTS.DMS}`,
  ar: `🏛️ **المدرسة الوطنية العليا للأشغال العمومية « فرانسيس جونسون »** (القبة، الجزائر)\n- 1966: تأسيس EITP\n- 1987: معهد وطني\n- 1998: مدرسة وطنية عليا\n- اليوم: أكثر من 6000 مهندس جزائري و300 مهندس من 32 دولة\n\n**المسار:** سنتان تحضيريتان ثم 3 سنوات في قسم:\n- **DIB** — ${DEPTS.DIB}\n- **DMS** — ${DEPTS.DMS}`,
};

const SUPPORT = {
  fr: "Tu n’es pas seul(e) 💚 Parle à un camarade, un enseignant ou un responsable de ta résidence : demander de l’aide est un premier pas, pas un échec. Le **service médical** de l’école peut aussi t’écouter. En cas d’urgence, contacte les services d’urgence.",
  en: "You’re not alone 💚 Talk to a classmate, a teacher or someone at your residence: asking for help is a first step, not a failure. The school’s **medical service** can also listen. In an emergency, contact emergency services.",
  ar: "لست وحدك 💚 تحدّث مع زميل أو أستاذ أو مسؤول في إقامتك: طلب المساعدة خطوة أولى وليس فشلًا. يمكن أيضًا التوجه إلى **المصلحة الطبية** للمدرسة. في حالة الطوارئ، اتصل بخدمات الاستعجال.",
};

const STOP = new Set(norm("le la les des une un est sont pour avec dans sur que qui quoi quel quelle quels quelles comment ou the is are what where when how which with from your mon ma mes ton ta tes son sa ses je tu il elle on nous vous ils elles ce cette ces au aux du de et en a y il faut peux peut veux bonjour salut svp stp merci please من في على إلى ما هل كيف أين متى").split(" "));
// certaines lignes du guide sont au format « français|english|العربية »
const KB_LINES = GUIDE_KB.split("\n").flatMap((l) => l.split("|")).map((l) => l.trim()).filter((l) => l.length > 20);
const KB_BY_LANG: Record<Lang, string[]> = { fr: [], en: [], ar: [] };
for (const l of KB_LINES) KB_BY_LANG[detectLanguage(l, "fr")].push(l);
function searchGuide(q: string, lang: Lang): string[] {
  // on compare les débuts de mots (« imprimer » ↔ « impression », « print » ↔ « printing »)
  const stems = [...new Set(q.split(" ").filter((w) => w.length >= 4 && !STOP.has(w)).map((w) => w.slice(0, 4)))];
  if (!stems.length) return [];
  const lines = KB_BY_LANG[lang].length ? KB_BY_LANG[lang] : KB_LINES;
  return lines.map((l) => {
    const n = ` ${norm(l)}`;
    return { l, score: stems.filter((w) => n.includes(` ${w}`)).length };
  })
    .filter((x) => x.score >= (stems.length >= 2 ? 2 : 1))
    .sort((a, b) => b.score - a.score || b.l.length - a.l.length)
    .slice(0, 3)
    .map((x) => x.l);
}

// Sujets fréquents, rédigés à partir du guide du site
const TOPICS: { re: RegExp; ans: Record<Lang, string> }[] = [
  {
    re: /imprim|impression|photocop|print|papeter|stationer|طباع|نسخ|قرطاس/,
    ans: {
      fr: "🖨️ **Impression & papeterie**\n- Exporte ton fichier en PDF et vérifie le format, le nombre de pages et couleur / noir et blanc.\n- Cherche les photocopies et papeteries autour de Kouba ; appelle ou passe pour confirmer les services.\n- Demande le prix total, le recto verso et le délai. Pour un plan technique, précise le format et l’échelle.",
      en: "🖨️ **Printing & stationery**\n- Export your file as PDF and check format, page count and colour / black & white.\n- Look for copy shops and stationers around Kouba; call or visit to confirm.\n- Ask for the total cost, double-sided option and turnaround. For a technical drawing, give the format and scale.",
      ar: "🖨️ **الطباعة والقرطاسية**\n- صدّر ملفك بصيغة PDF وتحقق من المقاس وعدد الصفحات والألوان.\n- ابحث عن محلات النسخ والقرطاسية حول القبة واتصل لتأكيد الخدمات.\n- اسأل عن السعر الإجمالي والطباعة على الوجهين والآجال. للمخطط التقني حدّد المقاس والسلّم.",
    },
  },
  {
    re: /manger|restau|repas|cantine|dejeuner|diner|nourriture|food|eat|lunch|boulanger|superette|مطعم|أكل|اكل|طعام/,
    ans: {
      fr: "🍽️ **Manger**\n- Le **restaurant universitaire** est ouvert aussi les week-ends et pendant les vacances ; le **Foyer** propose snacks et provisions le soir.\n- Autour de la rue Sidi Garidi : restaurants, boulangeries et supérettes. Vérifie le menu et le prix avant de commander, et demande les bonnes adresses à ta promo.",
      en: "🍽️ **Eating**\n- The **university restaurant** is also open on weekends and holidays; the **Foyer** sells snacks and basics in the evening.\n- Around rue Sidi Garidi: restaurants, bakeries and mini-markets. Check the menu and price first, and ask classmates for good spots.",
      ar: "🍽️ **الأكل**\n- **المطعم الجامعي** مفتوح أيضًا في نهاية الأسبوع والعطل، و**الفوييه** يوفر وجبات خفيفة مساءً.\n- حول شارع سيدي قاريدي: مطاعم ومخابز ومحلات. تحقق من السعر قبل الطلب واسأل زملاءك.",
    },
  },
  {
    re: /(^| )(bus|autobus|trajet|metro|tram|taxi|arret|venir a l ecole|aller a l ecole|حافلة|ترامواي|ميترو)/,
    ans: {
      fr: "🚌 **Venir à l’ENSTP** (rue Sidi Garidi, Kouba)\n- Mets « ENSTP Kouba Alger » comme destination dans ton appli de cartes et compare les options depuis ton point de départ.\n- Confirme les lignes et les arrêts sur place ou auprès des opérateurs (le site ne publie pas d’horaires non vérifiés).\n- Repère ton arrêt dans les deux sens et renseigne-toi sur le dernier départ.",
      en: "🚌 **Getting to ENSTP** (rue Sidi Garidi, Kouba)\n- Set “ENSTP Kouba Algiers” as destination in your map app and compare options.\n- Confirm lines and stops on site or with operators (no unverified schedules are published).\n- Locate your stop in both directions and check the last departure.",
      ar: "🚌 **الوصول إلى المدرسة** (شارع سيدي قاريدي، القبة)\n- استعمل « ENSTP Kouba Alger » كوجهة في تطبيق الخرائط وقارن الخيارات.\n- تأكد من الخطوط والمحطات في الموقع أو لدى المتعاملين.\n- حدد محطتك في الاتجاهين واستعلم عن آخر انطلاق.",
    },
  },
  {
    re: /garidi|residence|(^| )cite( |$)|chambre|hebergement|dortoir|إقامة|اقامة|الحي الجامعي/,
    ans: {
      fr: "🏠 **Résidence universitaire Garidi 1**\n- À apporter : literie complète, ustensiles (assiettes, cuillères, verres), produits d’hygiène.\n- Entrée principale avec contrôle de la carte ; démarches d’hébergement auprès de l’administration de la résidence.\n- Restaurant universitaire ouvert le week-end, Foyer le soir, cafétéria, terrain multisports, salle de prière.\n- Pour la bourse, la chambre ou le transport : **Œuvres universitaires**.",
      en: "🏠 **Garidi 1 University Residence**\n- Bring: full bedding, utensils (plates, spoons, glasses), toiletries.\n- Main entrance with ID check; housing procedures with the residence administration.\n- University restaurant open on weekends, Foyer in the evening, cafeteria, multisports field, prayer room.\n- For grants, rooms or transport: **Œuvres universitaires**.",
      ar: "🏠 **الإقامة الجامعية قاريدي 1**\n- أحضر: فراشًا كاملًا، أدوات الأكل، مواد النظافة.\n- المدخل الرئيسي مع التحقق من البطاقة؛ إجراءات الإيواء لدى إدارة الإقامة.\n- مطعم جامعي مفتوح في نهاية الأسبوع، فوييه مساءً، كافتيريا، ملعب متعدد الرياضات، مصلى.\n- للمنحة أو الغرفة أو النقل: **الخدمات الجامعية**.",
    },
  },
  {
    re: /sport|foot|basket|volley|running|courir|muscu|gym|رياضة|كرة/,
    ans: {
      fr: "⚽ **Sport**\n- Les terrains sont au fond du campus, derrière les blocs pédagogiques ; demande à l’école les règles d’utilisation.\n- Football, running, basket : renseigne-toi auprès des clubs et de ta promo. Un « ENSTP Running Club » est une idée à organiser.\n- À la résidence Garidi : terrain multisports (foot, basket, volley, course).",
      en: "⚽ **Sports**\n- The fields are at the back of the campus, behind the teaching blocks; ask the school about the rules.\n- Football, running, basketball: ask clubs and classmates. An “ENSTP Running Club” is an idea to organise.\n- At Garidi residence: multisports field.",
      ar: "⚽ **الرياضة**\n- الملاعب في آخر الحرم خلف الأجنحة البيداغوجية؛ اسأل المدرسة عن قواعد الاستعمال.\n- كرة القدم، الجري، كرة السلة: اسأل النوادي وزملاءك.\n- في إقامة قاريدي: ملعب متعدد الرياضات.",
    },
  },
  {
    re: /casbah|jardin|hamma|sortie|sortir|visiter|balade|tourisme|notre dame|weekend|week end|القصبة|حديقة|نزهة/,
    ans: {
      fr: "🌳 **Découvrir Alger**\n- **Jardin d’Essai du Hamma** : vérifie les conditions d’accès et les horaires.\n- **La Casbah et le centre d’Alger** : patrimoine et rues historiques, idéalement avec quelqu’un qui connaît.\n- **Notre-Dame d’Afrique** : confirme les modalités de visite.\n- Prévois ton transport aller-retour et vérifie les tarifs.",
      en: "🌳 **Discover Algiers**\n- **Jardin d’Essai du Hamma**: check access and opening hours.\n- **The Casbah & downtown**: heritage and historic streets, ideally with a guide.\n- **Notre-Dame d’Afrique**: confirm visiting arrangements.\n- Plan your round trip and check prices.",
      ar: "🌳 **اكتشف الجزائر**\n- **حديقة التجارب بالحامة**: تحقق من شروط الدخول والمواعيد.\n- **القصبة ووسط المدينة**: تراث وشوارع تاريخية.\n- **السيدة الإفريقية**: تأكد من شروط الزيارة.\n- خطط لنقلك ذهابًا وإيابًا.",
    },
  },
  {
    re: /pharmac|medicament|صيدلية|دواء/,
    ans: {
      fr: "💊 **Pharmacie** : cherche une pharmacie autour de la rue Sidi Garidi (Kouba) et confirme ses horaires. En cas de danger immédiat, contacte les services d’urgence ou le personnel de l’école ; pour la santé, le **service médical** de l’école.",
      en: "💊 **Pharmacy**: look for one around rue Sidi Garidi (Kouba) and confirm its hours. In immediate danger, call emergency services or school staff; for health matters, the school’s **medical service**.",
      ar: "💊 **الصيدلية**: ابحث عن صيدلية حول شارع سيدي قاريدي (القبة) وتأكد من مواعيدها. في حالة خطر فوري، اتصل بالاستعجالات أو بموظفي المدرسة.",
    },
  },
];
const LIBRARY = {
  fr: "\n\n📚 Horaires : **09:00 – 15:30**, carte d’étudiant obligatoire. Inscris-toi en ligne pour y accéder. Pour le quitus, règle d’abord la bibliothèque puis passe à l’administration avec ta carte.",
  en: "\n\n📚 Hours: **09:00 – 15:30**, student card required. Register online for access. For clearance, settle the library first, then the administration.",
  ar: "\n\n📚 التوقيت: **09:00 – 15:30**، بطاقة الطالب إلزامية. سجّل عبر الإنترنت. لبراءة الذمة، سوِّ وضعيتك مع المكتبة أولاً ثم الإدارة.",
};

type Parsed = {
  q: string;
  day: string | null;
  time: number | null;
  groupN: number | null;
  askedGroup: boolean;
  explicitClass: ClassId | null;
  cls: ClassId | null;
  teacherTok: string | undefined;
};

/** Réponse aux questions « classiques » une fois la question analysée. */
function core(p: Parsed, lang: Lang): string {
  const t = T[lang];
  const { q, day, time, groupN, explicitClass, cls } = p;
  const unit = cls ? unitFor(cls, groupN) : "";

  // 1) Un enseignant est cité → ses cours
  const teacherTok = p.teacherTok;
  if (teacherTok) {
    const e = TEACHERS.get(teacherTok)!;
    return `${t.teacherTitle(e.name)}\n\n${hitsList(e.hits, explicitClass, explicitClass ? unit : "", day, lang)}`;
  }

  // 2) Lieu : « où est l’amphi A », « salle 19 », « bibliothèque »…
  const wantsPlace = has(q, ["ou", "where", "trouver", "aller", "acceder", "chemin", "itineraire", "أين", "وين", "win", "wine", "fin", "kayen", "kayna", "كاين", "كاينة"]);
  const topic = TOPICS.find((x) => x.re.test(q));
  if (topic && !explicitClass && day == null && time == null) return topic.ans[lang];
  const who = WHO_KEYS.find(([re]) => re.test(q));
  if (who && !wantsPlace && !explicitClass && day == null) {
    const w = WHO_TO_ASK[who[1]]!;
    const extra = searchGuide(q, lang);
    return `${t.who} **${w.who}** (${w.problem}).${extra.length ? `\n\n${t.guideFound}\n\n${extra.map((l) => `- ${l}`).join("\n")}` : ""}`;
  }
  const place = PLACES.find((p) => {
    const n = norm(p.name);
    if (p.id === "amphi-a") return /amphi(theatre)? a( |$)|مدرج a/.test(q);
    if (p.id === "amphi-b") return /amphi(theatre)? b( |$)|مدرج b/.test(q);
    if (p.id === "biblio") return /biblio|library|مكتبة/.test(q);
    if (p.id === "scolarite") return /scolarite|administration|registrar|تمدرس|ادارة|إدارة/.test(q);
    if (p.id === "sport") return /sport|terrain|stade|ملعب|رياضة/.test(q);
    if (p.id === "labo-info") return /salle informatique|labo info|computer lab/.test(q);
    if (p.id === "labo-phys") return /labo(ratoire)? (de )?physique|physics lab/.test(q);
    if (p.id === "labo-chim") return /labo(ratoire)? (de )?chimie|chemistry lab/.test(q);
    if (p.id === "labo-meca") return /labo(ratoire)? (de )?(mecanique|sols)|halle/.test(q);
    return q.includes(n);
  });
  const roomNum = /(?:^| )(?:salle|room|classroom|قاعة|القاعة)\s*(\d{1,2})(?: |$)/.exec(q)?.[1];
  if (place || (roomNum && (wantsPlace || !day))) {
    const p = place ?? PLACES.find((x) => x.id === "salles")!;
    let ans = `${t.roomTitle(roomNum && !place ? `${t.room} ${roomNum}` : p.name)} — ${p.zone}\n\n${p.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
    if (p.id === "biblio") ans += LIBRARY[lang];
    if (roomNum) {
      const hits = ALL.filter((h) => norm(h.s.room).split(" ").includes(roomNum) && (!cls || h.cls === cls));
      if (hits.length) ans += `\n\n${t.roomClasses}\n${hitsList(hits, null, "", day, lang)}`;
    }
    return ans;
  }

  // 3) Emploi du temps (classe, groupe, jour, heure ou mots-clés)
  const subject = findSubject(q);
  const wantsTimetable =
    day != null || time != null || p.askedGroup || explicitClass != null ||
    has(q, ["emploi", "edt", "cours", "planning", "timetable", "schedule", "class", "classes", "seance", "td", "tp", "جدول", "حصة", "حصص", "درس", "دروس"]);
  if (day === "Friday") return t.friday;
  if (wantsTimetable && !subject) {
    if (!cls) return t.noClass;
    return timetable(cls, unit, day, time, lang);
  }

  // 4) Un module est cité → ses séances
  if (subject) {
    if (cls && subject.hits.some((h) => h.cls === cls)) {
      const key = norm(subject.label).replace(/\b\d+\b/g, "").trim();
      return `${t.subjectTitle(subject.label)}\n\n${timetable(cls, unit, day, time, lang, key)}`;
    }
    return `${t.subjectTitle(subject.label)}\n\n${hitsList(subject.hits, null, "", day, lang)}`;
  }


  // 6) L’école, son histoire, ses départements
  if (has(q, ["histoire", "history", "dib", "dms", "departement", "departements", "cursus", "تاريخ", "الأقسام", "الاقسام"]) || /fond(e|ee|ation)|cree|c est quoi (l )?enstp|what is enstp|presentation/.test(q))
    return HISTORY[lang];

  // 6 bis) Moral, isolement
  if (/(^| )(seul|seule|isole|isolee|triste|deprim|stress|angoiss|lonely|sad|alone|وحيد|وحيدة|حزين|قلق)/.test(q))
    return SUPPORT[lang];

  // 7) Salutations
  if (/^(salut|bonjour|bonsoir|hello|hi|hey|salam|slm|cc|coucou|السلام|مرحبا|اهلا|أهلا)/.test(q)) return `${t.hello}\n\n${t.examples}`;

  // 8) Recherche dans le guide du site
  const found = searchGuide(q, lang);
  if (found.length) return `${t.guideFound}\n\n${found.map((l) => `- ${l}`).join("\n")}`;

  return `${t.unknown}\n\n${t.examples}`;
}

// ======================================================================
// Couche « conversation » : salutations, mémoire de la discussion,
// questions de suivi (« et lundi ? », « 3 »), prochain cours, fautes de frappe.
// ======================================================================

export type Intent = "tt" | "now" | "next" | "first" | "last";
export type Memory = {
  cls?: string | null;
  group?: number | null;
  day?: string | null;
  time?: number | null;
  intent?: Intent | null;
  pending?: "class" | "group" | null;
};
export type Reply = { text: string; memory: Memory; chips: string[] };
export type ChatContext = AssistantContext & { firstName?: string | null; memory?: Memory; now?: Date };

const X = {
  fr: {
    hi: (n: string) => `Salut${n ? ` ${n}` : ""} ! 👋 Je suis l’assistant ENSTP Go. Demande-moi ton emploi du temps, ton prochain cours, une salle, un prof ou un service.`,
    howAreYou: "Ça va bien, merci ! 😊 Et toi ? Dis-moi ce dont tu as besoin : ton prochain cours, une salle, un prof…",
    whoAmI: "Je suis l’assistant d’ENSTP Go 🤖. Je connais les emplois du temps de toutes les classes, les salles, les enseignants et les services de l’école.",
    askClass: "Tu es dans quelle classe ? 🙂",
    askGroup: (u: string) => `C’est quel ${u.toLowerCase()} ? Réponds juste avec le numéro.`,
    nowNone: "Tu n’as pas cours en ce moment. 🎉",
    nextTitle: "⏭️ **Ton prochain cours :**",
    nowTitle: "🟢 **En ce moment :**",
    firstTitle: (d: string) => `🌅 **Premier cours ${d} :**`,
    lastTitle: (d: string) => `🏁 **Dernier cours ${d} :**`,
    noMore: "Aucun cours trouvé dans les prochains jours.",
    chips: { next: "Mon prochain cours", today: "Aujourd’hui", tomorrow: "Demain", place: "Où est l’amphi A ?", who: "À qui m’adresser ?", help: "Que sais-tu faire ?" },
    group: "Groupe",
    today: "aujourd’hui",
    of: (d: string) => `du ${d.toLowerCase()}`,
  },
  en: {
    hi: (n: string) => `Hi${n ? ` ${n}` : ""}! 👋 I’m the ENSTP Go assistant. Ask me for your timetable, your next class, a room, a teacher or a service.`,
    howAreYou: "I’m doing well, thanks! 😊 How about you? Tell me what you need: your next class, a room, a teacher…",
    whoAmI: "I’m the ENSTP Go assistant 🤖. I know every class’s timetable, the rooms, the teachers and the school services.",
    askClass: "Which class are you in? 🙂",
    askGroup: (u: string) => `Which ${u.toLowerCase()}? Just reply with the number.`,
    nowNone: "You have no class right now. 🎉",
    nextTitle: "⏭️ **Your next class:**",
    nowTitle: "🟢 **Right now:**",
    firstTitle: (d: string) => `🌅 **First class ${d}:**`,
    lastTitle: (d: string) => `🏁 **Last class ${d}:**`,
    noMore: "No class found in the coming days.",
    chips: { next: "My next class", today: "Today", tomorrow: "Tomorrow", place: "Where is amphi A?", who: "Who should I ask?", help: "What can you do?" },
    group: "Group",
    today: "today",
    of: (d: string) => `on ${d}`,
  },
  ar: {
    hi: (n: string) => `مرحبًا${n ? ` ${n}` : ""}! 👋 أنا مساعد ENSTP Go. اسألني عن جدولك، حصتك القادمة، قاعة، أستاذ أو مصلحة.`,
    howAreYou: "بخير، شكرًا! 😊 وأنت؟ أخبرني بما تحتاج: حصتك القادمة، قاعة، أستاذ…",
    whoAmI: "أنا مساعد ENSTP Go 🤖. أعرف جداول كل الأقسام، القاعات، الأساتذة ومصالح المدرسة.",
    askClass: "في أي قسم تدرس؟ 🙂",
    askGroup: (_u: string) => "ما هو رقم فوجك؟ أجب بالرقم فقط.",
    nowNone: "ليس لديك حصة الآن. 🎉",
    nextTitle: "⏭️ **حصتك القادمة:**",
    nowTitle: "🟢 **الآن:**",
    firstTitle: (d: string) => `🌅 **أول حصة ${d}:**`,
    lastTitle: (d: string) => `🏁 **آخر حصة ${d}:**`,
    noMore: "لا توجد حصص في الأيام القادمة.",
    chips: { next: "حصتي القادمة", today: "اليوم", tomorrow: "غدًا", place: "أين المدرج A؟", who: "إلى من أتوجه؟", help: "ماذا تستطيع أن تفعل؟" },
    group: "الفوج",
    today: "اليوم",
    of: (d: string) => `يوم ${d}`,
  },
};

// Petites phrases en darija algérienne (lettres latines) quand l’étudiant écrit en darija
const DZ = {
  hi: (n: string) => `Wesh${n ? ` ${n}` : ""} ! 👋 Ana l’assistant ta3 ENSTP Go. Sa9sini 3la l’emploi du temps, le prochain cours, la salle, le prof wela les services.`,
  hiShort: (n: string) => `Wesh${n ? ` ${n}` : ""} ! 👋`,
  howAreYou: "Labas el hamdoulah 😊 w nta ? Wach t7taj : le prochain cours, une salle, un prof… ?",
  thanks: "Bla mzia khouya 😊 Ila 3andek sou2al akhor, rani hna !",
  whoAmI: "Ana l’assistant ta3 ENSTP Go 🤖. Na3ref les emplois du temps ta3 ga3 les classes, les salles, les profs w les services ta3 l’école.",
  askClass: "F wach men classe rak ? 🙂",
  askGroup: "Wach men groupe ? Ekteb ghir le numéro.",
  nowNone: "Ma3andekch cours dorka 🎉",
  nextTitle: "⏭️ **Le cours li jay :**",
  noMore: "Ma lgit hta cours f les jours li jayin.",
};
const DZ_EXAMPLES = "Ex :\n- « 3andi cours ghodwa ? DIB 3ème groupe 3 »\n- « Wach 3andi dorka ? »\n- « Win kayen l’amphi A ? »\n- « Chkoun prof ta3 SOM ? »\n- « Wa9tach nkhrej lyoum ? »";

const CLASS_CHIPS: Record<Lang, string[]> = {
  fr: ["CP1", "CP2", "DIB 3ème année", "DIB 4ème année", "DIB 5ème année", "DMS 3ème année", "DMS 4ème année", "DMS 5ème année"],
  en: ["CP1", "CP2", "DIB 3rd year", "DIB 4th year", "DIB 5th year", "DMS 3rd year", "DMS 4th year", "DMS 5th year"],
  ar: ["CP1", "CP2", "DIB السنة الثالثة", "DIB السنة الرابعة", "DIB السنة الخامسة", "DMS السنة الثالثة", "DMS السنة الرابعة", "DMS السنة الخامسة"],
};

function lev(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const d = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = d[0]!;
    d[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = d[j]!;
      d[j] = Math.min(d[j]! + 1, d[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[b.length]!;
}

const FR_DAYS: [string, string][] = [
  ["samedi", "Saturday"], ["dimanche", "Sunday"], ["lundi", "Monday"], ["mardi", "Tuesday"],
  ["mercredi", "Wednesday"], ["jeudi", "Thursday"], ["vendredi", "Friday"],
  ["saturday", "Saturday"], ["sunday", "Sunday"], ["monday", "Monday"], ["tuesday", "Tuesday"],
  ["wednesday", "Wednesday"], ["thursday", "Thursday"], ["friday", "Friday"],
];
/** « dimanch », « lundy », « mercredie »… */
function fuzzyDay(q: string): string | null {
  for (const w of q.split(" ")) {
    if (w.length < 5) continue;
    for (const [name, day] of FR_DAYS) if (lev(w, name) <= 1) return day;
  }
  return null;
}

const TEACHER_CUE = /(^| )(prof|profs|professeur|enseignant|enseignante|teacher|mr|mme|mrs|madame|monsieur|avec|with|استاذ|الاستاذ|الأستاذ|استاذة|الأستاذة|m3a|maa|chkoun|chkon|chkun|شكون|ostad|ostada|ostadh|lprof|leprof)( |$)/;
function findTeacher(q: string): string | undefined {
  const toks = q.split(" ");
  const exact = toks.find((w) => TEACHERS.has(w));
  if (exact) return exact;
  // nom mal orthographié : seulement si la phrase parle d’un prof ou ne contient qu’un mot
  if (!TEACHER_CUE.test(q) && toks.length > 1) return undefined;
  for (const w of toks) {
    if (w.length < 5 || STOP.has(w)) continue;
    let best: string | undefined;
    let bestD = 9;
    for (const k of TEACHERS.keys()) {
      const d = lev(w, k);
      if (d < bestD && d <= (k.length >= 8 ? 2 : 1)) {
        best = k;
        bestD = d;
      }
    }
    if (best) return best;
  }
  return undefined;
}

const GREET = /^(salut|slt|bonjour|bonsoir|bjr|hello|hi|hey|yo|salam|slm|assalam|cc|coucou|wesh|wech|ahlan|ahla|marhaba|salamou alaykoum|salam alikoum|slm alikoum|السلام عليكم|السلام|سلام|مرحبا|اهلا|أهلا)( |$)/;
const HOW = /(^| )(ca va|cv|comment vas tu|comment tu vas|labas|la bas|labes|kirak|kiraki|kirakom|wesh rak|wech rak|wach rak|wesh raki|cv ou pas|cava|how are you|how r u|كيف حالك|لاباس|واش راك|واش راكي|كيراك)( |$)/;
const WHO_AM_I = /(qui es tu|t es qui|tu es qui|c est quoi ton nom|who are you|what are you|شكون نتا|من انت|من أنت)/;
const HELP = /^(aide|help|menu|que sais tu faire|tu sais faire quoi|tu peux faire quoi|what can you do|مساعدة|ماذا تستطيع)/;
const THANKS = /^(merci|mrc|thanks|thank you|thx|ty|شكرا|saha|sahit|sa7it|yatik saha|ya3tik saha|yatik sa7a|barakallah|baraka allah|baraka allahou fik|يعطيك الصحة|صحيت|بارك الله)/;
const OK = /^(ok|okay|d accord|dac|parfait|super|cool|top|nice|great|wakha|wah|ih|mlih|bien|s7i7|sah|واخا|مليح|صح|إيه|ايه)( |$)/;

function nowParts(now: Date): { day: string; min: number } {
  return { day: JS_DAYS[now.getDay()]!, min: now.getHours() * 60 + now.getMinutes() };
}

function sessionsFor(cls: string, unit: string): Session[] {
  return normalizeSessions(cls, DATA[cls]?.sessions ?? []).filter((s) => sessionMatches(cls, s, unit)).sort(sortS);
}

function nextSession(cls: string, unit: string, now: Date): Session[] {
  const { min } = nowParts(now);
  const all = sessionsFor(cls, unit).filter((s) => s.end);
  const order = [...JS_DAYS.slice(now.getDay()), ...JS_DAYS.slice(0, now.getDay())];
  for (let i = 0; i < order.length; i++) {
    const d = order[i]!;
    const list = all.filter((s) => s.day === d && (i > 0 || toMin(s.start) > min));
    if (list.length) {
      const first = toMin(list[0]!.start);
      return list.filter((s) => toMin(s.start) === first);
    }
  }
  return [];
}

function suffix(cls: string, unit: string, lang: Lang): string {
  const st = STRUCTURE[cls]!;
  const u = unit && !st.promo ? uLabel(cls, unit, lang) : "";
  return `📅 ${label(cls, lang)}${u ? ` — ${u}` : ""}`;
}

function defaultChips(lang: Lang): string[] {
  const c = X[lang].chips;
  return [c.next, c.today, c.tomorrow, c.place, c.who];
}

/** Point d’entrée de la conversation : réponse + mémoire mise à jour + suggestions. */
export function localReply(raw: string, lang: Lang, ctx: ChatContext = {}): Reply {
  const t = T[lang];
  const x = X[lang];
  const mem: Memory = { ...(ctx.memory ?? {}) };
  const now = ctx.now ?? new Date();
  const name = (ctx.firstName ?? "").trim();
  const dz = isDarija(raw);
  let q = norm(raw);

  if (!q) return { text: `${x.hi(name)}\n\n${t.examples}`, memory: mem, chips: [...defaultChips(lang), X[lang].chips.help] };

  // « ça va ? », puis salutation seule ou salutation + question
  const asksHow = HOW.test(q);
  if (asksHow) q = q.replace(HOW, " ").replace(/\s+/g, " ").trim();
  const greeted = GREET.test(q);
  if (greeted) q = q.replace(GREET, " ").trim();
  const hiText = dz ? `${DZ.hi(name)}\n\n${DZ_EXAMPLES}` : `${x.hi(name)}\n\n${t.examples}`;
  if (!q) return { text: asksHow ? (dz ? DZ.howAreYou : x.howAreYou) : hiText, memory: mem, chips: defaultChips(lang) };
  if (THANKS.test(q)) return { text: dz ? DZ.thanks : t.thanks, memory: mem, chips: defaultChips(lang) };
  if (OK.test(q) && q.split(" ").length <= 2) return { text: dz ? DZ.thanks : t.thanks, memory: mem, chips: defaultChips(lang) };
  if (WHO_AM_I.test(q) || /(^| )(chkoun nta|chkoun enta|chkon nta|شكون نتا)( |$)/.test(q)) return { text: `${dz ? DZ.whoAmI : x.whoAmI}\n\n${dz ? DZ_EXAMPLES : t.examples}`, memory: mem, chips: defaultChips(lang) };
  if (HELP.test(q)) return { text: hiText, memory: mem, chips: defaultChips(lang) };
  const hello = greeted ? (dz ? `${DZ.hiShort(name)}\n\n` : `${x.hi(name).split("!")[0]}! 👋\n\n`) : "";

  // Analyse de la question
  let day = findDay(q, now) ?? fuzzyDay(q);
  let time = findTime(raw);
  let groupN = findGroupNumber(q);
  const askedGroup = groupN != null || /^(\d{1,2})$/.test(q);
  const explicitClass = findClass(q);
  const teacherTok = findTeacher(q);

  // Réponse courte à une question que j’ai posée (« 3 », « CP1 »…)
  const bare = /^(\d{1,2})$/.exec(q);
  if (bare && (mem.pending === "group" || mem.cls)) groupN = Number(bare[1]);

  let intent: Intent | null = null;
  if (/(^| )(maintenant|now|right now|actuellement|en ce moment|daba|دابا|الآن|الان|توا|tawa|drok|drk|dork|dorka|doka|dorok|derwek|darok|ضرك|دروك|درك|دوكا|ذرك)( |$)/.test(q)) intent = "now";
  else if (/(^| )(prochain|prochaine|next|suivant|suivante|الموالية|القادمة|القادم|الجاية|الجايه|جاية|jaya|jaia|jay|jaye|li jay|li jaya|mba3d|mbe3d|من بعد|مبعد)( |$)/.test(q)) intent = "next";
  else if (/(^| )(commence|commencer|premier cours|first class|start|debut|يبدا|نبدا|تبدا|nebda|tebda|nbda|nebdaw|bkri|sbah)( |$)/.test(q)) intent = "first";
  else if (/(^| )(fini|finis|finit|finir|termine|terminer|dernier cours|last class|finish|نكمل|نخلص|نخرج|نكملو|nkamel|nekmel|nkmel|nekhles|nkhles|nkhrej|nekhrej|nkhorj|nfini|nfinir)( |$)/.test(q)) intent = "last";

  // Mémoire : on complète ce qui manque avec la discussion précédente
  const followUp = !explicitClass && (day != null || time != null || groupN != null || intent != null || bare != null || /^(et|and|w|ou|و) /.test(q));
  let cls: ClassId | null = explicitClass ?? (mem.cls && STRUCTURE[mem.cls] ? mem.cls : null) ?? (ctx.defaultClass && STRUCTURE[ctx.defaultClass] ? ctx.defaultClass : null);
  if (mem.pending === "class" && explicitClass) {
    day = day ?? mem.day ?? null;
    time = time ?? mem.time ?? null;
    intent = intent ?? mem.intent ?? null;
  }
  if (groupN == null && cls && cls === mem.cls) groupN = mem.group ?? null;
  if (followUp && !day && (time != null || intent === "first" || intent === "last") && mem.day) day = mem.day;
  if (askedGroup && mem.pending === "group" && !explicitClass) {
    day = day ?? mem.day ?? null;
    time = time ?? mem.time ?? null;
    intent = intent ?? mem.intent ?? null;
  }

  const wantsSchedule =
    intent != null || day != null || time != null || explicitClass != null || (askedGroup && !teacherTok) ||
    has(q, ["emploi", "edt", "planning", "timetable", "schedule", "جدول", "جدولي", "programme", "lprogramme", "حصة", "الحصة", "حصتي", "حصص", "الحصص", "cours", "3andi", "andi", "3andna", "عندي", "عندنا", "القراية", "9raya", "qraya", "nakra", "n9ra", "neqra", "نقرا", "نقراو"]);

  if (wantsSchedule && !teacherTok) {
    if (!cls) {
      return {
        text: `${hello}${dz ? DZ.askClass : x.askClass}`,
        memory: { ...mem, pending: "class", day, time, intent: intent ?? "tt", group: groupN },
        chips: CLASS_CHIPS[lang],
      };
    }
    const st = STRUCTURE[cls]!;
    const unit = unitFor(cls, groupN);
    const newMem: Memory = { cls, group: unit ? groupN : null, day, time, intent: intent ?? "tt", pending: null };
    const groupChips = !unit && !st.promo ? st.units.map((u) => uLabel(cls!, u.value, lang)) : [];
    const askGroup = !unit && !st.promo ? `\n\n${dz ? DZ.askGroup : x.askGroup(st.unitName)}` : "";
    if (askGroup) newMem.pending = "group";
    const chips = groupChips.length ? groupChips : [x.chips.next, x.chips.today, x.chips.tomorrow];

    if (intent === "now" || intent === "next") {
      const { day: today, min } = nowParts(now);
      let text = "";
      if (intent === "now") {
        const cur = sessionsFor(cls, unit).filter((s) => s.day === today && s.end && toMin(s.start) <= min && min < toMin(s.end));
        text = cur.length ? `${x.nowTitle}\n${cur.map((s) => line(s, lang)).join("\n")}` : dz ? DZ.nowNone : x.nowNone;
        if (!cur.length) {
          const nx = nextSession(cls, unit, now);
          if (nx.length) text += `\n\n${dz ? DZ.nextTitle : x.nextTitle}\n${nx.map((s) => line(s, lang, s.day !== today)).join("\n")}`;
        }
      } else {
        const nx = nextSession(cls, unit, now);
        text = nx.length ? `${dz ? DZ.nextTitle : x.nextTitle}\n${nx.map((s) => line(s, lang, s.day !== today)).join("\n")}` : dz ? DZ.noMore : x.noMore;
      }
      return { text: `${hello}${suffix(cls, unit, lang)}\n\n${text}${askGroup}`, memory: newMem, chips };
    }

    if (intent === "first" || intent === "last") {
      const d = day ?? nowParts(now).day;
      const list = sessionsFor(cls, unit).filter((s) => s.day === d);
      const dn = d === nowParts(now).day && !day ? x.today : x.of(DAY_NAME[lang][d] ?? d);
      if (!list.length) return { text: `${hello}${suffix(cls, unit, lang)}\n\n${d === "Friday" ? t.friday : t.noCourse}`, memory: { ...newMem, day: d }, chips };
      const pick =
        intent === "first"
          ? list.filter((s) => toMin(s.start) === toMin(list[0]!.start))
          : (() => {
              const end = Math.max(...list.map((s) => toMin(s.end || s.start)));
              return list.filter((s) => toMin(s.end || s.start) === end);
            })();
      const title = intent === "first" ? x.firstTitle(dn) : x.lastTitle(dn);
      return { text: `${hello}${suffix(cls, unit, lang)}\n\n${title}\n${pick.map((s) => line(s, lang)).join("\n")}${askGroup}`, memory: { ...newMem, day: d }, chips };
    }
  }

  // Le reste (emploi du temps classique, profs, modules, lieux, services, guide)
  let text = core({ q, day, time, groupN, askedGroup, explicitClass, cls, teacherTok }, lang);
  if (dz && text.startsWith(t.unknown)) text = `Ma fhemtch mlih 😅 Jarreb t9oulha b tari9a okhra.\n\n${DZ_EXAMPLES}`;
  let memory = mem;
  let chips = defaultChips(lang);
  if (text === t.noClass) return { text: hello + (dz ? DZ.askClass : x.askClass), memory: { ...mem, pending: "class", day, time, intent: "tt" }, chips: CLASS_CHIPS[lang] };
  if (wantsSchedule && cls && !teacherTok) {
    const st = STRUCTURE[cls]!;
    const unit = unitFor(cls, groupN);
    memory = { cls, group: unit ? groupN : null, day, time, intent: "tt", pending: !unit && !st.promo ? "group" : null };
    chips = !unit && !st.promo ? st.units.map((u) => uLabel(cls!, u.value, lang)) : [x.chips.next, x.chips.tomorrow, ...DAY_ORDER.filter((d) => d !== day).slice(0, 3).map((d) => DAY_NAME[lang][d] ?? d)];
  }
  return { text: hello + text, memory, chips };
}

/** Compatibilité : réponse texte seule. */
export function localAnswer(raw: string, lang: Lang, ctx: ChatContext = {}): string {
  return localReply(raw, lang, ctx).text;
}


// Darija écrite en lettres latines (« 3andi cours ghodwa ? ») → on répond en français
const DARIJA = /(^| )(salam|slm|wesh|wech|wach|3andi|andi|3andna|kayen|kayna|kayn|makanch|chkoun|chkon|chkun|ta3|nta3|taa|win|wine|ghodwa|ghedwa|ghdwa|daba|drok|dork|dorka|doka|derwek|rani|raki|raho|rak|nta|nti|sahit|sa7it|saha|labas|labes|kirak|bezaf|bezzaf|chwiya|wa9tach|wqtach|waqtach|wa9ech|kifach|kifech|3lach|3lah|chhal|9ra|nakra|neqra|n9ra|mazal|khlast|kmlt|ghir|bark|sahbi|khouya|3la|m3a|bghit|nheb|lyoum|lyom|sbah|l3chiya|wakha|wah|mlih|s7i7|lhad|l7ad|letnin|tlata|larb3a|lkhmis|lsebt)( |$)/;
/** vrai si le message est en darija algérienne écrite en lettres latines */
export function isDarija(text: string): boolean {
  return DARIJA.test(norm(text)) && !/[\u0600-\u06FF]/.test(text);
}
/** Langue de réponse : arabe, anglais ou français (la darija latine est servie en français). */
export function chatLanguage(text: string, fallback: Lang): Lang {
  if (isDarija(text)) return "fr";
  return detectLanguage(text, fallback);
}
