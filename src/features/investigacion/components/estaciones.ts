/**
 * Las ocho estaciones de la espiral. Vuelta 1 = ciclo pedagógico (copy
 * según docs/content/arquitectura-investigacion.md §6); vuelta 2 = ciclo
 * de evidencia (§7). `texto` y `destacado` son los canónicos del doc
 * maestro y los usa la versión estática (y el SSR). `breve` es la versión
 * corta para las anotaciones de la lámina, pedida por el owner el
 * 2026-09-07 («son muy largos»): misma idea, menos palabras; el destacado
 * no va en la lámina. `clave` es la frase de `breve` que la lámina subraya
 * en verde (conceptos): tiene que aparecer literal dentro de `breve`.
 * Pendiente de validación de contenido.
 */
export type Estacion = {
  nombre: string;
  texto: string;
  breve: string;
  clave: string;
  destacado?: string;
};

export const VUELTA_1: ReadonlyArray<Estacion> = [
  {
    nombre: "Fase experiencial",
    texto:
      "Las y los participantes viven situaciones que permiten cuestionar sentidos, explorar estrategias y problematizar la matemática escolar desde su propia experiencia.",
    breve:
      "Las y los participantes viven situaciones para cuestionar sentidos, explorar estrategias y problematizar la matemática escolar desde su propia experiencia.",
    clave: "viven situaciones",
    destacado:
      "«Vivir para hacer vivir»: para diseñar nuevos escenarios, el cuerpo docente necesita experimentar otra relación con la matemática.",
  },
  {
    nombre: "Implementación en contexto",
    texto:
      "Las propuestas se interpretan y se llevan a aulas, instituciones o programas reales. No se reproducen mecánicamente: se contextualizan desde el conocimiento profesional de quienes las implementan.",
    breve:
      "Las propuestas se llevan a aulas, instituciones o programas reales, contextualizadas desde el conocimiento profesional de quienes las implementan.",
    clave: "programas reales",
  },
  {
    nombre: "Práctica reflexiva",
    texto:
      "Se analiza lo ocurrido, se intercambian experiencias, se confrontan decisiones y se observan las respuestas, estrategias y argumentos que produjo la situación.",
    breve:
      "Se analiza lo ocurrido, se intercambian experiencias y se confrontan decisiones a partir de lo que produjo la situación.",
    clave: "confrontan decisiones",
  },
  {
    nombre: "Resignificación del conocimiento matemático escolar",
    texto:
      "La experiencia permite revisar sentidos, usos y formas de participación. El conocimiento deja de ser solo un contenido a transmitir: se convierte en una herramienta para comprender y actuar.",
    breve:
      "El conocimiento deja de ser solo un contenido a transmitir: se convierte en una herramienta para comprender y actuar.",
    clave: "comprender y actuar",
  },
];

export const VUELTA_2: ReadonlyArray<Estacion> = [
  {
    nombre: "Registrar evidencias",
    texto:
      "Recuperamos producciones, decisiones, interacciones, resultados y testimonios, siempre con resguardo ético de docentes, estudiantes e instituciones.",
    breve:
      "Recuperamos producciones, decisiones, resultados y testimonios, con resguardo ético de docentes, estudiantes e instituciones.",
    clave: "resguardo ético",
  },
  {
    nombre: "Analizar e interpretar",
    texto:
      "Leemos las evidencias en relación con las preguntas, el contexto y los objetivos. Una cifra aislada no explica por sí sola qué ocurrió ni por qué.",
    breve:
      "Leemos las evidencias en relación con las preguntas, el contexto y los objetivos. Una cifra aislada no explica qué ocurrió.",
    clave: "Una cifra aislada",
  },
  {
    nombre: "Sistematizar y producir conocimiento",
    texto:
      "Organizamos aprendizajes, reconocemos patrones y elaboramos explicaciones: la experiencia se convierte en conocimiento que puede comunicarse, discutirse y transferirse.",
    breve:
      "Reconocemos patrones y elaboramos explicaciones: la experiencia se convierte en conocimiento que puede comunicarse y transferirse.",
    clave: "puede comunicarse",
  },
  {
    nombre: "Retroalimentar y ajustar",
    texto:
      "Volvemos sobre el diseño, acompañamos nuevas decisiones y abrimos otro ciclo de investigación y acción.",
    breve:
      "Volvemos sobre el diseño, acompañamos nuevas decisiones y abrimos otro ciclo de investigación y acción.",
    clave: "abrimos otro ciclo",
  },
];

export const BISAGRA_TEXTO =
  "La cuarta etapa no cierra el ciclo: abre nuevas preguntas. Por eso volvemos a investigar.";

export const REMATE_TEXTO =
  "Implementar es generar una nueva oportunidad para observar, comprender y decidir. La evidencia vuelve al proceso: mejora la intervención y fortalece la capacidad de los equipos.";

export const numero = (i: number) => String(i + 1).padStart(2, "0");
