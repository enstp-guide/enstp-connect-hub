// Réponses de l’assistant sur les rubriques du guide : enseignants (modules, emails), sport,
// où manger, menu de la cantine, bus, sorties à Alger, démarches, clubs, plan du campus…
// Toutes les données viennent de src/lib/assistant-kb.json (extrait des pages du site).
import kbJson from "@/lib/assistant-kb.json";
import type { Lang } from "@/lib/detect-language";

type Tri = { fr: string; en: string; ar: string };
type Teacher = { cls: string; module: string; name: string; titles: string[]; email: string; linkedin: string };
type Sport = { name: string; kind: "gym" | "outdoor"; price: string; maps: string; rating?: number; reviews?: number; tel?: string };
type Place = { cat: string; name: string; where: string; price: string; type: string; desc: Tri; rating?: number; reviews?: number; tel?: string; maps?: string };
type Loisir = { name: Tri; badge: Tri; sub: Tri; desc: Tri; maps: string; rules: Tri[] };
type Outing = { name: Tri; where: Tri; transport: Tri; duration: Tri; budget: Tri; desc: Tri; free: boolean };
type Service = { cat: string; title: Tri; items: Tri[] };
type CampusSpot = { n: number; name: Tri; note: Tri | null };
type CousFixed = { time: string; frequency: Record<Lang, string>; destinations: Record<Lang, string[]>; type: string };
type CousCont = { window: string; destinations: Record<Lang, string[]> };
type Etusa = { id: string; code: Record<Lang, string>; terminals: Record<Lang, { A: string; B: string }>; departuresA: string[]; departuresB: string[]; note: unknown };
type Food = { ar: string; fr: string; en: string };
type KB = {
  teachers: Teacher[];
  sports: Sport[];
  places: Place[];
  loisirs: Loisir[];
  alger: Outing[];
  services: Service[];
  servicesOffice: Record<Lang, string>;
  clubs: Record<Lang, { tec: string; ltp: string; cta: string }>;
  campus: CampusSpot[];
  residence: Record<Lang, { title: string; items: string[] }[]>;
  bus: { cousFixed: CousFixed[]; cousContinuous: CousCont[]; etusa: Etusa[] };
  canteen: { hours: Record<Lang, string>; meals: Record<Lang, string[]>; slots: { start: number; end: number }[]; days: { day: string; meals: Food[][] }[] };
};
export const KB = kbJson as unknown as KB;

export type TopicReply = { text: string; chips: string[] };
export type TopicCtx = { now: Date; cls: string | null; day: string | null };

/** minuscules, sans accents ni ponctuation */
export function normText(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'`´]/g, " ")
    .replace(/[^\p{L}\p{N}:]+/gu, " ")
    .trim();
}
const word = (q: string, re: string) => new RegExp(`(^| )(${re})( |$)`).test(q);

