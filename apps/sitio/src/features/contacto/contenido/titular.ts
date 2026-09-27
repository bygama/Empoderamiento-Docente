import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";

// El titular de Contacto: el único de toda la experiencia. Nace gigante en el
// hero, se arma letra por letra y viaja hasta el selector de temas, donde
// queda como encabezado. Por eso es corto: va en un renglón a 9rem.

export const esquemaTitular = z.object({
  titulo: textoCorto({
    maximo: 12,
    etiqueta: "Título",
    ayuda: "Una o dos palabras muy cortas: se arma letra por letra en un renglón enorme y viaja al selector de temas.",
  }),
});

export type Titular = z.infer<typeof esquemaTitular>;

/** El contenido de hoy, tal cual está en el sitio. */
export const titularInicial: Titular = { titulo: "Hablemos." };
