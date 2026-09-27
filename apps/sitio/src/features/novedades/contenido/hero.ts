import { z } from "zod";
import { listaFija, textoCorto } from "@/lib/contenido/campos";

// El hero de Novedades: «Siempre hay» y la palabra que gira en el tablero. La
// fecha del tablero no se edita: es la de la novedad más nueva.

/** Cuántas palabras gira el tablero: la escena está armada para esa cantidad. */
const PALABRAS = 5;

export const esquemaHeroDeNovedades = z.object({
  titulo: textoCorto({ maximo: 20, etiqueta: "Título", ayuda: "La primera línea, quieta: la segunda es la palabra que gira." }),
  palabras: listaFija(PALABRAS, textoCorto({ maximo: 16, etiqueta: "Palabra" }), {
    etiqueta: "Palabras del tablero",
    etiquetaDelItem: "Palabra",
    ayuda: `Son ${PALABRAS}, en verde, y giran letra por letra en ese orden; la primera es donde el tablero se queda quieto. Cortas: hoy la más larga tiene 14 letras.`,
  }),
  bajada: textoCorto({ maximo: 100, etiqueta: "Bajada" }),
  etiquetaDeLaFecha: textoCorto({ maximo: 24, etiqueta: "Arriba de la fecha", ayuda: "La fecha es la de la novedad más nueva: se actualiza sola." }),
});

export type HeroDeNovedades = z.infer<typeof esquemaHeroDeNovedades>;

/** El contenido de hoy, tal cual está en el sitio. */
export const heroDeNovedadesInicial: HeroDeNovedades = {
  titulo: "Siempre hay",
  palabras: ["novedades.", "publicaciones.", "encuentros.", "convocatorias.", "prensa."],
  bajada: "Seguí de cerca lo que investigamos, diseñamos y llevamos al aula.",
  etiquetaDeLaFecha: "Última actualización",
};
