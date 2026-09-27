import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";

// Las destacadas de Novedades: solo los textos propios de la sección. Las dos
// notas son novedades (la destacada y la que sigue): se eligen en Novedades.

export const esquemaDestacadasDeNovedades = z.object({
  titulo: textoCorto({ maximo: 40, etiqueta: "Título", ayuda: "Chico, arriba de las dos notas: se decodifica letra por letra." }),
  boton: textoCorto({ maximo: 24, etiqueta: "Botón de cada nota", ayuda: "Abre la ficha de la nota o, si no tiene, baja al listado." }),
});

export type DestacadasDeNovedades = z.infer<typeof esquemaDestacadasDeNovedades>;

/** El contenido de hoy, tal cual está en el sitio. */
export const destacadasDeNovedadesInicial: DestacadasDeNovedades = {
  titulo: "Novedades destacadas",
  boton: "Leer la nota",
};
