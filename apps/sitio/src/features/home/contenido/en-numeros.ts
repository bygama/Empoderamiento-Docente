import { z } from "zod";
import { grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { partirCifra } from "./cifra";

// «En números» de Inicio: las cuatro métricas de la franja azul. Los logos de
// abajo no son de acá: son la tabla `aliados`, que se edita en Contenido ›
// Aliados (AGENTS.md §5.4).
//
// Las cifras salen de los proyectos documentados en el CV de Daniela, uno por
// uno en docs/content/que-hace-ed-fuentes.md §6: los cuatro programas con la
// Subsecretaría de Educación Media Superior de México (5.900 + 1.900 + 3.060 +
// 3.500), Yucatán (75) y Techint (15) suman 14.450 docentes en cursos propios;
// el Plan Nacional Aprender Matemática formó 500 formadores que llegaron a
// 75.000 docentes. Los cinco países son los de Ajustes › Datos del sitio.
// Falta que Daniela confirme si cuenta la etapa 2018-2020, hecha desde el
// Cinvestav con ella como coordinadora, y cuántas escuelas son.

const dato = grupo({
  cifra: textoCorto({
    maximo: 9,
    etiqueta: "Cifra",
    ayuda: "Como se lee: «+15», «+14.000», «500». El número cuenta desde cero al entrar.",
  }).refine((cifra) => partirCifra(cifra) !== null, "La cifra tiene que llevar un número entero, como «+15» o «14.000»."),
  etiqueta: textoCorto({ maximo: 28, etiqueta: "Qué cuenta" }),
  nota: textoCorto({ maximo: 80, etiqueta: "Nota" }),
});

export const esquemaEnNumeros = z.object({
  datos: listaFija(4, dato, {
    etiqueta: "Datos",
    etiquetaDelItem: "Dato",
    ayuda: "Son 4: la grilla está armada para cuatro. Cada cifra sale de un documento de ED: no se redondea para arriba.",
  }),
});

export type EnNumeros = z.infer<typeof esquemaEnNumeros>;

/** El contenido de hoy, tal cual está en el sitio. */
export const enNumerosInicial: EnNumeros = {
  datos: [
    { cifra: "+15", etiqueta: "Años de trayectoria", nota: "Diseñando intervenciones situadas." },
    { cifra: "+14.000", etiqueta: "Docentes", nota: "En programas de desarrollo profesional en Matemáticas." },
    { cifra: "500", etiqueta: "Formadoras y formadores", nota: "Que llevaron el Plan Nacional Aprender Matemática a 75.000 docentes." },
    { cifra: "5", etiqueta: "Países", nota: "Argentina, México, Chile, Colombia y Brasil." },
  ],
};
