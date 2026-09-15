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

// Orden, cantidad (9) y métricas EXACTAS del hero de referencia. Las fotos son
// de la carpeta que aprobó ED (`public/fotos/`).
export const CARDS: Card[] = [
  { w: 17.36, ar: "300 / 250", cx: 31.25, cy: 7.1, par: 1.027, img: "/fotos/docentes-trabajan-aula.webp", alt: "Docentes resuelven una tarea en un aula", label: { title: "En el aula", desc: "Acompañamos el aprendizaje donde sucede" } },
  { w: 12.73, ar: "220 / 280", cx: 81.6, cy: 16.07, par: 1.108, img: "/fotos/globos-medicion.webp", alt: "Docentes miden alturas con globos durante un taller" },
  { w: 13.89, ar: "240 / 320", cx: 93.75, cy: 26.85, par: 1.014, img: "/fotos/exposicion-grafica.webp", alt: "Una formadora señala una gráfica durante una clase", label: { title: "Investigación aplicada", desc: "Conocimiento que vuelve al aula" } },
  { w: 12.73, ar: "220 / 260", cx: 5.21, cy: 25.01, par: 1.068, img: "/fotos/materiales-sobre-la-mesa.webp", alt: "Estudiantes trabajan con papeles de colores sobre una mesa" },
  { w: 16.2, ar: "280 / 240", cx: 16.2, cy: 44.61, par: 1.034, img: "/fotos/formadora-guia-taller.webp", alt: "Una formadora guía a docentes durante un taller", label: { title: "Acompañamiento situado", desc: "Junto a cada docente y escuela" } },
  { w: 19.68, ar: "340 / 260", cx: 72.92, cy: 55.71, par: 1.007, img: "/fotos/encuentro-mesas-rojas.webp", alt: "Encuentro de formación docente con mesas de trabajo", label: { title: "Formación docente", desc: "Trayectos para docentes de matemáticas" } },
  { w: 14.47, ar: "250 / 320", cx: 24.59, cy: 71.16, par: 1.088, img: "/fotos/grupo-en-ronda.webp", alt: "Un grupo discute una tarea sentado en ronda" },
  { w: 19.68, ar: "340 / 250", cx: 53.24, cy: 84.82, par: 1.024, img: "/fotos/encuentro-institucional.webp", alt: "Docentes e instituciones reunidas en un encuentro en México", label: { title: "Presencia regional", desc: "Chile · México · Argentina · Colombia · Brasil" } },
  { w: 9.84, ar: "170 / 230", cx: 85.94, cy: 93.84, par: 1.068, img: "/fotos/formadora-sentada-grupo.webp", alt: "Una formadora trabaja sentada junto a un grupo" },
  // Sumadas para llenar el vacío de la parte de abajo y "bajar" hacia Acerca de.
  { w: 14, ar: "300 / 210", cx: 50, cy: 64, par: 1.04, img: "/fotos/mesa-con-materiales.webp", alt: "Docentes trabajan con materiales alrededor de una mesa" },
  { w: 13, ar: "240 / 300", cx: 11, cy: 84, par: 1.07, img: "/fotos/cubos-dos-manos.webp", alt: "Dos cubos de papel armados, uno en cada mano", label: { title: "Materiales propios", desc: "Recursos listos para llevar al aula" } },
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
// asentadas. La segunda es apaisada para entrar en la banda superior.
export const MOBILE_CARDS: Card[] = [
  // Primer pantallazo.
  { w: 38, ar: "300 / 250", cx: 25, cy: 22, par: 1, img: "/fotos/docentes-trabajan-aula.webp", alt: "Docentes resuelven una tarea en un aula" },
  { w: 34, ar: "300 / 230", cx: 75, cy: 22, par: 1, img: "/fotos/comparar-tareas-ronda.webp", alt: "Docentes en ronda comparan dos tareas" },
  { w: 38, ar: "280 / 240", cx: 25, cy: 87, par: 1, img: "/fotos/formadora-guia-taller.webp", alt: "Una formadora guía a docentes durante un taller" },
  { w: 40, ar: "340 / 260", cx: 75, cy: 87, par: 1, img: "/fotos/encuentro-mesas-rojas.webp", alt: "Encuentro de formación docente con mesas de trabajo" },
  // Más abajo (se ven al scrollear, ya asentadas tras el deploy).
  { w: 42, ar: "340 / 250", cx: 31, cy: 112, par: 1, img: "/fotos/encuentro-institucional.webp", alt: "Docentes e instituciones reunidas en un encuentro en México" },
  { w: 34, ar: "250 / 320", cx: 73, cy: 117, par: 1, img: "/fotos/grupo-en-ronda.webp", alt: "Un grupo discute una tarea sentado en ronda" },
  { w: 38, ar: "240 / 300", cx: 28, cy: 139, par: 1, img: "/fotos/cubos-dos-manos.webp", alt: "Dos cubos de papel armados" },
  { w: 42, ar: "300 / 210", cx: 72, cy: 143, par: 1, img: "/fotos/mesa-con-materiales.webp", alt: "Docentes trabajan con materiales alrededor de una mesa" },
];
