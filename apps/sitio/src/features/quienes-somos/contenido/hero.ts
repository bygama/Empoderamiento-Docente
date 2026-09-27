import { z } from "zod";
import { grupo, textoCorto } from "@/lib/contenido/campos";

// El hero de Quiénes somos: la antítesis en dos renglones gigantes, la bajada
// de identidad y el atajo a la sección del equipo. Copy oficial
// [[ed-copy-oficial]]: no se parafrasea sin chequear con ED.

export const esquemaHero = z.object({
  titulo: grupo(
    {
      primeraLinea: textoCorto({ maximo: 24, etiqueta: "Primer renglón", ayuda: "Se rellena en azul con el scroll." }),
      segundaLinea: textoCorto({ maximo: 24, etiqueta: "Segundo renglón", ayuda: "Se rellena en verde." }),
    },
    { etiqueta: "Título", ayuda: "Dos renglones gigantes, cada uno en su línea: cortos, o se parten." },
  ),
  bajada: textoCorto({ maximo: 160, etiqueta: "Bajada" }),
  boton: textoCorto({
    maximo: 30,
    etiqueta: "Botón",
    ayuda: "Baja a la sección del equipo. Conviene que diga lo mismo que su volanta (Quiénes sostienen ED) y que el menú.",
  }),
});

export type HeroDeQuienesSomos = z.infer<typeof esquemaHero>;

/** El contenido de hoy, tal cual está en el sitio. */
export const heroInicial: HeroDeQuienesSomos = {
  titulo: { primeraLinea: "No capacitamos.", segundaLinea: "Transformamos." },
  bajada: "Somos investigación, diseño y acompañamiento: un proceso colectivo que cambia la relación con el saber matemático escolar.",
  boton: "Quiénes sostienen ED",
};
