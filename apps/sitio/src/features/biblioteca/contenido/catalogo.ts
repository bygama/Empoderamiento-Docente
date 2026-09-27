import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";

// El catálogo de Biblioteca: las filas son los materiales (lane 8 del mapa del
// admin) y lo demás es interfaz —el buscador, los filtros, los contadores y
// «Ver más»—, que nombra controles cuyo comportamiento está en el código
// (SPEC §4). De la sección, acá solo su aviso cuando no hay resultados.

export const esquemaCatalogo = z.object({
  sinResultados: textoCorto({
    maximo: 130,
    etiqueta: "Aviso sin resultados",
    ayuda: "Aparece cuando la búsqueda o los filtros no encuentran ningún material, con el botón «Limpiar filtros».",
  }),
});

export type Catalogo = z.infer<typeof esquemaCatalogo>;

/** El contenido de hoy, tal cual está en el sitio. */
export const catalogoInicial: Catalogo = {
  sinResultados: "No encontramos materiales con esa combinación de filtros. Probá con menos filtros o con otras palabras.",
};
