import { z } from "zod";
import { grupo, textoCorto } from "@/lib/contenido/campos";

// El hero de Biblioteca: el titular en dos líneas enmascaradas, la segunda en
// verde, y la bajada. El buscador y el riel de categorías no son copy: el
// placeholder dice qué campos busca y las categorías son los tipos de los
// materiales (SPEC §4).

export const esquemaHeroBiblioteca = z.object({
  titulo: grupo(
    {
      primeraLinea: textoCorto({ maximo: 16, etiqueta: "Primera línea" }),
      segundaLinea: textoCorto({ maximo: 16, etiqueta: "Segunda línea", ayuda: "Va en verde." }),
    },
    { etiqueta: "Título", ayuda: "Dos líneas cortas, de letra muy grande: cada una sube desde su máscara." },
  ),
  bajada: textoCorto({ maximo: 110, etiqueta: "Bajada" }),
});

export type HeroBiblioteca = z.infer<typeof esquemaHeroBiblioteca>;

/** El contenido de hoy, tal cual está en el sitio. */
export const heroBibliotecaInicial: HeroBiblioteca = {
  titulo: { primeraLinea: "Publicaciones", segundaLinea: "y recursos" },
  bajada: "Materiales de investigación y recursos pedagógicos, abiertos y listos para llevar al aula.",
};
