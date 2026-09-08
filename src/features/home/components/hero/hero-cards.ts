/**
 * Tarjeta del hero. Réplica EXACTA del campo de imágenes de blueprintapps.io:
 * 9 tarjetas con tamaños/relaciones de aspecto fijas (medidas del original) y
 * posiciones dispersas, sin rotación. Cada medida está expresada como fracción
 * del viewport para que escale igual que el original (su rem = 100vw/1728).
 */
export type Card = {
  /** ancho como % del viewport (designRem / 1728 * 100). */
  w: number;
  /** relación de aspecto ancho/alto (CSS aspect-ratio). */
  ar: string;
  /** centro X como % del ancho del hero. */
  cx: number;
  /** centro Y como % del alto del hero. */
  cy: number;
  /** factor de parallax de scroll medido en el original (>1 = adelanta). */
  par: number;
  /** foto real, o null para usar un cuadrado de marca (placeholder). */
  img: string | null;
  alt?: string;
  label?: { title: string; desc?: string };
};

// Orden, cantidad (9) y métricas EXACTAS del hero de referencia. Slots 1, 3 y 8
// usan cuadrado de marca hasta tener las fotos (los más chicos / sin label).
export const CARDS: Card[] = [
  { w: 17.36, ar: "300 / 250", cx: 31.25, cy: 7.1, par: 1.027, img: "/hero/hero-1.webp", alt: "Equipo en reunión de trabajo", label: { title: "En el aula", desc: "Acompañamos el aprendizaje donde sucede" } },
  { w: 12.73, ar: "220 / 280", cx: 81.6, cy: 16.07, par: 1.108, img: "/hero/hero-7.webp", alt: "Encuentro de trabajo en equipo" },
  { w: 13.89, ar: "240 / 320", cx: 93.75, cy: 26.85, par: 1.014, img: "/hero/hero-3.webp", alt: "Investigación en equipo", label: { title: "Investigación aplicada", desc: "Conocimiento que vuelve al aula" } },
  { w: 12.73, ar: "220 / 260", cx: 5.21, cy: 25.01, par: 1.068, img: "/hero/hero-8.webp", alt: "Materiales educativos" },
  { w: 16.2, ar: "280 / 240", cx: 16.2, cy: 44.61, par: 1.034, img: "/hero/hero-5.webp", alt: "Taller en aula", label: { title: "Acompañamiento situado", desc: "Junto a cada docente y escuela" } },
  { w: 19.68, ar: "340 / 260", cx: 72.92, cy: 55.71, par: 1.007, img: "/hero/hero-6.webp", alt: "Encuentro de trabajo", label: { title: "Formación docente", desc: "Trayectos para docentes de matemáticas" } },
  { w: 14.47, ar: "250 / 320", cx: 24.59, cy: 71.16, par: 1.088, img: "/hero/hero-4.webp", alt: "Equipo de Empoderamiento Docente" },
  { w: 19.68, ar: "340 / 250", cx: 53.24, cy: 84.82, par: 1.024, img: "/hero/hero-2.webp", alt: "Equipo con su publicación", label: { title: "Presencia regional", desc: "Chile · México · Argentina · Colombia · Brasil" } },
  { w: 9.84, ar: "170 / 230", cx: 85.94, cy: 93.84, par: 1.068, img: "/hero/hero-9.webp", alt: "Lectura de material didáctico" },
  // Sumadas para llenar el vacío de la parte de abajo y "bajar" hacia Acerca de.
  { w: 14, ar: "300 / 210", cx: 50, cy: 64, par: 1.04, img: "/hero/hero-10.webp", alt: "Materiales de geometría en una actividad de aula" },
  { w: 13, ar: "240 / 300", cx: 11, cy: 84, par: 1.07, img: "/hero/hero-11.webp", alt: "Cuadernillo de matemática con representación de números", label: { title: "Materiales propios", desc: "Recursos listos para llevar al aula" } },
];

// Campo CURADO para mobile/tablet (< lg). Fotos clave alrededor del texto, pero
// ENTERAS dentro de la pantalla (no cortadas por el borde): cx hacia adentro
// (~25/75) + ancho clampeado garantizan que cada foto entre completa de 320px a
// 1023px. `cy` va en SVH (no en %): así la posición vertical NO depende del alto
// total del hero y se pueden sumar fotos MÁS ABAJO.
//
// TODAS comparten la MISMA animación (el deploy): se combinan apiladas en el
// centro y se acomodan a su lugar. Las 4 primeras quedan en el primer pantallazo
// (en las BANDAS LIBRES: entre navbar y texto, y entre texto y fold — sin pisar
// nada); las 4 de más abajo se despliegan hacia abajo y se ven al scrollear, ya
// asentadas. La portrait (hero-3) va landscape para entrar en la banda superior.
export const MOBILE_CARDS: Card[] = [
  // Primer pantallazo.
  { w: 38, ar: "300 / 250", cx: 25, cy: 22, par: 1, img: "/hero/hero-1.webp", alt: "Equipo en reunión de trabajo" },
  { w: 34, ar: "300 / 230", cx: 75, cy: 22, par: 1, img: "/hero/hero-3.webp", alt: "Investigación en equipo" },
  { w: 38, ar: "280 / 240", cx: 25, cy: 87, par: 1, img: "/hero/hero-5.webp", alt: "Taller en aula" },
  { w: 40, ar: "340 / 260", cx: 75, cy: 87, par: 1, img: "/hero/hero-6.webp", alt: "Encuentro de trabajo" },
  // Más abajo (se ven al scrollear, ya asentadas tras el deploy).
  { w: 42, ar: "340 / 250", cx: 31, cy: 112, par: 1, img: "/hero/hero-2.webp", alt: "Equipo con su publicación" },
  { w: 34, ar: "250 / 320", cx: 73, cy: 117, par: 1, img: "/hero/hero-4.webp", alt: "Equipo de Empoderamiento Docente" },
  { w: 38, ar: "240 / 300", cx: 28, cy: 139, par: 1, img: "/hero/hero-11.webp", alt: "Cuadernillo de matemática" },
  { w: 42, ar: "300 / 210", cx: 72, cy: 143, par: 1, img: "/hero/hero-10.webp", alt: "Materiales de geometría en una actividad de aula" },
];
