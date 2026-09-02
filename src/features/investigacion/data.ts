// Contenido de Investigación que no vive en los componentes.
//
// «Cómo trabajamos» y «Proyectos y aplicaciones» venían de Qué hacemos
// (sitemap pág. 02, secciones 3 y 6) y pasan a esta página por pedido de
// Mateo (2026-09-02): el método con la investigación como hilo, y lo que
// investigamos, puesto a trabajar. Las 5 áreas salen del modelo conceptual
// (PENDIENTE reemplazar por proyectos reales con nombre cuando el cliente
// pase el material; no inventar casos) y la CINTA lleva producción real.

// ── Proyectos y aplicaciones — 5 áreas del modelo conceptual ─────────────────
// PENDIENTE: reemplazar por proyectos reales con nombre cuando el cliente
// pase el material. No inventar casos concretos.
export const PROYECTO_AREAS = [
  {
    titulo: "Desarrollo profesional docente",
    d: "Workshops, diplomados, acompañamiento y comunidades de práctica.",
    etiqueta: "Workshops · Diplomados",
  },
  {
    titulo: "Diseño curricular y pedagógico",
    d: "Currícula, materiales, guías didácticas y situaciones de aprendizaje.",
    etiqueta: "Guías didácticas",
  },
  {
    titulo: "Evaluación e investigación aplicada",
    d: "Instrumentos, análisis y evaluación de impacto.",
    etiqueta: "Evaluación de impacto",
  },
  {
    titulo: "Fortalecimiento de sistemas",
    d: "Acompañamiento a ministerios, redes escolares y escuelas técnicas.",
    etiqueta: "Ministerios · Redes",
  },
  {
    titulo: "Recursos y plataformas",
    d: "Baterías de pensamiento matemático y repositorios de prácticas.",
    etiqueta: "Baterías de pensamiento",
  },
] as const;

// Cinta continua con producción real de ED (dato concreto, no inventado).
export const CINTA = [
  "Artículo · RELIME 2025",
  "Capítulo · Bolema 2025",
  "Libro · Empoderamiento docente y Socioepistemología",
  "Cinco países de América Latina",
  "Congresos internacionales",
  "Redes de investigación",
] as const;

// ── Cómo trabajamos — el camino de un proyecto (4 pasos, viaje horizontal) ───
// Versión corta orientada a quien contrata; el método completo (5 pasos con
// copy oficial) vive en el home. PENDIENTE validar con cliente.
export const PASOS_TRABAJO = [
  {
    n: "01",
    verbo: "Dialogamos",
    texto:
      "Escuchamos tu contexto: qué pasa en tus aulas, qué buscás, desde dónde partimos.",
    foto: "/metodo/escuchamos.webp",
  },
  {
    n: "02",
    verbo: "Diseñamos",
    texto:
      "Armamos una propuesta a medida para ese contexto, con sustento en investigación.",
    foto: "/metodo/disenamos.webp",
  },
  {
    n: "03",
    verbo: "Acompañamos",
    texto:
      "Trabajamos junto a docentes y equipos, en el aula y en el territorio.",
    foto: "/metodo/acompanamos.webp",
  },
  {
    n: "04",
    verbo: "Evaluamos",
    texto:
      "Generamos evidencia del proceso; los hallazgos orientan el paso siguiente.",
    foto: "/metodo/evaluamos.webp",
  },
] as const;
