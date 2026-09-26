import { z } from "zod";
import { foto, grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";

// «Cómo trabajamos» de Inicio: los cinco pasos del método, que se cross-fadean
// con el scroll. Copy oficial del cliente [[ed-copy-oficial]]: títulos y frases
// sin punto final, los detalles con punto. El número de cada paso sale de su
// lugar en la lista: no se edita.

const paso = grupo({
  titulo: textoCorto({ maximo: 16, etiqueta: "Título", ayuda: "Una palabra, en grande: «Dialogamos»." }),
  frase: textoCorto({ maximo: 56, etiqueta: "Frase", ayuda: "Va en verde, en un renglón en la computadora." }),
  detalle: textoCorto({ maximo: 260, etiqueta: "Detalle" }),
  foto: foto({ etiqueta: "Foto" }),
});

export const esquemaComoTrabajamos = z.object({
  pasos: listaFija(5, paso, {
    etiqueta: "Pasos",
    etiquetaDelItem: "Paso",
    ayuda: "Son 5 pasos: la escena está armada para cinco. Qué hacemos tiene su propia versión del método: si cambiás un paso acá, revisala allá.",
  }),
});

export type ComoTrabajamos = z.infer<typeof esquemaComoTrabajamos>;

/** El contenido de hoy, tal cual está en el sitio. */
export const comoTrabajamosInicial: ComoTrabajamos = {
  pasos: [
    {
      titulo: "Dialogamos",
      frase: "Toda solución nace de una realidad comprendida",
      detalle:
        "Dialogamos con las personas, comprendemos los contextos y analizamos la realidad para construir una lectura compartida que oriente cada decisión.",
      foto: fotoDeRuta("/fotos/grupos-conversan.webp", "Grupos conversan sentados en ronda — etapa de diálogo"),
    },
    {
      titulo: "Investigamos",
      frase: "La práctica también produce conocimiento",
      detalle:
        "Investigamos en diálogo permanente con la práctica para comprender los desafíos de cada realidad, generar evidencia y construir soluciones educativas que transformen la enseñanza y el aprendizaje de las matemáticas.",
      foto: fotoDeRuta("/fotos/conferencia-problematizacion.webp", "Exposición sobre la problematización de la matemática escolar — etapa de investigación"),
    },
    {
      titulo: "Diseñamos",
      frase: "Cada realidad inspira una solución distinta",
      detalle:
        "Diseñamos soluciones educativas que integran investigación, currículo, evaluación, materiales didácticos y desarrollo profesional docente para responder a los desafíos de cada contexto.",
      foto: fotoDeRuta("/fotos/pizarra-reparto-justo.webp", "Pizarra con los casos de un problema de reparto — etapa de diseño"),
    },
    {
      titulo: "Implementamos",
      frase: "Vivimos para hacer vivir",
      detalle:
        "Construimos procesos donde la experiencia, la implementación y la práctica reflexiva fortalecen el desarrollo profesional y generan nuevas formas de relacionarse con las matemáticas y de fortalecer las decisiones pedagógicas.",
      foto: fotoDeRuta("/fotos/formadora-acompana-grupo.webp", "Una formadora acompaña a un grupo mientras trabaja — etapa de implementación"),
    },
    {
      titulo: "Evaluamos",
      frase: "La evidencia orienta cada nuevo paso",
      detalle:
        "Analizamos procesos, interpretamos evidencias y generamos conocimiento para fortalecer decisiones, consolidar aprendizajes y potenciar nuevas transformaciones.",
      foto: fotoDeRuta("/fotos/producciones-geometricas.webp", "Producciones de estudiantes expuestas para analizarlas — etapa de evaluación"),
    },
  ],
};
