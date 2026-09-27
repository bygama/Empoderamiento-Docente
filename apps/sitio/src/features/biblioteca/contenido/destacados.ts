import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";
import { resaltadoExacto, resaltadoValido } from "@/lib/contenido/resaltado";

// «Material destacado» de Biblioteca: la presentación de los cuatro
// destacados. Los destacados son materiales (su rótulo, su frase y su
// detalle viven con ellos, lane 8 del mapa del admin): de la sección, acá
// solo sus textos propios (SPEC §3).

export const esquemaDestacados = z.object({
  antetitulo: textoCorto({ maximo: 25, etiqueta: "Antetítulo" }),
  titulo: textoCorto({
    maximo: 60,
    etiqueta: "Título",
    ayuda: "La parte entre **dobles asteriscos** va en verde; el resto, en azul.",
  }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1)),
  presentacion: textoCorto({
    maximo: 180,
    etiqueta: "Presentación",
    ayuda: "Al lado de las cuatro portadas. Los materiales destacados se eligen en la Biblioteca.",
  }),
});

export type Destacados = z.infer<typeof esquemaDestacados>;

/** El contenido de hoy, tal cual está en el sitio. */
export const destacadosInicial: Destacados = {
  antetitulo: "Material destacado",
  titulo: "**Cuatro materiales** para entrar a la biblioteca",
  presentacion:
    "Una selección corta del equipo: la investigación que da origen a ED y tres materiales listos para el aula. Si llegás por primera vez, empezá por acá.",
};
