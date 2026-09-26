import { z } from "zod";
import { grupo, textoCorto } from "@/lib/contenido/campos";

// «Biblioteca y Novedades» de Inicio: solo los textos propios de la sección.
// Las filas son entidades con su propio módulo (los materiales destacados de
// la Biblioteca y las novedades más nuevas) y no se editan acá.

const columna = (etiqueta: string, ayuda: string) =>
  grupo({ titulo: textoCorto({ maximo: 20, etiqueta: "Título" }), bajada: textoCorto({ maximo: 60, etiqueta: "Bajada" }) }, { etiqueta, ayuda });

export const esquemaBibliotecaYNovedades = z.object({
  biblioteca: columna("Biblioteca", "Las filas son los cuatro materiales destacados: se eligen en la Biblioteca."),
  novedades: columna("Novedades", "Las filas son las cuatro novedades más nuevas: se cargan en Novedades."),
});

export type BibliotecaYNovedades = z.infer<typeof esquemaBibliotecaYNovedades>;

/** El contenido de hoy, tal cual está en el sitio. */
export const bibliotecaYNovedadesInicial: BibliotecaYNovedades = {
  biblioteca: { titulo: "Biblioteca", bajada: "Materiales y recursos para llevar al aula." },
  novedades: { titulo: "Novedades", bajada: "Lo último de la comunidad y la investigación." },
};
