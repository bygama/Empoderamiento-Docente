// ── Cómo trabajamos: la mirada ED, en seis verbos ─────────────────────────────
// Son los seis pasos que ED comunica en redes desde agosto de 2026 («La mirada
// ED»), con la idea fuerza textual de cada uno. El texto de cada paso
// (2026-09-10) es lo concreto que pasa en él, tomado del documento maestro
// (Parte II, «Cómo trabajamos», CONFIRMADO): la descripción de Raquel (jul
// 2026) decía la idea pero no qué hace ED («construimos procesos donde la
// experiencia, la implementación y la práctica reflexiva fortalecen…») y el
// cliente dijo que no se entendía. VALIDAR con ED; la versión anterior queda
// en git. La entrada («Siempre comenzamos con una conversación», textual
// del PPTX institucional) se sacó (Gastón, 2026-09-09): la idea ya está
// dicha en Inicio y en Contacto («Cada propuesta empieza con una
// conversación») y el primer verbo la repite.
// La bajada («Los seis pasos que sigue cada proyecto…») se sacó el 2026-09-11:
// con el título trabado arriba de la pila de paneles, los seis verbos ya se
// ven y la frase no sumaba.
export const MIRADA_INTRO = {
  titulo: "Cómo trabajamos",
} as const;

// Cada paso lleva foto desde el 2026-09-11, cuando la sección pasó a paneles
// apilados con imagen a la derecha. Son las mismas del método que usa el
// home (`home/data.ts`), y los dos verbos que el home no tiene (Escuchar y
// Transformar) suman una propia.
export const MIRADA = [
  {
    verbo: "Escuchar",
    idea: "Toda solución nace de una realidad comprendida",
    texto:
      "Conversamos con la institución o el equipo: necesidades, objetivos, experiencias previas y condiciones reales de implementación.",
    foto: "/fotos/grupos-conversan.webp",
    fotoAlt: "Grupos conversan sentados en ronda durante la etapa de escucha",
  },
  {
    verbo: "Investigar",
    idea: "La práctica también produce conocimiento",
    texto:
      "Estudiamos el problema en su contexto: qué dice la evidencia, qué muestra la experiencia previa y qué hay que comprender antes de diseñar.",
    foto: "/fotos/conferencia-problematizacion.webp",
    fotoAlt: "Exposición sobre la problematización de la matemática escolar",
    // La foto es vertical y el panel apaisado: centrada, el recorte dejaba a
    // Daniela sin la cabeza (Gastón, 2026-09-18). Anclada abajo entra entera
    // y el lado inferior de la lámina, que es el que dice «problematización».
    fotoPos: "object-[50%_82%]",
  },
  {
    verbo: "Diseñar",
    idea: "Cada realidad inspira una solución distinta",
    texto:
      "Definimos la intervención y convocamos las especialidades que hacen falta: currículo, evaluación, materiales o tecnología, según el problema.",
    foto: "/fotos/pizarra-reparto-justo.webp",
    fotoAlt: "Pizarra con los casos de un problema de reparto durante la etapa de diseño",
  },
  {
    verbo: "Acompañar",
    idea: "Vivimos para hacer vivir",
    texto:
      "Llevamos la propuesta al aula con encuentros, talleres, materiales, trabajo con liderazgos y análisis de clases, y estamos mientras sucede.",
    foto: "/fotos/formadora-acompana-grupo.webp",
    fotoAlt: "Una formadora acompaña a un grupo mientras trabaja",
  },
  {
    verbo: "Evaluar",
    idea: "La evidencia orienta cada nuevo paso",
    texto:
      "Observamos evidencias, interpretamos resultados y ajustamos junto con los equipos, con informes que sirven para decidir.",
    foto: "/fotos/producciones-geometricas.webp",
    fotoAlt: "Producciones de estudiantes expuestas para analizarlas durante la evaluación",
  },
  {
    verbo: "Transformar",
    idea: "Las transformaciones se construyen de manera sistémica",
    texto:
      "El aprendizaje queda en la institución: criterios, herramientas y decisiones que el equipo sostiene por sí mismo.",
    foto: "/fotos/equipo-docente-escuela.webp",
    fotoAlt: "Un equipo docente reunido frente a la pizarra de su escuela",
  },
] as const;
