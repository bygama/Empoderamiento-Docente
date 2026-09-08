// Contenido del home que comparten varias piezas de una misma sección.

// ── Los 5 pasos de «Cómo trabajamos» ──────────────────────────────────────
// Copy oficial del cliente [[ed-copy-oficial]]. `resumen` = la frase destacada
// (verde); `detalle` = el texto debajo. Títulos y frases sin punto final; los
// párrafos descriptivos sí lo llevan.
export const PASOS = [
  {
    n: "01",
    slug: "dialogamos",
    titulo: "Dialogamos",
    resumen: "Toda solución nace de una realidad comprendida",
    detalle:
      "Dialogamos con las personas, comprendemos los contextos y analizamos la realidad para construir una lectura compartida que oriente cada decisión.",
    foto: "/metodo/escuchamos.webp",
    fotoAlt: "Docentes en conversación — etapa de diálogo",
  },
  {
    n: "02",
    slug: "investigamos",
    titulo: "Investigamos",
    resumen: "La práctica también produce conocimiento",
    detalle:
      "Investigamos en diálogo permanente con la práctica para comprender los desafíos de cada realidad, generar evidencia y construir soluciones educativas que transformen la enseñanza y el aprendizaje de las matemáticas.",
    foto: "/hero/hero-3.webp",
    fotoAlt: "Equipo investigando en conjunto — etapa de investigación",
  },
  {
    n: "03",
    slug: "diseñamos",
    titulo: "Diseñamos",
    resumen: "Cada realidad inspira una solución distinta",
    detalle:
      "Diseñamos soluciones educativas que integran investigación, currículo, evaluación, materiales didácticos y desarrollo profesional docente para responder a los desafíos de cada contexto.",
    foto: "/metodo/disenamos.webp",
    fotoAlt: "Selección de materiales educativos — etapa de diseño",
  },
  {
    n: "04",
    slug: "implementamos",
    titulo: "Implementamos",
    resumen: "Vivimos para hacer vivir",
    detalle:
      "Construimos procesos donde la experiencia, la implementación y la práctica reflexiva fortalecen el desarrollo profesional y generan nuevas formas de relacionarse con las matemáticas y de fortalecer las decisiones pedagógicas.",
    foto: "/metodo/acompanamos.webp",
    fotoAlt: "Trabajo situado junto a docentes — etapa de implementación",
  },
  {
    n: "05",
    slug: "evaluamos",
    titulo: "Evaluamos",
    resumen: "La evidencia orienta cada nuevo paso",
    detalle:
      "Analizamos procesos, interpretamos evidencias y generamos conocimiento para fortalecer decisiones, consolidar aprendizajes y potenciar nuevas transformaciones.",
    foto: "/metodo/evaluamos.webp",
    fotoAlt: "Revisión de materiales y avances — etapa de evaluación",
  },
] as const;

export type Paso = (typeof PASOS)[number];
