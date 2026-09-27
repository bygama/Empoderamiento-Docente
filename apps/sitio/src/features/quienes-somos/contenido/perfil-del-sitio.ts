import type { Nivel, RotuloDePublicacion } from "./modelo-del-equipo";

// Lo que reciben los componentes del equipo en el sitio: la tarjeta y, si lo
// tiene, el recorrido inmersivo (la «Parte 2»), ya resuelto. Los nombres son
// los de los componentes, que no cambian de contrato con la base (SPEC §8.1 de
// `work/equipo/`); los arma `del-sitio.ts` desde el documento de la persona.
// Sin Zod, para que lo importen los componentes del navegador.

/**
 * Jerarquía institucional: 1 Dirección general · 2 Dirección · 3 Líderes de
 * área y proyecto · 4 Facilitación y diseño de materiales.
 */
export type Tier = Nivel;

/**
 * Familias de color (acento, nunca fondo por etapa — ver DESIGN.md):
 *   verde   → aula / origen / concepto (empoderamiento) / convergencia
 *   azul    → investigación y saber
 *   naranja → transformación y política (acento puntual, uso mínimo)
 */
export type ProfileColor = "verde" | "azul" | "naranja";

/** Hito puntual dentro de una etapa (cargo, tesis, diseño…). */
export type Milestone = {
  period?: string;
  title: string;
  detail?: string;
  /** Se destaca por sobre el resto (p. ej. Directora General de ED). */
  primary?: boolean;
};

/** Ramificación menor de una etapa (estancias internacionales, señales). */
export type Branch = { period?: string; place: string; detail: string };

/**
 * Pieza de producción. Las de la Biblioteca traen su título, año, tipo y
 * link del material; las que no tienen link no llevan la acción. Sin
 * portada real → card tipográfica (no inventar portada).
 */
export type ProfilePublication = {
  year?: string;
  kind: RotuloDePublicacion;
  title: string;
  meta?: string;
  /** Conceptos representativos (colección de materiales), no ISBN ni catálogo. */
  concepts?: string[];
  featured?: boolean;
  /** Adónde se lee: el link del material de la Biblioteca. */
  url?: string;
};

/** Categoría lateral persistente (orientación durante el recorrido). */
export type ProfileCategory = { id: string; label: string; color: ProfileColor };

/**
 * Composición visual de la etapa dentro del recorrido (variedad editorial,
 * no "otra card blanca más"):
 *   editorial → bloque amplio sin chrome: título grande + texto + lista mínima.
 *   ficha     → panel breve y acotado (títulos académicos) + ramas satélite.
 *   concepto  → tratamiento tipográfico: cita destacada + línea sostenida.
 *   hitos     → 1-2 hitos primarios con aire + secundarios en línea compacta.
 *   mapa      → etiquetas territoriales sueltas (constelación, no lista).
 *   ramas     → piezas editoriales como ramificaciones del camino.
 *   sintesis  → hito primario protagonista + roles actuales compactos.
 */
export type StageVariant = "editorial" | "ficha" | "concepto" | "hitos" | "mapa" | "ramas" | "sintesis";

/** Una de las etapas del recorrido (una a ocho). */
export type ProfileStage = {
  id: string;
  /** Número de etapa 1..N — se muestra y ancla el nodo del camino. */
  n: number;
  /** Categoría lateral que se activa al entrar a esta etapa. */
  categoryId: string;
  eyebrow: string;
  color: ProfileColor;
  period?: string;
  title: string;
  body: string;
  /** Composición visual de la etapa. Default: "editorial". */
  variant?: StageVariant;
  /** Cita textual REAL destacable (p. ej. título validado de la tesis). */
  quote?: string;
  milestones?: Milestone[];
  branches?: Branch[];
  /** Etiquetas sintéticas (p. ej. países de la etapa internacional). */
  tags?: string[];
  publications?: ProfilePublication[];
};

/**
 * Recorrido inmersivo completo de una persona. La identidad corta (nombre,
 * cargo, país) vive en la persona; acá, la narrativa, la fotografía y las
 * etapas: el mismo motor (ImmersiveProfile) se adapta a la cantidad real de
 * etapas, hitos y publicaciones.
 */
export type Profile = {
  /** Nombre completo validado (difiere del `nombre` corto de la card). */
  fullName: string;
  role: string;
  location: string;
  origin?: string;
  /**
   * Tratamiento de la fotografía dentro del recorrido:
   *   "recorte" → figura sin fondo, parada sobre el borde de la página. Pide un
   *               PNG recortado a mano.
   *   "marco"   → la foto tal cual, dentro de un marco redondeado.
   *   "sin"     → no hay foto y no la va a haber (decisión de la persona); el
   *               recorrido se resuelve tipográfico, sin hueco ni marcador.
   */
  figura?: "recorte" | "marco" | "sin";
  /** Imagen de la figura. Con `figura: "sin"` no existe. */
  cutout?: string;
  /** El texto alternativo de la figura, donde no es decorativa. */
  cutoutAlt?: string;
  /**
   * Medidas REALES del archivo de `cutout`: el recorte (alto por CSS, ancho
   * auto) las pide para reservar la proporción; el marco va con `fill`.
   */
  cutoutSize?: { width: number; height: number };
  cutoutPosition?: string;
  /** Solo con `figura: "marco"`: la imagen es APAISADA (una lámina, no un retrato). */
  marcoApaisado?: boolean;
  headline: string;
  intro: string;
  formation: string[];
  categories: ProfileCategory[];
  stages: ProfileStage[];
  closing: { title: string; body: string; body2?: string };
};

export type PersonaDelSitio = {
  /** El slug: `/quienes-somos?persona=<key>` abre su perfil. */
  key: string;
  nombre: string;
  rol: string;
  pais: string;
  tier: Tier;
  /**
   * La foto de la tarjeta, con su `object-position` para encuadrar el rostro.
   * `null`: la persona pidió no publicarla, y la card se resuelve con una
   * superficie tipográfica de marca (no tener retrato es una decisión, no un
   * dato pendiente).
   */
  foto: { src: string; alt: string; posicion: string } | null;
  /**
   * Acercamiento propio de esta foto (1 = la foto tal cual). Empareja el
   * TAMAÑO DE LOS ROSTROS dentro de cada nivel: una foto de lejos no tiene
   * que leerse como si la persona pesara menos. No toca el tamaño de la card.
   */
  imageZoom: number;
  /** Recorrido inmersivo (Parte 2). Solo quienes lo tienen. */
  profile?: Profile;
};
