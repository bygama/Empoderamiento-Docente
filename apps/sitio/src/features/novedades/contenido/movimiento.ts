import { z } from "zod";
import { foto, grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";

// «ED en movimiento»: los momentos que salen de la luz del faro y se acercan
// con el scroll. La escena calcula a mano el lugar de cada uno (su lado y su
// altura), así que son exactamente seis.

const MOMENTOS = 6;

const momento = grupo({
  etiqueta: textoCorto({ maximo: 20, etiqueta: "Etiqueta", ayuda: "Chica, en mayúsculas, abajo de la foto." }),
  frase: textoCorto({ maximo: 40, etiqueta: "Frase", ayuda: "La que aparece grande al centro cuando el momento pasa cerca." }),
  acento: textoCorto({ maximo: 30, etiqueta: "Acento", ayuda: "El pedazo de la frase que va en verde: tiene que estar escrito igual en la frase." }),
  foto: foto({ etiqueta: "Foto", ayuda: "Acá la foto es decorativa: la frase dice el momento. El texto alternativo igual queda con la foto." }),
}).refine((m) => m.frase.includes(m.acento), { message: "El acento tiene que estar escrito igual en la frase.", path: ["acento"] });

export const esquemaMovimientoDeNovedades = z.object({
  momentos: listaFija(MOMENTOS, momento, {
    etiqueta: "Momentos",
    etiquetaDelItem: "Momento",
    ayuda: `Son ${MOMENTOS}: la escena está armada para exactamente esa cantidad, alternando izquierda y derecha.`,
  }),
});

export type MovimientoDeNovedades = z.infer<typeof esquemaMovimientoDeNovedades>;

/** El contenido de hoy, tal cual está en el sitio. */
export const movimientoDeNovedadesInicial: MovimientoDeNovedades = {
  momentos: [
    { etiqueta: "EN LAS AULAS", frase: "Empieza en el aula.", acento: "el aula.", foto: fotoDeRuta("/fotos/docentes-trabajan-aula.webp", "Docentes resuelven una tarea en un aula") },
    { etiqueta: "CON DOCENTES", frase: "Junto a quienes enseñan.", acento: "quienes enseñan.", foto: fotoDeRuta("/fotos/formadora-guia-taller.webp", "Una formadora guía a docentes durante un taller") },
    {
      etiqueta: "INVESTIGACIÓN",
      frase: "Investigamos lo que hacemos.",
      acento: "lo que hacemos.",
      foto: fotoDeRuta("/fotos/pizarra-umce.webp", "Tres formadoras junto a la pizarra de una sesión en la Universidad Metropolitana de Ciencias de la Educación"),
    },
    { etiqueta: "DISEÑO", frase: "Diseñamos tareas que importan.", acento: "tareas que importan.", foto: fotoDeRuta("/fotos/cubos-mano.webp", "Cubos de papel armados en la palma de una mano") },
    { etiqueta: "CONGRESOS", frase: "Lo llevamos a la región.", acento: "a la región.", foto: fotoDeRuta("/fotos/encuentro-mesas-rojas.webp", "Encuentro de formación docente con mesas de trabajo") },
    { etiqueta: "CINCO PAÍSES", frase: "En cinco países, a la vez.", acento: "cinco países", foto: fotoDeRuta("/fotos/aula-consigna-proyectada.webp", "Docentes en un aula resuelven una consigna proyectada en la pizarra") },
  ],
};
