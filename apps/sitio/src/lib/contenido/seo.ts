import type { Metadata } from "next";
import { z } from "zod";
import { LARGO_DE_BUSCADOR } from "./buscador";
import { foto, textoCorto } from "./campos";

// El SEO de una página (SPEC §6 de `work/paginas-inicio/`): una parte más de su
// documento, bajo la clave reservada `seo`, así tiene borrador, versiones y «qué
// cambió» sin código aparte. Un solo esquema para todas las páginas. Sin
// dominio de ED: lo común de Open Graph lo trae quien arma la metadata.

// La clave y los largos viven en buscador.ts, sin Zod: los lee también el navegador.
export { CLAVE_SEO, LARGO_DE_BUSCADOR } from "./buscador";

export const esquemaSeo = z.object({
  titulo: textoCorto({
    maximo: 100,
    etiqueta: "Título",
    ayuda: "El de la pestaña del navegador y el de Google, entero: con el nombre del sitio si lo lleva.",
    recomendado: { largo: LARGO_DE_BUSCADOR.titulo, aviso: "Google muestra unos 60 caracteres: lo que sigue se corta." },
  }),
  descripcion: textoCorto({
    maximo: 300,
    etiqueta: "Descripción",
    ayuda: "La que aparece debajo del título en Google y al compartir el link.",
    recomendado: { largo: LARGO_DE_BUSCADOR.descripcion, aviso: "Google muestra unos 160 caracteres: lo que sigue se corta." },
  }),
  // La clave da la etiqueta del opcional: «Lleva imagen para redes».
  imagenParaRedes: foto({
    etiqueta: "Imagen para redes",
    ayuda: "La que aparece al compartir el link. Las redes la recortan a 1200 × 630 desde el centro.",
  }).nullable(),
});

export type Seo = z.infer<typeof esquemaSeo>;

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/**
 * La metadata de Next de una página a partir de su SEO. El título va como
 * `absolute`: es el de la pestaña entero, sin el template del layout. Un
 * `openGraph` de página reemplaza el del layout entero, por eso recibe lo
 * común (tipo, idioma, nombre del sitio). Sin imagen propia no manda
 * `images`: queda la del sitio (`opengraph-image`).
 */
export function metadataDeSeo(seo: Seo, comun: OpenGraph): Metadata {
  const imagen = seo.imagenParaRedes;
  return {
    title: { absolute: seo.titulo },
    description: seo.descripcion,
    openGraph: {
      ...comun,
      title: seo.titulo,
      description: seo.descripcion,
      ...(imagen ? { images: [{ url: imagen.src, alt: imagen.alt }] } : {}),
    },
  };
}
