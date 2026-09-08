/**
 * Contenido, geometría y tiempos de la constelación de «Nuestra mirada».
 * Lo consumen el mapa (`MapaConstelacion`), los bloques de lectura y las dos
 * mitades de la coreografía (`setup-estados`, `timeline-fases`).
 */

export type Perspectiva = {
  id: string;
  accent: string;
  /**
   * Color del texto de la palabra destacada. Nulo = la palabra va en navy
   * con SUBRAYADO decorativo del acento (el naranja no alcanza 3:1 como
   * texto sobre el fondo claro; como regla decorativa no necesita ratio).
   */
  acentoTexto: string | null;
  label: string;
  /** Frase principal; `tachado` es el fragmento que se tacha (si existe). */
  fraseAntes: string;
  tachado?: string;
  frasePunto: string;
  /** Frase afirmativa partida para acentuar `afirmativaAccent`. */
  afirmativaPre: string;
  afirmativaAccent: string;
  afirmativaPost: string;
  fichas: readonly string[];
};

export const PERSPECTIVAS: readonly Perspectiva[] = [
  {
    id: "01",
    accent: "#1f9a78", // verde-concepto
    acentoTexto: "#1f9a78",
    label: "Pensamiento matemático",
    fraseAntes: "La matemática no es solo ",
    tachado: "resolver cuentas",
    frasePunto: ".",
    afirmativaPre: "Es una manera de ",
    afirmativaAccent: "pensar, argumentar y actuar",
    afirmativaPost: " en el mundo.",
    fichas: [
      "Construir estrategias",
      "Argumentar",
      "Tomar decisiones",
      "Resolver problemas",
      "Actuar dentro y fuera del aula",
    ],
  },
  {
    id: "02",
    accent: "#4a6fa5", // azul-medio
    // «transformar» conserva el verde ya aprobado en el lenguaje del sitio;
    // el nodo se diferencia del 01 por su acento azul-medio.
    acentoTexto: "#1f9a78",
    label: "Empoderamiento desde el saber",
    fraseAntes: "El poder no es ",
    tachado: "sobre otras personas",
    frasePunto: ".",
    afirmativaPre: "Es poder para ",
    afirmativaAccent: "transformar",
    afirmativaPost: ".",
    fichas: [
      "Saber",
      "Reflexión",
      "Experiencia",
      "Convicción para transformar",
      "Mirada no deficitaria",
    ],
  },
  {
    id: "03",
    accent: "#e07a2f", // naranja-accion (dosis mínima, señal de acento)
    acentoTexto: null, // navy + subrayado naranja (contraste AA garantizado)
    label: "Transformación educativa",
    fraseAntes: "La educación es un derecho",
    frasePunto: ".",
    afirmativaPre: "Transformarla es ",
    afirmativaAccent: "ampliar posibilidades",
    afirmativaPost: ".",
    fichas: [
      "Perspectiva de género",
      "Inclusión",
      "Justicia social",
      "Construcción colectiva del conocimiento",
      "Mirada no deficitaria del profesorado",
    ],
  },
] as const;

/** Posiciones (en % del escenario) de los tres nodos. */
export const NODOS = [
  { x: 24, y: 30 },
  { x: 76, y: 36 },
  { x: 40, y: 74 },
] as const;

/**
 * Geometría SVG en viewBox 0 0 160 90 (misma proporción que los desktops
 * objetivo): así el estirado de preserveAspectRatio="none" es casi uniforme
 * y el draw-in por dasharray funciona SIN vector-effect (con non-scaling-
 * stroke, Chromium dashea en espacio de pantalla y el truco de
 * getTotalLength se rompe: las líneas "ocultas" quedaban como guiones).
 * Coordenadas = (x% * 1.6, y% * 0.9) de las posiciones de los nodos.
 */
export const LINEAS = [
  "M 80 41.4 Q 57.6 36 38.4 27",
  "M 80 41.4 Q 102.4 38.7 121.6 32.4",
  "M 80 41.4 Q 70.4 55.8 64 66.6",
] as const;

/** Arcos tenues entre nodos (el sistema, siempre insinuado). */
export const ARCOS = [
  "M 38.4 27 Q 80 19.8 121.6 32.4",
  "M 121.6 32.4 Q 99.2 54 64 66.6",
  "M 64 66.6 Q 41.6 48.6 38.4 27",
] as const;

/** Ramificaciones finales: de cada nodo nacen conexiones nuevas (fase red). */
export const RAMAS = [
  { d: "M 38.4 27 L 22.4 18.9", fin: { x: 22.4, y: 18.9 } },
  { d: "M 38.4 27 L 24 35.1", fin: { x: 24, y: 35.1 } },
  { d: "M 38.4 27 L 49.6 15.3", fin: { x: 49.6, y: 15.3 } },
  { d: "M 121.6 32.4 L 139.2 24.3", fin: { x: 139.2, y: 24.3 } },
  { d: "M 121.6 32.4 L 140.8 40.5", fin: { x: 140.8, y: 40.5 } },
  { d: "M 121.6 32.4 L 112 19.8", fin: { x: 112, y: 19.8 } },
  { d: "M 64 66.6 L 46.4 75.6", fin: { x: 46.4, y: 75.6 } },
  { d: "M 64 66.6 L 81.6 76.5", fin: { x: 81.6, y: 76.5 } },
  { d: "M 64 66.6 L 43.2 61.2", fin: { x: 43.2, y: 61.2 } },
] as const;

/** Zoom de cámara y punto de pantalla donde aterriza cada nodo activo. */
export const CAMARA = [
  { scale: 1.5, tx: 0.25, ty: 0.46 },
  { scale: 1.5, tx: 0.23, ty: 0.42 },
  { scale: 1.5, tx: 0.24, ty: 0.46 },
] as const;

// ── Tiempos ────────────────────────────────────────────────────────────────
// Aire para leer el título del núcleo. Las rayas hacia los tres nodos salían
// encima de la entrada del texto (0.35 contra un título que termina de entrar
// recién en 0.67): el titular nunca quedaba solo. Todo lo que va DESPUÉS de
// esa entrada se corre este tanto, y la zona crece en proporción
// (780 × 14/12 = 910svh, el `h-[910svh]` del compositor) para que el aire sea
// scroll real y el resto conserve su ritmo.
//
// Con 2 unidades el titular queda solo de 0.67 a 2.35 ≈ 97svh de scroll: casi
// una pantalla entera de rueda antes de que aparezca la primera raya. Subir o
// bajar SOLO este número (y la altura de la zona, que es 780 × TOTAL/12):
// fases, umbrales del indicador y ritmo se reacomodan.
export const AIRE_TITULO = 2;
const TOTAL = 12 + AIRE_TITULO;

/** Indicador de progreso (5 momentos): color = principio activo. */
export const FASE_COLOR = ["#4a6fa5", "#1f9a78", "#4a6fa5", "#e07a2f", "#1f2d4d"];
/** Umbrales = arranque de cada fase sobre la duración total. */
export const BOUNDS = [1.3, 3.45, 5.6, 7.75].map((t) => (t + AIRE_TITULO) / TOTAL);