const L = {
  fr: {
    maps: "Itinéraire", call: "Tél.", free: "Gratuit", rating: "avis", budget: "Budget", duration: "Durée", transport: "Accès",
    teachersOf: (m: string) => `👩‍🏫 Enseignants de **${m}** :`, noEmail: "email non communiqué",
    sport: "⚽ **Faire du sport près de l’ENSTP**", gyms: "Salles de sport", outdoor: "Stades, piscines & parcs",
    food: "🍽️ **Manger près de l’école**", cafes: "☕ **Cafés**", sup: "🛒 **Supérettes**", mosque: "🕌 **Mosquées à côté**", pharma: "💊 **Pharmacies**", print: "🖨️ **Impression, papeterie & PC**",
    prayerRoom: "Sur le campus : salle de prière hommes (n°33) et femmes (n°34) sur le plan.", infirmary: "Sur le campus : infirmerie (n°4 sur le plan).",
    canteen: (d: string) => `🍲 **Menu de la cantine — ${d}**`, hours: "Horaires", card: "Accès avec la carte d’étudiant.",
    outings: "🌳 **Sorties à Alger**", rules: "🚫 À éviter sur place :", bus: "🚌 **Bus et navettes**",
    cous: "Bus étudiants COUS (avec la carte d’étudiant)", cousLoop: "Navettes en continu", etusa: "Bus ETUSA",
    next: "Prochains départs", from: "depuis", to: "vers", every: "", noBus: "Je n’ai pas trouvé de bus vers cette destination dans le guide.",
    services: "📋 **Démarches**", office: "", clubs: "🤝 **Clubs étudiants**",
    campus: "📍 **Sur le plan du campus**", campusHint: "Ouvre le plan interactif du guide pour voir l’emplacement.",
    residence: "🏠 **Résidence universitaire Garidi 1**", noMore: "Aucun autre départ aujourd’hui.",
  },
  en: {
    maps: "Directions", call: "Tel.", free: "Free", rating: "reviews", budget: "Budget", duration: "Duration", transport: "Getting there",
    teachersOf: (m: string) => `👩‍🏫 Teachers of **${m}**:`, noEmail: "no email listed",
    sport: "⚽ **Sports near ENSTP**", gyms: "Gyms", outdoor: "Stadiums, pools & parks",
    food: "🍽️ **Eating near school**", cafes: "☕ **Cafés**", sup: "🛒 **Mini-markets**", mosque: "🕌 **Nearby mosques**", pharma: "💊 **Pharmacies**", print: "🖨️ **Printing, stationery & laptops**",
    prayerRoom: "On campus: men’s prayer room (no. 33) and women’s (no. 34) on the map.", infirmary: "On campus: medical office (no. 4 on the map).",
    canteen: (d: string) => `🍲 **Canteen menu — ${d}**`, hours: "Hours", card: "Access with your student card.",
    outings: "🌳 **Outings in Algiers**", rules: "🚫 Not allowed on site:", bus: "🚌 **Buses and shuttles**",
    cous: "COUS student buses (student card)", cousLoop: "Continuous shuttles", etusa: "ETUSA buses",
    next: "Next departures", from: "from", to: "to", every: "", noBus: "I couldn’t find a bus to that destination in the guide.",
    services: "📋 **Procedures**", office: "", clubs: "🤝 **Student clubs**",
    campus: "📍 **On the campus map**", campusHint: "Open the guide’s interactive map to see the location.",
    residence: "🏠 **Garidi 1 University Residence**", noMore: "No more departures today.",
  },
  ar: {
    maps: "المسار", call: "الهاتف", free: "مجاني", rating: "تقييم", budget: "الميزانية", duration: "المدة", transport: "الوصول",
    teachersOf: (m: string) => `👩‍🏫 أساتذة **${m}**:`, noEmail: "البريد غير متوفر",
    sport: "⚽ **الرياضة قرب المدرسة**", gyms: "قاعات الرياضة", outdoor: "ملاعب، مسابح وحدائق",
    food: "🍽️ **الأكل قرب المدرسة**", cafes: "☕ **المقاهي**", sup: "🛒 **المحلات**", mosque: "🕌 **المساجد القريبة**", pharma: "💊 **الصيدليات**", print: "🖨️ **الطباعة والقرطاسية والحواسيب**",
    prayerRoom: "في الحرم: مصلى الرجال (رقم 33) ومصلى النساء (رقم 34) في المخطط.", infirmary: "في الحرم: العيادة (رقم 4 في المخطط).",
    canteen: (d: string) => `🍲 **قائمة المطعم — ${d}**`, hours: "التوقيت", card: "الدخول ببطاقة الطالب.",
    outings: "🌳 **نزهات في الجزائر**", rules: "🚫 يُمنع في الموقع:", bus: "🚌 **الحافلات والنقل**",
    cous: "حافلات الخدمات الجامعية COUS (ببطاقة الطالب)", cousLoop: "نقل متواصل", etusa: "حافلات ETUSA",
    next: "الانطلاقات القادمة", from: "من", to: "إلى", every: "", noBus: "لم أجد حافلة نحو هذه الوجهة في الدليل.",
    services: "📋 **الإجراءات**", office: "", clubs: "🤝 **النوادي الطلابية**",
    campus: "📍 **في مخطط الحرم**", campusHint: "افتح المخطط التفاعلي في الدليل لرؤية المكان.",
    residence: "🏠 **الإقامة الجامعية قاريدي 1**", noMore: "لا توجد انطلاقات أخرى اليوم.",
  },
};

const DAY_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const dayName = (en: string, lang: Lang) => {
  const i = DAY_EN.indexOf(en);
  return i < 0 ? en : lang === "fr" ? DAY_FR[i]! : lang === "ar" ? DAY_AR[i]! : en;
};
const mapsLink = (url: string | undefined, lang: Lang) => (url ? ` · [${L[lang].maps}](${url})` : "");
const stars = (r?: number, n?: number, lang: Lang = "fr") => (r ? ` · ⭐ ${r}${n ? ` (${n} ${L[lang].rating})` : ""}` : "");

