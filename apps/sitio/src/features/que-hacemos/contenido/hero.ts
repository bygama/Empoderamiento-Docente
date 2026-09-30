import { z } from "zod";
import { grupo, textoCorto } from "@/lib/contenido/campos";

// El hero de Qué hacemos: el titular en dos renglones, la bajada y el texto
// de la cápsula que baja al recorrido. Los chips de abajo son las áreas (su
// nombre corto) y se editan en su sección. El titular era «No formamos. /
// Transformamos.» hasta el 2026-09-01 (Gastón); PENDIENTE validar el exacto
// con ED. La bajada está medida palabra por palabra para el escalón de sus
// dos renglones en la computadora (TitularQH cuenta la historia).

export const esquemaHero = z.object({
  titulo: grupo(
    {
      primeraLinea: textoCorto({ maximo: 20, etiqueta: "Primer renglón" }),
      segundaLinea: textoCorto({ maximo: 20, etiqueta: "Segundo renglón", ayuda: "Va en celeste, con el subrayado verde." }),
    },
    {
      etiqueta: "Título",
      ayuda: "Dos renglones en grande, cada uno en su línea. Están medidos para el celular: más largos, se parten en dos.",
    },
  ),
  bajada: textoCorto({
    maximo: 160,
    etiqueta: "Bajada",
    ayuda: "Dos renglones en la computadora, el segundo más corto. Si hace falta cambiar algo, mejor cambiar palabras por otras que sumarlas.",
  }),
  boton: textoCorto({ maximo: 24, etiqueta: "Botón", ayuda: "La cápsula verde que baja al recorrido. Se anima letra por letra: que sea corto." }),
});

export type HeroDeQueHacemos = z.infer<typeof esquemaHero>;

/** El contenido de hoy, tal cual está en el sitio. */
export const heroInicial: HeroDeQueHacemos = {
  titulo: { primeraLinea: "Generamos y", segundaLinea: "transformamos." },
  bajada: "Generamos escenarios de aprendizaje situados que transforman hoy la relación cotidiana con la matemática escolar.",
  boton: "Entrá al recorrido",
};
