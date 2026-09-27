import { z } from "zod";
import { grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { unaResaltada } from "./comunes";

// El hero de Investigación: el titular que el faro enciende, sus dos caminos
// y los cuatro pasos de la historia de la hoja 01. Cada paso es una figura de
// la constelación (constelacion.ts: pregunta, lupa, red, espiral), así que
// son cuatro y en ese orden; la geometría no se edita. Los botones cortan a
// su sección de la página: el destino queda en código (SPEC §4).

const paso = grupo({
  verbo: textoCorto({ maximo: 18, etiqueta: "Verbo", ayuda: "Una o dos palabras: se releva empujando al anterior, en un renglón." }),
  frase: textoCorto({ maximo: 110, etiqueta: "Frase", ayuda: "Se pinta palabra por palabra con el scroll." }),
});

export const esquemaHeroInvestigacion = z.object({
  titulo: unaResaltada({
    maximo: 70,
    etiqueta: "Título",
    ayuda: "La parte entre **dobles asteriscos** lleva el marcador verde.",
  }),
  botonPrincipal: textoCorto({ maximo: 30, etiqueta: "Botón principal", ayuda: "Lleva a Líneas de investigación." }),
  botonSecundario: textoCorto({ maximo: 30, etiqueta: "Botón secundario", ayuda: "Lleva a los casos." }),
  pasos: listaFija(4, paso, {
    etiqueta: "La historia",
    etiquetaDelItem: "Paso",
    ayuda: "Son 4, uno por figura de la constelación: pregunta, lupa, red y espiral, en ese orden.",
  }),
});

export type HeroInvestigacion = z.infer<typeof esquemaHeroInvestigacion>;

/** El contenido de hoy, tal cual está en el sitio. */
export const heroInvestigacionInicial: HeroInvestigacion = {
  titulo: "**Investigamos** para transformar la matemática escolar.",
  botonPrincipal: "Conocé qué investigamos",
  // El secundario va a los casos, lo que más se vuelve a buscar (decisión de
  // ED, 2026-09-08; antes salía a la Biblioteca).
  botonSecundario: "Ver los casos",
  // Copy destilado de la bajada del doc maestro (arquitectura-investigacion.md
  // §3) y la idea central de §4; aprobado por el cliente el 31-08-2026.
  pasos: [
    { verbo: "Preguntar", frase: "Todo empieza con un problema real del aula, convertido en pregunta." },
    { verbo: "Mirar de cerca", frase: "Lo estudiamos con rigor: qué ocurre, por qué ocurre y qué significa." },
    { verbo: "Relacionar", frase: "No investigamos desde afuera: construimos con quienes habitan los contextos educativos." },
    { verbo: "Transformar", frase: "El conocimiento vuelve al aula, la transforma… y abre la próxima pregunta." },
  ],
};