// ---------------------------------------------------------------- Enseignants
const CLASS_NAME: Record<Lang, Record<string, string>> = {
  fr: { CP1: "1ère année prépa", CP2: "2ème année prépa" },
  en: { CP1: "1st prep year", CP2: "2nd prep year" },
  ar: { CP1: "السنة الأولى تحضيري", CP2: "السنة الثانية تحضيري" },
};
const TITLE_WORDS = new Set(["mr", "mme", "mlle", "mrs", "ms", "m", "dr"]);
/** jetons du nom (≥ 4 lettres) → enseignants */
const DIR = new Map<string, Teacher[]>();
// on ignore les prénoms (« Rima », « Sid Ahmed »…) pour ne pas confondre avec le prénom de l’étudiant
const FIRST_NAMES = new Set(["ahmed", "mohamed", "sid"]);
for (const t of KB.teachers) {
  const toks = normText(t.name).split(" ");
  const last = TITLE_WORDS.has(toks[0] ?? "") ? toks.slice(1) : toks.slice(1);
  for (const tok of last) {
    if (tok.length < 4 || TITLE_WORDS.has(tok) || FIRST_NAMES.has(tok)) continue;
    DIR.set(tok, [...(DIR.get(tok) ?? []), t]);
  }
}
export const DIRECTORY_TOKENS = [...DIR.keys()];

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

/** Enseignants de l’annuaire cités dans la question (avec tolérance aux fautes si `fuzzy`). */
export function findDirectoryTeachers(q: string, fuzzy: boolean): Teacher[] {
  const found = new Map<string, Teacher>();
  for (const w of q.split(" ")) {
    if (w.length < 4) continue;
    let hits = DIR.get(w);
    if (!hits && fuzzy && w.length >= 5)
      for (const [k, v] of DIR) if (lev(w, k) <= (k.length >= 8 ? 2 : 1)) { hits = v; break; }
    for (const t of hits ?? []) found.set(`${t.name}|${t.module}|${t.cls}`, t);
  }
  return [...found.values()];
}

/** Fiches enseignants regroupées par personne : modules, classes, email, titres, LinkedIn. */
export function teacherCards(list: Teacher[], lang: Lang): string {
  const byName = new Map<string, Teacher[]>();
  for (const t of list) byName.set(t.name, [...(byName.get(t.name) ?? []), t]);
  return [...byName.entries()]
    .map(([name, ts]) => {
      const first = ts[0]!;
      const mods = [...new Set(ts.map((t) => `${t.module} (${CLASS_NAME[lang][t.cls] ?? t.cls})`))].join(", ");
      const email = ts.find((t) => t.email)?.email;
      const lines = [`**${name}** — ${mods}`, email ? `📧 [${email}](mailto:${email})` : `📧 ${L[lang].noEmail}`];
      if (first.titles.length) lines.push(`🎓 ${first.titles.join(" · ")}`);
      if (first.linkedin) lines.push(`🔗 [LinkedIn](${first.linkedin})`);
      return lines.join("\n");
    })
    .join("\n\n");
}

