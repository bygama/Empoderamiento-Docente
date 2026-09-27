import { z } from "zod";
import { foto, grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";
import { RESALTADO_SIN_CERRAR, resaltadoExacto, resaltadoValido } from "@/lib/contenido/resaltado";
import { NODOS, PILARES } from "../components/origen/data";

// «Origen, sentido y evolución» de Quiénes somos: la historia en cinco
// tiempos que se cuenta con el scroll. Basado en los videos del cliente
// (resumen videos.txt §1–3). La cita es una dramatización del testimonio del
// video 2 —VALIDAR con el cliente antes de publicar—. Los nombres de los tres
// pilares (01 Origen · 02 Sentido · 03 Evolución) son estructura
// (origen/data.ts), igual que la curva de los hitos.

export const esquemaOrigen = z.object({
  origen: grupo(
    {
      titulo: textoCorto({ maximo: 32, etiqueta: "Título", ayuda: "Se arma letra por letra y, al avanzar, las letras estallan." }),
      texto: textoCorto({ maximo: 160, etiqueta: "Texto" }),
    },
    { etiqueta: "01 — Origen" },
  ),
  sentido: grupo(
    {
      cita: listaFija(3, textoCorto({ maximo: 32, etiqueta: "Renglón" }), {
        etiqueta: "La cita",
        etiquetaDelItem: "Renglón",
        ayuda: "Tres renglones, cada uno en su línea; el tercero va en verde. El tamaño está medido para el primero: si lo alargás mucho, puede no entrar.",
      }),
      quien: textoCorto({ maximo: 110, etiqueta: "Quién la dijo", ayuda: "Debajo de la cita, con la raya adelante: «— Una profesora…»." }),
    },
    { etiqueta: "02 — Sentido", ayuda: "La cita es una dramatización del testimonio de una profesora: validala con ED antes de cambiarla." },
  ),
  evolucion: grupo(
    {
      pregunta: textoCorto({
        maximo: 30,
        etiqueta: "Pregunta",
        ayuda: "Se escribe letra por letra con el scroll: con más de unas 26 letras se pisa con la respuesta.",
      }),
      respuesta: textoCorto({ maximo: 180, etiqueta: "Respuesta" }),
    },
    { etiqueta: "03 — Evolución" },
  ),
  queEs: grupo(
    {
      volanta: textoCorto({ maximo: 40, etiqueta: "Volanta" }),
      titulo: textoCorto({ maximo: 70, etiqueta: "Título", ayuda: "La definición de ED. Lo que va entre **dobles asteriscos** va en verde." }).refine(
        (texto) => resaltadoValido(texto, { exactamente: 1 }),
        resaltadoExacto(1),
      ),
      hitos: listaFija(
        NODOS.length,
        grupo({
          titulo: textoCorto({ maximo: 14, etiqueta: "Título", ayuda: "Una palabra: «Maestría»." }),
          texto: textoCorto({ maximo: 110, etiqueta: "Texto" }),
        }),
        {
          etiqueta: "Hitos",
          etiquetaDelItem: "Hito",
          ayuda: `Son ${NODOS.length}, en orden: la línea de la trayectoria pasa por ${NODOS.length} puntos. El último va en naranja.`,
        },
      ),
    },
    { etiqueta: "Qué es ED" },
  ),
  remate: grupo(
    {
      frase: textoCorto({ maximo: 40, etiqueta: "Frase", ayuda: "Llega palabra por palabra. Lo que va entre **dobles asteriscos** va en verde." }).refine(
        (texto) => resaltadoValido(texto),
        RESALTADO_SIN_CERRAR,
      ),
      texto: textoCorto({ maximo: 160, etiqueta: "Texto" }),
    },
    { etiqueta: "El remate" },
  ),
  fotos: listaFija(PILARES.length, foto({ etiqueta: "Foto" }), {
    etiqueta: "Fotos",
    etiquetaDelItem: "Foto",
    ayuda: "Una por pilar (origen, sentido, evolución), en el panel de la derecha. Se ven solo en la computadora, con movimiento.",
  }),
});

export type OrigenDeQuienesSomos = z.infer<typeof esquemaOrigen>;
export type HitoDelOrigen = OrigenDeQuienesSomos["queEs"]["hitos"][number];

/** El contenido de hoy, tal cual está en el sitio. */
export const origenInicial: OrigenDeQuienesSomos = {
  origen: {
    titulo: "No nacimos de una teoría.",
    texto: "Nacimos en aulas reales, discutiendo la matemática a fondo con docentes de distintos estados de México.",
  },
  sentido: {
    cita: ["Estaba a punto de jubilarme.", "Ahora quiero volver:", "quiero transformar el aula."],
    quien: "— Una profesora, al cerrar uno de los primeros encuentros de formación docente en México.",
  },
  evolucion: {
    pregunta: "¿Cómo fue tomando forma ED?",
    respuesta: "Esa convicción se volvió maestría, doctorado e investigación, y después procesos de desarrollo profesional en México y Argentina.",
  },
  queEs: {
    volanta: "Qué es Empoderamiento Docente",
    titulo: "Una convicción convertida en **investigación y acción**.",
    hitos: [
      { titulo: "Maestría", texto: "El comienzo: observar y comprender lo que ocurría con las y los docentes." },
      { titulo: "Doctorado", texto: "Explicaciones propias y años de investigación e intervención." },
      { titulo: "México", texto: "Parte de procesos de desarrollo profesional docente a nivel nacional." },
      { titulo: "Argentina", texto: "La expansión regional, sosteniendo la misma filosofía de trabajo." },
      { titulo: "Hoy", texto: "Una línea de investigación viva y una consultora que impulsa transformación educativa." },
    ],
  },
  remate: {
    frase: "**Vivir** para hacer **vivir.**",
    texto: "Para transformar el aprendizaje, el cuerpo docente necesita primero vivir una nueva relación con la matemática.",
  },
  fotos: [
    fotoDeRuta("/fotos/docentes-trabajan-aula.webp", "Docentes resuelven una tarea en un aula"),
    fotoDeRuta("/fotos/origen-02-inflexion.webp", "Encuentro de formación docente frente a la pizarra"),
    // Copia de public/quienes-somos/origen-03-pregunta.webp, que sigue usando
    // Novedades: el campo de foto solo acepta /fotos/. Se deduplica cuando
    // Fotos (lane 9) consolide dónde vive cada archivo (DECISIONS de
    // work/paginas-que-hacemos-y-quienes-somos/).
    fotoDeRuta("/fotos/origen-03-pregunta.webp", "Exposición ante la comunidad educativa en un auditorio"),
  ],
};
