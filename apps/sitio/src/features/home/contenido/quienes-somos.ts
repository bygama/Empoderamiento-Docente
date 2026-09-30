import { z } from "zod";
import { foto, textoCorto } from "@/lib/contenido/campos";
import { fotoDeRuta } from "@/lib/contenido/fotos";
import { cuerpoConResaltado, enlace } from "./comunes";

// «¿Quiénes somos?» de Inicio: el panel que borra el barrido verde. El cuerpo
// es copy oficial del cliente, condensado a la mitad [[ed-copy-oficial]]: se
// edita, pero no se parafrasea sin chequear con ED.

export const esquemaQuienesSomos = z.object({
  titulo: textoCorto({ maximo: 30, etiqueta: "Título" }),
  cuerpo: cuerpoConResaltado(),
  enlace: enlace({ maximo: 30, ayuda: "La única salida del bloque, hacia la página que lo amplía." }),
  foto: foto({ etiqueta: "Foto" }),
});

export type QuienesSomos = z.infer<typeof esquemaQuienesSomos>;

/** El contenido de hoy, tal cual está en el sitio. */
export const quienesSomosInicial: QuienesSomos = {
  titulo: "¿Quiénes somos?",
  cuerpo: [
    "Somos una manera distinta de comprender **las matemáticas, la educación y el desarrollo profesional docente.** Una convicción hecha acción.",
    "Partimos de lo construido para seguir construyendo, junto a las comunidades educativas. Empoderamiento Docente **instituye lo instituido:** parte de los saberes existentes y los resignifica, desde la experiencia compartida, **en nuevos modos de comprender, favorecer aprendizajes y construir conocimiento.**",
  ].join("\n\n"),
  // Una sola salida por bloque, hacia la página que lo amplía (Gastón, 2026-09-11).
  enlace: { texto: "Conocé al equipo", ruta: "/quienes-somos" },
  foto: fotoDeRuta(
    "/fotos/formadora-recorre-aula.webp",
    "Una formadora recorre el aula y acompaña a docentes que resuelven una actividad",
  ),
};