const MODULE_ALIASES: [RegExp, RegExp][] = [
  [/analyse num|numerical analysis|numerique|تحليل عددي/, /analyse numerique/],
  [/analyse|calculus|maths?( |$)|تحليل|رياضيات/, /^analyse \d/],
  [/algebre|algebra|جبر/, /algebre/],
  [/proba|stat|احتمالات|إحصاء|احصاء/, /proba/],
  [/chimie|chemistry|كيمياء/, /chimie/],
  [/physique|physics|فيزياء/, /physique/],
  [/info|computer science|informatique|programmation|إعلام آلي|اعلام الي|معلوماتية/, /info/],
  [/anglais|english|انجليزية|إنجليزية|الانجليزية/, /anglais/],
  [/francais|french|فرنسية|الفرنسية/, /francais/],
  [/dessin|tech draw|technical drawing|رسم تقني/, /dessin/],
  [/electricite|electricity|electro|كهرباء/, /electricite/],
  [/mecanique rationnelle|meca rationnelle|rational mech|meca rat|ميكانيك عقلاني|الميكانيك/, /meca rationnelle/],
  [/mdf|mecanique des fluides|fluid|ميكانيك الموائع/, /mdf/],
  [/ingenierie humaine|human engineering/, /ingenierie humaine/],
  [/ingenierie|engineering/, /^ingenierie \d/],
  [/economie|economy/, /economie/],
  [/expression|exp tech/, /expression/],
];
/** « prof de chimie 3 », « email prof analyse 1 (cp1) » → enseignants du module */
export function moduleTeachers(q: string, cls: string | null): Teacher[] {
  const num = /(?:^| )([1-3])(?: |$)/.exec(q)?.[1];
  for (const [ask, mod] of MODULE_ALIASES) {
    if (!ask.test(q)) continue;
    let list = KB.teachers.filter((t) => mod.test(normText(t.module)));
    if (num) {
      const n = list.filter((t) => normText(t.module).includes(num));
      if (n.length) list = n;
    }
    if (cls === "CP1" || cls === "CP2") {
      const c = list.filter((t) => t.cls === cls);
      if (c.length) list = c;
    }
    if (list.length) return list;
  }
  return [];
}
export function moduleTeachersText(list: Teacher[], lang: Lang): string {
  const mods = [...new Set(list.map((t) => t.module))].join(" / ");
  return `${L[lang].teachersOf(mods)}\n\n${teacherCards(list, lang)}`;
}

// ---------------------------------------------------------------- Sport
function sportReply(q: string, lang: Lang): TopicReply {
  const l = L[lang];
  let list = KB.sports;
  if (word(q, "gratuit|gratuite|free|batel|بلاش|مجاني|mjani")) list = list.filter((s) => s.price === "Gratuit");
  else if (/piscine|nager|natation|swim|pool|مسبح/.test(q)) list = list.filter((s) => /piscine/i.test(s.name));
  else if (/stade|foot|terrain|courir|running|calisth|skate|outdoor|plein air|ملعب|كرة/.test(q)) list = list.filter((s) => s.kind === "outdoor");
  else if (/muscu|gym|fitness|crossfit|salle de sport|salle|قاعة/.test(q)) list = list.filter((s) => s.kind === "gym");
  if (!list.length) list = KB.sports;
  const fmt = (s: Sport) =>
    `- **${s.name}** · ${s.price === "Gratuit" ? l.free : s.price || "—"}${stars(s.rating, s.reviews, lang)}${s.tel ? ` · ${l.call} ${s.tel}` : ""}${mapsLink(s.maps, lang)}`;
  const gyms = list.filter((s) => s.kind === "gym");
  const out = list.filter((s) => s.kind === "outdoor");
  const parts = [l.sport];
  if (gyms.length) parts.push(`**${l.gyms}**\n${gyms.map(fmt).join("\n")}`);
  if (out.length) parts.push(`**${l.outdoor}**\n${out.map(fmt).join("\n")}`);
  const chips: Record<Lang, string[]> = {
    fr: ["Sport gratuit", "Salles de sport", "Piscine", "Stade"],
    en: ["Free sports", "Gyms", "Swimming pool", "Stadium"],
    ar: ["رياضة مجانية", "قاعات الرياضة", "مسبح", "ملعب"],
  };
  return { text: parts.join("\n\n"), chips: chips[lang] };
}

// ---------------------------------------------------------------- Où manger / commerces
function placesReply(cats: string[], title: string, q: string, lang: Lang, extra = ""): TopicReply {
  let list = KB.places.filter((p) => cats.includes(p.cat));
  const sub: [RegExp, (p: Place) => boolean][] = [
    [/pizza/, (p) => p.type === "pizza"],
    [/tacos|fast|poulet|chicken|burger|crousty/, (p) => p.type === "fast"],
    [/pas cher|cher|budget|cheap|rkhis|رخيص/, (p) => /50|600|700/.test(p.price)],
  ];
  for (const [re, f] of sub) if (re.test(q)) { const x = list.filter(f); if (x.length) list = x; }
  const fmt = (p: Place) =>
    `- **${p.name}** · ${p.where}${p.price ? ` · ${p.price}` : ""}${stars(p.rating, p.reviews, lang)}${p.tel ? ` · ${L[lang].call} ${p.tel}` : ""}${mapsLink(p.maps, lang)}\n  ${p.desc[lang]}`;
  return { text: `${title}\n\n${list.map(fmt).join("\n")}${extra ? `\n\n${extra}` : ""}`, chips: [] };
}
function foodReply(q: string, lang: Lang): TopicReply {
  const l = L[lang];
  if (/cafe|coffee|qahwa|قهوة|مقهى/.test(q)) return { ...placesReply(["cafe"], l.cafes, q, lang), chips: foodChips[lang] };
  if (/superette|courses|epicerie|hanout|7anout|grocery|حانوت|محل/.test(q)) return { ...placesReply(["superette"], l.sup, q, lang), chips: foodChips[lang] };
  const r = placesReply(["restaurant"], l.food, q, lang);
  return { text: r.text, chips: foodChips[lang] };
}
const foodChips: Record<Lang, string[]> = {
  fr: ["Menu de la cantine aujourd’hui", "Pizza pas chère", "Cafés", "Supérettes"],
  en: ["Canteen menu today", "Cheap pizza", "Cafés", "Mini-markets"],
  ar: ["قائمة المطعم اليوم", "بيتزا رخيصة", "مقاهي", "محلات"],
};

