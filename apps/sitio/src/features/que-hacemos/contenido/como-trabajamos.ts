import { z } from "zod";
import { foto, grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";
import { PASOS_DEL_METODO } from "../components/mirada-pasos/grupos";

// «Cómo trabajamos» de Qué hacemos: la mirada ED, en seis verbos. Son los seis
// pasos que ED comunica en redes desde agosto de 2026 («La mirada ED»), con
// la idea fuerza textual de cada uno. El texto de cada paso (2026-09-10) es
// lo concreto que pasa en él, tomado del documento maestro (Parte II, «Cómo
// trabajamos», CONFIRMADO): la descripción de Raquel (jul 2026) decía la idea
// pero no qué hace ED, y el cliente dijo que no se entendía. VALIDAR con ED;
// la versión anterior queda en git. La entrada («Siempre comenzamos con una
// conversación») salió el 2026-09-09 y la bajada el 2026-09-11: con el título
// trabado arriba de la pila, los seis verbos ya se ven.
//
// Cada paso lleva foto desde el 2026-09-11, cuando la sección pasó a paneles
// apilados con imagen a la derecha. Los cinco primeros usan las mismas fotos
// que los pasos de Inicio, con su propio texto alternativo; Transformar suma
// una propia. El número de cada paso sale de su lugar en la lista.

const paso = grupo({
  verbo: textoCorto({ maximo: 16, etiqueta: "Verbo", ayuda: "Una palabra, en infinitivo: «Escuchar». También va en el indicador de arriba." }),
  idea: textoCorto({
    maximo: 60,
    etiqueta: "Idea",
    ayuda: "La idea fuerza del paso, destacada, sin punto final. Las cinco primeras son también las frases en verde de los pasos de Inicio.",
  }),
  texto: textoCorto({ maximo: 180, etiqueta: "Texto", ayuda: "Qué pasa concretamente en este paso, en una o dos oraciones." }),
  foto: foto({ etiqueta: "Foto" }),
});

export const esquemaComoTrabajamos = z.object({
  titulo: textoCorto({ maximo: 30, etiqueta: "Título" }),
  pasos: listaFija(PASOS_DEL_METODO, paso, {
    etiqueta: "Pasos",
    etiquetaDelItem: "Paso",
    ayuda: `Son ${PASOS_DEL_METODO}, en este orden: la pila de paneles está armada para seis, en dos grupos de tres.`,
  }),
  aliados: textoCorto({
    maximo: 30,
    etiqueta: "Rótulo de los aliados",
    ayuda: "Encima de los logos, al cierre de la sección. Los logos no se editan acá: son los autorizados del sitio.",
  }),
});

export type ComoTrabajamosDeQueHacemos = z.infer<typeof esquemaComoTrabajamos>;
export type VerboDelMetodo = ComoTrabajamosDeQueHacemos["pasos"][number];

/** El contenido de hoy, tal cual está en el sitio. */
export const comoTrabajamosInicial: ComoTrabajamosDeQueHacemos = {
  titulo: "Cómo trabajamos",
  pasos: [
    {
      verbo: "Escuchar",
      idea: "Toda solución nace de una realidad comprendida",
      texto:
        "Conversamos con la institución o el equipo: necesidades, objetivos, experiencias previas y condiciones reales de implementación.",
      foto: fotoDeRuta("/fotos/grupos-conversan.webp", "Grupos conversan sentados en ronda durante la etapa de escucha"),
    },
    {
      verbo: "Investigar",
      idea: "La práctica también produce conocimiento",
      texto:
        "Estudiamos el problema en su contexto: qué dice la evidencia, qué muestra la experiencia previa y qué hay que comprender antes de diseñar.",
      // La foto es vertical y el panel apaisado: centrada, el recorte dejaba a
      // Daniela sin la cabeza (Gastón, 2026-09-18). Anclada abajo entra entera
      // y el lado inferior de la lámina, que es el que dice «problematización».
      foto: { ...fotoDeRuta("/fotos/conferencia-problematizacion.webp", "Exposición sobre la problematización de la matemática escolar"), foco: { x: 0.5, y: 0.82 } },
    },
    {
      verbo: "Diseñar",
      idea: "Cada realidad inspira una solución distinta",
      texto:
        "Definimos la intervención y convocamos las especialidades que hacen falta: currículo, evaluación, materiales o tecnología, según el problema.",
      foto: fotoDeRuta("/fotos/pizarra-reparto-justo.webp", "Pizarra con los casos de un problema de reparto durante la etapa de diseño"),
    },
    {
      verbo: "Acompañar",
      idea: "Vivimos para hacer vivir",
      texto:
        "Llevamos la propuesta al aula con encuentros, talleres, materiales, trabajo con liderazgos y análisis de clases, y estamos mientras sucede.",
      foto: fotoDeRuta("/fotos/formadora-acompana-grupo.webp", "Una formadora acompaña a un grupo mientras trabaja"),
    },
    {
      verbo: "Evaluar",
      idea: "La evidencia orienta cada nuevo paso",
      texto:
        "Observamos evidencias, interpretamos resultados y ajustamos junto con los equipos, con informes que sirven para decidir.",
      foto: fotoDeRuta("/fotos/producciones-geometricas.webp", "Producciones de estudiantes expuestas para analizarlas durante la evaluación"),
    },
    {
      verbo: "Transformar",
      idea: "Las transformaciones se construyen de manera sistémica",
      texto: "El aprendizaje queda en la institución: criterios, herramientas y decisiones que el equipo sostiene por sí mismo.",
      foto: fotoDeRuta("/fotos/equipo-docente-escuela.webp", "Un equipo docente reunido frente a la pizarra de su escuela"),
    },
  ],
  aliados: "Nos acompañan",
};
