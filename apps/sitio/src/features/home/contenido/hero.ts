import { z } from "zod";
import { RUTAS_INTERNAS } from "@/config/nav";
import { foto, grupo, listaFija, rutaInterna, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";
import { GEOMETRIA_CARDS, GEOMETRIA_MOBILE } from "../components/hero/geometria-hero";

// El hero de Inicio: lo que se edita (SPEC §4.1) y lo que se ve sin base. La
// cantidad de tarjetas sale de la geometría para que las dos listas no se
// desfasen nunca.

const boton = (etiqueta: string) =>
  grupo({ texto: textoCorto({ maximo: 18, etiqueta: "Texto" }), ruta: rutaInterna(RUTAS_INTERNAS, { etiqueta: "Adónde lleva" }) }, { etiqueta });

const tarjeta = grupo({
  foto: foto({ etiqueta: "Foto" }),
  // Los máximos del cartel llevan aire a propósito (24→30, 48→60): con el
  // tope al ras, quien edita chocaba contra `maxLength` en el primer intento
  // de escribir casi cualquier otra cosa. La escena sigue calibrada para
  // textos de ese orden; no es una licencia para carteles mucho más largos.
  cartel: grupo(
    { titulo: textoCorto({ maximo: 30, etiqueta: "Título" }), descripcion: textoCorto({ maximo: 60, etiqueta: "Descripción" }) },
    { etiqueta: "Cartel", ayuda: "Flota sobre la foto: dos o tres palabras y una frase corta." },
  ).nullable(),
});

export const esquemaHero = z.object({
  // Mismo motivo que el cartel: 60→72 de aire para no chocar con el tope apenas se empieza a editar.
  titulo: textoCorto({ maximo: 72, etiqueta: "Título", ayuda: "Dos renglones en pantalla. Se anima palabra por palabra y la última va en verde." }),
  bajada: textoCorto({ maximo: 140, etiqueta: "Bajada" }),
  botonPrincipal: boton("Botón principal (naranja)"),
  botonSecundario: boton("Botón secundario"),
  tarjetas: listaFija(GEOMETRIA_CARDS.length, tarjeta, {
    etiqueta: "Tarjetas (computadora)",
    etiquetaDelItem: "Tarjeta",
    ayuda: `Son ${GEOMETRIA_CARDS.length} tarjetas: la escena del hero está armada para exactamente esa cantidad. Seis llevan cartel (la 1, 3, 5, 6, 8 y 11).`,
  }),
  tarjetasCelular: listaFija(GEOMETRIA_MOBILE.length, grupo({ foto: foto({ etiqueta: "Foto" }) }), {
    etiqueta: "Tarjetas (celular)",
    etiquetaDelItem: "Tarjeta",
    ayuda: `Son ${GEOMETRIA_MOBILE.length} tarjetas: en el celular la escena muestra exactamente esa cantidad, casi todas repetidas de las de computadora.`,
  }),
});

export type Hero = z.infer<typeof esquemaHero>;

/** El contenido de hoy, tal cual está en el sitio: lo que se ve sin base y lo que se carga la primera vez. */
export const heroInicial: Hero = {
  titulo: "La transformación educativa comienza en las matemáticas.",
  bajada: "Escuchamos cada realidad y diseñamos soluciones educativas a medida, con base en la investigación y más de 15 años de experiencia.",
  // La acción principal al final del recorrido del ojo, y del lado en que el navbar tiene Contacto (Gastón, 2026-09-11).
  botonPrincipal: { texto: "Contactanos", ruta: "/contacto" },
  botonSecundario: { texto: "Qué hacemos", ruta: "/que-hacemos" },
  // Las fotos son de la carpeta que aprobó ED (`public/fotos/`), en el orden de GEOMETRIA_CARDS.
  tarjetas: [
    { foto: fotoDeRuta("/fotos/docentes-trabajan-aula.webp", "Docentes resuelven una tarea en un aula"), cartel: { titulo: "En el aula", descripcion: "Acompañamos el aprendizaje donde sucede" } },
    { foto: fotoDeRuta("/fotos/globos-medicion.webp", "Docentes miden alturas con globos durante un taller"), cartel: null },
    { foto: fotoDeRuta("/fotos/exposicion-grafica.webp", "Una formadora señala una gráfica durante una clase"), cartel: { titulo: "Investigación aplicada", descripcion: "Conocimiento que vuelve al aula" } },
    { foto: fotoDeRuta("/fotos/materiales-sobre-la-mesa.webp", "Estudiantes trabajan con papeles de colores sobre una mesa"), cartel: null },
    { foto: fotoDeRuta("/fotos/formadora-guia-taller.webp", "Una formadora guía a docentes durante un taller"), cartel: { titulo: "Acompañamiento situado", descripcion: "Junto a cada docente y escuela" } },
    { foto: fotoDeRuta("/fotos/encuentro-mesas-rojas.webp", "Encuentro de formación docente con mesas de trabajo"), cartel: { titulo: "Formación docente", descripcion: "Trayectos para docentes de matemáticas" } },
    { foto: fotoDeRuta("/fotos/grupo-en-ronda.webp", "Un grupo discute una tarea sentado en ronda"), cartel: null },
    { foto: fotoDeRuta("/fotos/encuentro-institucional.webp", "Docentes e instituciones reunidas en un encuentro en México"), cartel: { titulo: "Presencia regional", descripcion: "Chile · México · Argentina · Colombia · Brasil" } },
    { foto: fotoDeRuta("/fotos/formadora-sentada-grupo.webp", "Una formadora trabaja sentada junto a un grupo"), cartel: null },
    { foto: fotoDeRuta("/fotos/mesa-con-materiales.webp", "Docentes trabajan con materiales alrededor de una mesa"), cartel: null },
    { foto: fotoDeRuta("/fotos/cubos-dos-manos.webp", "Dos cubos de papel armados, uno en cada mano"), cartel: { titulo: "Materiales propios", descripcion: "Recursos listos para llevar al aula" } },
  ],
  // En el orden de GEOMETRIA_MOBILE. Solo `comparar-tareas-ronda` es exclusiva del celular.
  tarjetasCelular: [
    { foto: fotoDeRuta("/fotos/docentes-trabajan-aula.webp", "Docentes resuelven una tarea en un aula") },
    { foto: fotoDeRuta("/fotos/comparar-tareas-ronda.webp", "Docentes en ronda comparan dos tareas") },
    { foto: fotoDeRuta("/fotos/formadora-guia-taller.webp", "Una formadora guía a docentes durante un taller") },
    { foto: fotoDeRuta("/fotos/encuentro-mesas-rojas.webp", "Encuentro de formación docente con mesas de trabajo") },
    { foto: fotoDeRuta("/fotos/encuentro-institucional.webp", "Docentes e instituciones reunidas en un encuentro en México") },
    { foto: fotoDeRuta("/fotos/grupo-en-ronda.webp", "Un grupo discute una tarea sentado en ronda") },
    { foto: fotoDeRuta("/fotos/cubos-dos-manos.webp", "Dos cubos de papel armados") },
    { foto: fotoDeRuta("/fotos/mesa-con-materiales.webp", "Docentes trabajan con materiales alrededor de una mesa") },
  ],
};
