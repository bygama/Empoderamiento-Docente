// Por dónde llega la gente, según el sitio de donde viene: la lista de
// dominios de cada canal, en un solo lugar. La usan el Resumen, Origen y la
// ruta que cuenta los eventos del sitio. No sabe de ED: el dominio propio lo
// recibe.

export const CANALES = ["buscador", "redes", "asistentes-ia", "directo", "otros-sitios"] as const;
export type Canal = (typeof CANALES)[number];

export const NOMBRE_DEL_CANAL: Record<Canal, string> = {
  buscador: "Buscador",
  redes: "Redes",
  "asistentes-ia": "Asistentes IA",
  directo: "Directo",
  "otros-sitios": "Otros sitios",
};

export function esCanal(valor: unknown): valor is Canal {
  return typeof valor === "string" && (CANALES as readonly string[]).includes(valor);
}

type ConDominios = Exclude<Canal, "directo" | "otros-sitios">;

// Un host es de un dominio si es ese dominio o termina en «.dominio»
// (`l.facebook.com`, `www.linkedin.com`). Los asistentes se miran antes que
// los buscadores: `gemini.google.com` no es Google.
const DOMINIOS: ReadonlyArray<[ConDominios, readonly string[]]> = [
  ["asistentes-ia", "chatgpt.com chat.openai.com claude.ai perplexity.ai gemini.google.com bard.google.com copilot.microsoft.com deepseek.com meta.ai grok.com you.com phind.com poe.com".split(" ")],
  ["buscador", "bing.com duckduckgo.com yahoo.com ecosia.org search.brave.com yandex.com yandex.ru baidu.com startpage.com qwant.com".split(" ")],
  ["redes", "facebook.com fb.com instagram.com linkedin.com lnkd.in twitter.com x.com t.co youtube.com youtu.be whatsapp.com wa.me tiktok.com threads.net threads.com bsky.app t.me telegram.org pinterest.com reddit.com".split(" ")],
];

// Google tiene un dominio por país: google.com, google.cl, google.com.ar.
const GOOGLE = /(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/;

// Una app de Android manda su paquete como referido (`android-app://…`).
const APPS: Record<string, ConDominios> = {
  "com.google.android.googlequicksearchbox": "buscador",
  "com.linkedin.android": "redes",
  "com.facebook.katana": "redes",
  "com.instagram.android": "redes",
  "com.twitter.android": "redes",
  "com.whatsapp": "redes",
  "org.telegram.messenger": "redes",
};

const esDe = (host: string, dominio: string) => host === dominio || host.endsWith(`.${dominio}`);

/**
 * El canal de un referido, por su host. Vacío es Directo. El propio sitio no
 * es un canal —la persona ya estaba adentro—, así que devuelve `null`.
 */
export function canalDe(host: string, propio?: string): Canal | null {
  const limpio = host.trim().toLowerCase().replace(/\.$/, "");
  if (!limpio) return "directo";
  if (propio && esDe(limpio, propio.toLowerCase())) return null;
  if (Object.hasOwn(APPS, limpio)) return APPS[limpio];
  for (const [canal, dominios] of DOMINIOS) {
    if (canal === "buscador" && GOOGLE.test(limpio)) return canal;
    if (dominios.some((d) => esDe(limpio, d))) return canal;
  }
  return "otros-sitios";
}
