/**
 * Las ocho estaciones de la espiral. Vuelta 1 = ciclo pedagógico (copy
 * según docs/content/arquitectura-investigacion.md §6); vuelta 2 = ciclo
 * de evidencia (§7). Los textos son los canónicos del doc maestro y se
 * comparten entre la lámina animada y la versión estática.
 */
export type Estacion = { nombre: string; texto: string; destacado?: string };

export const VUELTA_1: ReadonlyArray<Estacion> = [
  {
    nombre: "Fase experiencial",
    texto:
      "Las y los participantes viven situaciones que permiten cuestionar sentidos, explorar estrategias y problematizar la matemática escolar desde su propia experiencia.",
    destacado:
      "«Vivir para hacer vivir»: para diseñar nuevos escenarios, el cuerpo docente necesita experimentar otra relación con la matemática.",
  },
  {
    nombre: "Implementación en contexto",
    texto:
      "Las propuestas se interpretan y se llevan a aulas, instituciones o programas reales. No se reproducen mecánicamente: se contextualizan desde el conocimiento profesional de quienes las implementan.",
  },
  {
    nombre: "Práctica reflexiva",
    texto:
      "Se analiza lo ocurrido, se intercambian experiencias, se confrontan decisiones y se observan las respuestas, estrategias y argumentos que produjo la situación.",
  },
  {
    nombre: "Resignificación del conocimiento matemático escolar",
    texto:
      "La experiencia permite revisar sentidos, usos y formas de participación. El conocimiento deja de ser solo un contenido a transmitir: se convierte en una herramienta para comprender y actuar.",
  },
];

export const VUELTA_2: ReadonlyArray<Estacion> = [
  {
    nombre: "Registrar evidencias",
    texto:
      "Recuperamos producciones, decisiones, interacciones, resultados y testimonios, siempre con resguardo ético de docentes, estudiantes e instituciones.",
  },
  {
    nombre: "Analizar e interpretar",
    texto:
      "Leemos las evidencias en relación con las preguntas, el contexto y los objetivos. Una cifra aislada no explica por sí sola qué ocurrió ni por qué.",
  },
  {
    nombre: "Sistematizar y producir conocimiento",
    texto:
      "Organizamos aprendizajes, reconocemos patrones y elaboramos explicaciones: la experiencia se convierte en conocimiento que puede comunicarse, discutirse y transferirse.",
  },
  {
    nombre: "Retroalimentar y ajustar",
    texto:
      "Volvemos sobre el diseño, acompañamos nuevas decisiones y abrimos otro ciclo de investigación y acción.",
  },
];

export const BISAGRA_TEXTO =
  "La cuarta etapa no cierra el ciclo: abre nuevas preguntas. Por eso volvemos a investigar.";

export const REMATE_TEXTO =
  "Implementar es generar una nueva oportunidad para observar, comprender y decidir. La evidencia vuelve al proceso: mejora la intervención y fortalece la capacidad de los equipos.";

export const numero = (i: number) => String(i + 1).padStart(2, "0");
