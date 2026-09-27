import { z } from "zod";
import { grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { unaResaltada } from "./comunes";

// «Ciclo de investigación aplicada»: la espiral doble de la hoja 03. Ocho
// estaciones en dos vueltas de cuatro —el ciclo pedagógico (copy de
// docs/content/arquitectura-investigacion.md §6) y el de evidencia (§7)—,
// una por nodo de la espiral, así que son cuatro y cuatro. Cada estación
// tiene dos versiones de la misma idea: el texto, canónico del doc maestro,
// para la versión sin animación (celular, sin movimiento y el SSR), y la
// breve para la lámina animada, pedida por el owner el 2026-09-07 («son muy
// largos»). Pendiente de validación de contenido.

const estacion = grupo({
  nombre: textoCorto({
    maximo: 40,
    etiqueta: "Nombre",
    ayuda: "En la lámina va en un renglón, en una caja afinada para el largo de hoy: si lo alargás, revisalo en pantalla.",
  }),
  texto: textoCorto({ maximo: 240, etiqueta: "Texto", ayuda: "La versión completa: la ven el celular y quien navega sin animaciones." }),
  breve: unaResaltada({
    maximo: 190,
    etiqueta: "Versión breve",
    ayuda: "La misma idea en menos palabras, para la lámina animada, en tres renglones. La parte entre **dobles asteriscos** se subraya en verde.",
  }),
  destacado: textoCorto({ maximo: 160, etiqueta: "Destacado", ayuda: "Una cita debajo del texto, solo en la versión sin animación." }).nullable(),
});

const vuelta = (etiqueta: string, ayuda: string) => listaFija(4, estacion, { etiqueta, etiquetaDelItem: "Estación", ayuda });

export const esquemaCiclo = z.object({
  titulo: unaResaltada({
    maximo: 70,
    etiqueta: "Título",
    ayuda: "Abre la hoja. La parte entre **dobles asteriscos** lleva el marcador verde.",
  }),
  pedagogico: vuelta("Ciclo pedagógico", "La vuelta de adentro de la espiral: son 4, una por nodo."),
  bisagra: textoCorto({ maximo: 110, etiqueta: "Bisagra", ayuda: "Cierra el ciclo pedagógico en la versión sin animación." }),
  tituloEvidencia: unaResaltada({
    maximo: 40,
    etiqueta: "Título de la evidencia",
    ayuda: "Abre el ciclo de evidencia en la versión sin animación. La parte entre **dobles asteriscos** lleva el marcador verde.",
  }),
  remate: textoCorto({
    maximo: 210,
    etiqueta: "Remate",
    ayuda: "En la lámina aterriza sobre el primer nodo, al final; sin animación, va debajo del título de la evidencia.",
  }),
  evidencia: vuelta("Ciclo de evidencia", "La vuelta de afuera de la espiral: son 4, una por nodo."),
});

export type Ciclo = z.infer<typeof esquemaCiclo>;
export type Estacion = Ciclo["pedagogico"][number];

/** El contenido de hoy, tal cual está en el sitio. */
export const cicloInicial: Ciclo = {
  titulo: "Cómo una **experiencia** se convierte en transformación.",
  pedagogico: [
    {
      nombre: "Fase experiencial",
      texto:
        "Las y los participantes viven situaciones que permiten cuestionar sentidos, explorar estrategias y problematizar la matemática escolar desde su propia experiencia.",
      breve:
        "Las y los participantes **viven situaciones** para cuestionar sentidos, explorar estrategias y problematizar la matemática escolar desde su propia experiencia.",
      destacado:
        "«Vivir para hacer vivir»: para diseñar nuevos escenarios, el cuerpo docente necesita experimentar otra relación con la matemática.",
    },
    {
      nombre: "Implementación en contexto",
      texto:
        "Las propuestas se interpretan y se llevan a aulas, instituciones o programas reales. No se reproducen mecánicamente: se contextualizan desde el conocimiento profesional de quienes las implementan.",
      // «saber profesional» en vez de «conocimiento profesional» (2026-09-14):
      // con el cuerpo nuevo, la caja lateral no da para un renglón más.
      breve:
        "Las propuestas se llevan a aulas, instituciones o **programas reales**, contextualizadas desde el saber profesional de quienes las implementan.",
      destacado: null,
    },
    {
      nombre: "Práctica reflexiva",
      texto:
        "Se analiza lo ocurrido, se intercambian experiencias, se confrontan decisiones y se observan las respuestas, estrategias y argumentos que produjo la situación.",
      breve: "Se analiza lo ocurrido, se intercambian experiencias y se **confrontan decisiones** a partir de lo que produjo la situación.",
      destacado: null,
    },
    {
      // 2026-09-14: el nombre oficial es «Resignificación del conocimiento
      // matemático escolar»; en la lámina el nombre va en un renglón sin
      // excepción y ese no entra en ninguna caja lateral. A validar con ED.
      nombre: "Resignificación del saber",
      texto:
        "La experiencia permite revisar sentidos, usos y formas de participación. El conocimiento deja de ser solo un contenido a transmitir: se convierte en una herramienta para comprender y actuar.",
      breve: "El conocimiento deja de ser solo un contenido a transmitir: se convierte en una herramienta para **comprender y actuar**.",
      destacado: null,
    },
  ],
  bisagra: "La cuarta etapa no cierra el ciclo: abre nuevas preguntas. Por eso volvemos a investigar.",
  tituloEvidencia: "Implementar no es **terminar**.",
  remate:
    "Implementar es generar una nueva oportunidad para observar, comprender y decidir. La evidencia vuelve al proceso: mejora la intervención y fortalece la capacidad de los equipos.",
  evidencia: [
    {
      nombre: "Registrar evidencias",
      texto:
        "Recuperamos producciones, decisiones, interacciones, resultados y testimonios, siempre con resguardo ético de docentes, estudiantes e instituciones.",
      breve: "Recuperamos producciones, decisiones, resultados y testimonios, con **resguardo ético** de docentes, estudiantes e instituciones.",
      destacado: null,
    },
    {
      nombre: "Analizar e interpretar",
      texto:
        "Leemos las evidencias en relación con las preguntas, el contexto y los objetivos. Una cifra aislada no explica por sí sola qué ocurrió ni por qué.",
      breve: "Leemos las evidencias en relación con las preguntas, el contexto y los objetivos. **Una cifra aislada** no explica qué ocurrió.",
      destacado: null,
    },
    {
      nombre: "Sistematizar y producir conocimiento",
      texto:
        "Organizamos aprendizajes, reconocemos patrones y elaboramos explicaciones: la experiencia se convierte en conocimiento que puede comunicarse, discutirse y transferirse.",
      breve: "Reconocemos patrones y elaboramos explicaciones: la experiencia se convierte en conocimiento que **puede comunicarse** y transferirse.",
      destacado: null,
    },
    {
      nombre: "Retroalimentar y ajustar",
      texto: "Volvemos sobre el diseño, acompañamos nuevas decisiones y abrimos otro ciclo de investigación y acción.",
      breve: "Volvemos sobre el diseño, acompañamos nuevas decisiones y **abrimos otro ciclo** de investigación y acción.",
      destacado: null,
    },
  ],
};
