import { z } from "zod";
import { grupo, textoCorto } from "@/lib/contenido/campos";

// «Lo último» de Novedades: el título del listado y lo que dice un filtro sin
// novedades. Las tarjetas son las novedades publicadas.

export const esquemaUltimasDeNovedades = z.object({
  titulo: textoCorto({ maximo: 40, etiqueta: "Título" }),
  vacio: grupo(
    {
      titulo: textoCorto({ maximo: 60, etiqueta: "Título" }),
      texto: textoCorto({ maximo: 80, etiqueta: "Texto" }),
      boton: textoCorto({ maximo: 20, etiqueta: "Botón", ayuda: "Vuelve a mostrar todas." }),
    },
    { etiqueta: "Una categoría sin novedades", ayuda: "Lo que se ve al filtrar por una categoría que todavía no tiene ninguna." },
  ),
});

export type UltimasDeNovedades = z.infer<typeof esquemaUltimasDeNovedades>;

/** El contenido de hoy, tal cual está en el sitio. */
export const ultimasDeNovedadesInicial: UltimasDeNovedades = {
  titulo: "Lo que viene pasando.",
  vacio: {
    titulo: "Todavía no hay novedades en esta categoría.",
    texto: "Pronto vamos a compartir nuevas acá.",
    boton: "Ver todas",
  },
};
