// Contenido de Investigación que no vive en los componentes.
//
// «Proyectos y aplicaciones» venía de Qué hacemos (sitemap pág. 02, sección 6)
// y pasa a esta página por pedido de Mateo (2026-09-02): es lo que
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
