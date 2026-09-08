/**
 * Contenido de «Origen, sentido y evolución»: hitos de la trayectoria, su
 * geometría sobre el viewBox, los tres pilares, las fotos del panel y el
 * remate. Basado en los videos del cliente (resumen videos.txt §1–3).
 */

export const HITOS = [
  { t: "Maestría", d: "El comienzo: observar y comprender lo que ocurría con las y los docentes." },
  { t: "Doctorado", d: "Explicaciones propias y años de investigación e intervención." },
  { t: "México", d: "Parte de procesos de desarrollo profesional docente a nivel nacional." },
  { t: "Argentina", d: "La expansión regional, sosteniendo la misma filosofía de trabajo." },
  { t: "Hoy", d: "Una línea de investigación viva y una consultora que impulsa transformación educativa." },
] as const;

// Coordenadas de los hitos sobre el viewBox 1000×220 (misma curva del path).
export const NODOS = [
  { x: 60, y: 150 },
  { x: 280, y: 90 },
  { x: 500, y: 140 },
  { x: 720, y: 80 },
  { x: 940, y: 120 },
] as const;

export const PATH_D =
  "M 60 150 C 133 150 207 90 280 90 C 353 90 427 140 500 140 C 573 140 647 80 720 80 C 793 80 867 120 940 120";

export const PREGUNTA = "¿Cómo fue tomando forma ED?";

/**
 * Los tres pilares del relato (beats 0–2). Numerados como en «Nuestra
 * mirada»: el sitio ya usa «01 — Etiqueta» para secuencias conceptuales.
 */
export const PILARES = [
  { n: "01", label: "Origen" },
  { n: "02", label: "Sentido" },
  { n: "03", label: "Evolución" },
] as const;

// Fotos del recorrido (una por beat 0–2). Viven en el panel derecho tipo
// "dock" y se cruzan en sincronía con el cambio de texto. En mobile y con
// reduced-motion el panel no se muestra (la experiencia actual se preserva).
export const FOTOS = [
  {
    src: "/quienes-somos/origen-01-aulas.webp",
    alt: "Trabajo con estudiantes en el patio de una escuela",
  },
  {
    src: "/quienes-somos/origen-02-inflexion.webp",
    alt: "Encuentro de formación docente frente a la pizarra",
  },
  {
    src: "/quienes-somos/origen-03-pregunta.webp",
    alt: "Exposición ante la comunidad educativa en un auditorio",
  },
] as const;

/** El remate, palabra por palabra: la primera y la última van en verde. */
export const PALABRAS_REMATE = ["Vivir", "para", "hacer", "vivir."] as const;