// ---------------------------------------------------------------- Cantine
function canteenReply(q: string, lang: Lang, ctx: TopicCtx): TopicReply {
  const l = L[lang];
  const day = ctx.day ?? DAY_EN[ctx.now.getDay()]!;
  const idx = DAY_EN.indexOf(day);
  const d = KB.canteen.days.find((x) => x.day === DAY_FR[idx]);
  const names = KB.canteen.meals[lang];
  let which = [0, 1, 2];
  if (/petit dej|breakfast|ftour|فطور|sbah/.test(q)) which = [0];
  else if (/dejeuner|lunch|midi|غداء|ghda|lghda/.test(q)) which = [1];
  else if (/diner|dinner|soir|عشاء|3cha|acha/.test(q)) which = [2];
  const slot = (i: number) => {
    const s = KB.canteen.slots[i];
    const f = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}h${String(m % 60).padStart(2, "0")}`;
    return s ? ` (${f(s.start)}–${f(s.end)})` : "";
  };
  const body = d
    ? which.map((i) => `**${names[i] ?? ""}**${slot(i)}\n${(d.meals[i] ?? []).map((f) => `- ${f[lang]}`).join("\n")}`).join("\n\n")
    : "—";
  const chips: Record<Lang, string[]> = { fr: ["Menu de demain", "Dîner", "Restaurants autour"], en: ["Tomorrow’s menu", "Dinner", "Restaurants nearby"], ar: ["قائمة الغد", "العشاء", "مطاعم قريبة"] };
  return { text: `${l.canteen(dayName(day, lang))}\n\n${body}\n\n🕒 ${l.hours} : ${KB.canteen.hours[lang]} · ${l.card}`, chips: chips[lang] };
}

// ---------------------------------------------------------------- Sorties à Alger
function outingsReply(q: string, lang: Lang): TopicReply {
  const l = L[lang];
  // un lieu précis ?
  const lo = KB.loisirs.find((x) => [x.name.fr, x.name.en, x.sub.fr].some((n) => keyHit(q, n)));
  if (lo) {
    const rules = lo.rules.length ? `\n\n${l.rules}\n${lo.rules.map((r) => `- ${r[lang]}`).join("\n")}` : "";
    return { text: `🏛️ **${lo.name[lang]}** · ${lo.sub[lang]}${mapsLink(lo.maps, lang)}\n\n${lo.desc[lang]}${rules}`, chips: outingChips[lang] };
  }
  const al = KB.alger.find((x) => keyHit(q, x.name.fr) || keyHit(q, x.name.en));
  if (al) return { text: outingCard(al, lang), chips: outingChips[lang] };
  let list = KB.alger;
  if (word(q, "gratuit|gratuite|free|batel|بلاش|مجاني")) list = list.filter((x) => x.free);
  return {
    text: `${l.outings}\n\n${list.map((x) => `- **${x.name[lang]}** · ${x.where[lang]} · ${x.budget[lang]} · ${x.duration[lang]}`).join("\n")}\n\n${KB.loisirs.map((x) => `- **${x.name[lang]}** · ${x.sub[lang]}${mapsLink(x.maps, lang)}`).join("\n")}`,
    chips: outingChips[lang],
  };
}
function outingCard(x: Outing, lang: Lang): string {
  const l = L[lang];
  return `🌳 **${x.name[lang]}** · ${x.where[lang]}\n\n${x.desc[lang]}\n\n- ${l.transport} : ${x.transport[lang]}\n- ${l.duration} : ${x.duration[lang]}\n- ${l.budget} : ${x.budget[lang]}`;
}
const outingChips: Record<Lang, string[]> = {
  fr: ["Sorties gratuites", "La Casbah", "Jardin d’Essai", "Grande Mosquée d’Alger"],
  en: ["Free outings", "The Casbah", "Jardin d’Essai", "Great Mosque of Algiers"],
  ar: ["نزهات مجانية", "القصبة", "حديقة التجارب", "جامع الجزائر"],
};
/** le nom d’un lieu (ou son mot principal) apparaît-il dans la question ? */
function keyHit(q: string, name: string): boolean {
  const n = normText(name);
  if (n && q.includes(n)) return true;
  const STOPW = new Set(["alger", "algiers", "d", "de", "du", "la", "le", "les", "l", "the", "of", "grande", "great", "jardin", "musee", "institut"]);
  const keys = n.split(" ").filter((w) => w.length >= 5 && !STOPW.has(w));
  return keys.some((k) => word(q, k));
}

// ---------------------------------------------------------------- Bus
const hhmm = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
function busReply(q: string, lang: Lang, ctx: TopicCtx): TopicReply {
  const l = L[lang];
  const now = ctx.now.getHours() * 60 + ctx.now.getMinutes();
  const line = /(?:ligne|line|الخط|khat)\s*(\d{2,3})/.exec(q)?.[1];
  const etusa = KB.bus.etusa.filter((e) =>
    line ? e.id === line : [e.terminals.fr.A, e.terminals.fr.B].some((t) => keyHit(q, t)),
  );
  const cous = KB.bus.cousFixed.filter((c) => c.destinations.fr.some((d) => keyHit(q, d)));
  const loop = KB.bus.cousContinuous.filter((c) => c.destinations.fr.some((d) => keyHit(q, d)));
  const nextOf = (deps: string[]) => {
    const n = deps.filter((t) => hhmm(t) >= now).slice(0, 4);
    return n.length ? n.join(", ") : l.noMore;
  };
  const fmtE = (e: Etusa) => {
    const t = e.terminals[lang];
    return `**${e.code[lang]}** : ${t.A} ⇄ ${t.B}\n- ${l.from} ${t.A} : ${nextOf(e.departuresA)}\n- ${l.from} ${t.B} : ${nextOf(e.departuresB)}`;
  };
  const fmtC = (c: CousFixed) => `- **${c.time}** (${c.frequency[lang]}) → ${c.destinations[lang].join(", ")}`;
  const fmtL = (c: CousCont) => `- **${c.window}** → ${c.destinations[lang].join(", ")}`;
  const specific = line || etusa.length || cous.length || loop.length;
  const parts = [l.bus];
  if (specific) {
    if (cous.length) parts.push(`**${l.cous}**\n${cous.map(fmtC).join("\n")}`);
    if (loop.length) parts.push(`**${l.cousLoop}**\n${loop.map(fmtL).join("\n")}`);
    if (etusa.length) parts.push(`**${l.etusa}** — ${l.next}\n\n${etusa.map(fmtE).join("\n\n")}`);
  } else {
    parts.push(`**${l.cous}**\n${KB.bus.cousFixed.map(fmtC).join("\n")}`);
    parts.push(`**${l.cousLoop}**\n${KB.bus.cousContinuous.map(fmtL).join("\n")}`);
    parts.push(`**${l.etusa}**\n${KB.bus.etusa.map((e) => `- ${e.code[lang]} : ${e.terminals[lang].A} ⇄ ${e.terminals[lang].B}`).join("\n")}`);
  }
  const chips: Record<Lang, string[]> = {
    fr: ["Bus vers Blida", "Bus vers Ben Aknoun", ...KB.bus.etusa.slice(0, 2).map((e) => `Ligne ${e.id}`)],
    en: ["Bus to Blida", "Bus to Ben Aknoun", ...KB.bus.etusa.slice(0, 2).map((e) => `Line ${e.id}`)],
    ar: ["حافلة إلى البليدة", "حافلة إلى بن عكنون", ...KB.bus.etusa.slice(0, 2).map((e) => `الخط ${e.id}`)],
  };
  return { text: parts.join("\n\n"), chips: chips[lang] };
}
/** toutes les destinations connues (pour reconnaître « bus Blida », « navette Bouzaréah »…) */
const BUS_PLACES = [
  ...KB.bus.cousFixed.flatMap((c) => c.destinations.fr),
  ...KB.bus.cousContinuous.flatMap((c) => c.destinations.fr),
  ...KB.bus.etusa.flatMap((e) => [e.terminals.fr.A, e.terminals.fr.B]),
];

// ---------------------------------------------------------------- Démarches
const SERVICE_KEYS: [RegExp, number][] = [
  [/classroom|mot de passe|password|matricule/, 0],
  [/absence|justif|certificat medical|ghiyab|غياب/, 1],
  [/conge/, 2],
  [/reinscri|re inscri|إعادة التسجيل/, 3],
  [/abandon|transfert|transfer|quitus|mutation|تحويل/, 4],
  [/recours|revision|note|progres|correction|علامة|نقطة/, 5],
  [/certificat de scolarite|attestation|scolarite|شهادة مدرسية|شهادة/, 6],
  [/changer de groupe|changement de groupe|change group|switch group|tbadel|بدل الفوج|تغيير الفوج/, 7],
  [/biblio|livre|emprunt|library|book|مكتبة|كتاب/, 8],
];
function servicesReply(q: string, lang: Lang): TopicReply | null {
  const hit = SERVICE_KEYS.find(([re]) => re.test(q));
  if (!hit) return null;
  // « où est la bibliothèque ? » → c’est un lieu, géré par la partie « plan du campus »
  if (hit[1] === 8 && /(^| )(ou|where|win|وين|أين|trouver)( |$)/.test(q)) return null;
  const s = KB.services[hit[1]];
  if (!s) return null;
  const office = s.cat === "admin" || s.cat === "affairs" ? `\n\n🧑‍💼 ${KB.servicesOffice[lang]}` : "";
  const chips: Record<Lang, string[]> = {
    fr: ["Justifier une absence", "Certificat de scolarité", "Recours de notes", "Mot de passe Classroom"],
    en: ["Justify an absence", "School certificate", "Grade appeal", "Classroom password"],
    ar: ["تبرير الغياب", "شهادة مدرسية", "الطعن في العلامات", "كلمة مرور Classroom"],
  };
  return { text: `📋 **${s.title[lang]}**\n\n${s.items.map((i) => `- ${i[lang]}`).join("\n")}${office}`, chips: chips[lang] };
}

// ---------------------------------------------------------------- Plan du campus
const CAMPUS_SKIP = new Set(["salle", "salles", "batiment", "batiments", "bloc", "entree", "services", "ecole", "residence", "bureau", "office", "room", "school"]);
export function campusReply(q: string, lang: Lang): TopicReply | null {
  const hits = KB.campus.filter((c) => {
    const words = normText(`${c.name.fr} ${c.name.en}`).split(" ").filter((w) => w.length >= 4 && !CAMPUS_SKIP.has(w));
    return words.some((w) => word(q, w)) || (c.name.ar && q.includes(normText(c.name.ar)));
  });
  if (!hits.length || hits.length > 4) return null;
  const l = L[lang];
  return {
    text: `${l.campus}\n\n${hits.map((c) => `- **n°${c.n}** · ${c.name[lang]}${c.note ? ` — ${c.note[lang]}` : ""}`).join("\n")}\n\n${l.campusHint}`,
    chips: [],
  };
}

/** Bâtiment(s) où se trouve une salle de cours, d’après les notes du plan (« 1er étage : salles 7–9 »). */
export function roomSpots(num: number): CampusSpot[] {
  return KB.campus.filter((c) => {
    if (!c.note) return false;
    const fr = c.note.fr.toLowerCase();
    if (c.n === 23) return num === 25; // bibliothèque = salle 25
    if (!/salle/.test(fr)) return false;
    const part = fr.slice(fr.indexOf("salle"));
    for (const m of part.matchAll(/(\d+)\s*[–-]\s*(\d+)|(\d+)/g)) {
      if (m[1] && m[2] && num >= Number(m[1]) && num <= Number(m[2])) return true;
      if (m[3] && Number(m[3]) === num) return true;
    }
    return false;
  });
}
export function roomSpotsText(num: number, lang: Lang): string {
  const spots = roomSpots(num);
  if (!spots.length) return "";
  return spots.map((c) => `📍 **n°${c.n}** · ${c.name[lang]}${c.note ? ` — ${c.note[lang]}` : ""}`).join("\n");
}
/** numéro sur le plan du campus pour les lieux de l’assistant */
const PLACE_SPOT: Record<string, number[]> = {
  "amphi-a": [19], "amphi-b": [26], biblio: [23], scolarite: [2], sport: [9], "labo-phys": [25], "labo-chim": [25], "labo-meca": [25], "labo-info": [16],
};
export function placeSpotText(placeId: string, lang: Lang): string {
  const ids = PLACE_SPOT[placeId] ?? [];
  return KB.campus
    .filter((c) => ids.includes(c.n))
    .map((c) => `📍 **n°${c.n}** ${lang === "en" ? "on the campus map" : lang === "ar" ? "في مخطط الحرم" : "sur le plan du campus"} · ${c.name[lang]}${c.note ? ` — ${c.note[lang]}` : ""}`)
    .join("\n");
}

// ---------------------------------------------------------------- Résidence & clubs
function residenceReply(lang: Lang): TopicReply {
  const r = KB.residence[lang];
  return { text: `${L[lang].residence}\n\n${r.map((c) => `**${c.title}**\n${c.items.map((i) => `- ${i}`).join("\n")}`).join("\n\n")}`, chips: [] };
}
function clubsReply(lang: Lang): TopicReply {
  const c = KB.clubs[lang];
  return { text: `${L[lang].clubs}\n\n${c.cta}\n\n- **TEC** : ${c.tec}\n- **LTP** : ${c.ltp}`, chips: [] };
}

// ---------------------------------------------------------------- Aiguillage
/** Rubriques du guide. Renvoie null si la question ne concerne aucune rubrique. */
export function topicReply(q: string, lang: Lang, ctx: TopicCtx): TopicReply | null {
  const l = L[lang];
  if (/cantine|resto u|restau u|restaurant universitaire|menu|petit dej|ftour|lghda|dejeuner|diner|المطعم الجامعي|قائمة|غداء|عشاء|فطور/.test(q))
    return canteenReply(q, lang, ctx);
  if (/(^| )(bus|navette|navettes|cous|etusa|ligne|line|transport|tobis|car|حافلة|الحافلة|نقل|الخط)( |$)/.test(q) || BUS_PLACES.some((p) => keyHit(q, p) && /bus|aller|vers|to|إلى|nrouh|rouh/.test(q)))
    return busReply(q, lang, ctx);
  const svc = servicesReply(q, lang);
  if (svc) return svc;
  if (/(^| )(club|clubs|association|tec|ltp|نادي|النوادي)( |$)/.test(q)) return clubsReply(lang);
  if (/garidi|residence|(^| )cite( |$)|chambre|hebergement|إقامة|اقامة/.test(q)) return residenceReply(lang);
  if (/sport|gym|muscu|fitness|crossfit|piscine|nager|natation|swim|stade|calisth|skate|running|courir|رياضة|ملعب|مسبح|sbor/.test(q)) return sportReply(q, lang);
  if (/casbah|hamma|jardin|musee|bardo|martyr|maqam|grande mosquee|great mosque|djamaa|institut francais|sortie|sortir|visiter|balade|tourisme|week end|weekend|loisir|القصبة|حديقة|متحف|جامع الجزائر|نحوس|nhawes|n7awes|sablette/.test(q))
    return outingsReply(q, lang);
  if (/mosquee|mosque|priere|salat|masjid|جامع|مسجد|صلاة|مصلى/.test(q)) {
    const r = placesReply(["mosque"], l.mosque, q, lang, l.prayerRoom);
    return { text: r.text, chips: [] };
  }
  if (/pharmac|medicament|صيدلية|دواء/.test(q)) {
    const r = placesReply(["pharmacy"], l.pharma, q, lang, l.infirmary);
    return { text: r.text, chips: [] };
  }
  if (/imprim|photocop|papeter|librairie|fourniture|laptop|ordinateur|reparation|pc portable|print|stationer|طباع|نسخ|قرطاس/.test(q))
    return placesReply(["print"], l.print, q, lang);
  if (/manger|restaurant|resto|pizza|tacos|poulet|chicken|burger|fast food|cafe|coffee|superette|courses|epicerie|hanout|nakel|nakoul|makla|ماكلة|مطعم|ناكل|قهوة|مقهى/.test(q))
    return foodReply(q, lang);
  return null;
}
