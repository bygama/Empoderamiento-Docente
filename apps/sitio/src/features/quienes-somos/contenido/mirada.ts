import { z } from "zod";
import { grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { resaltadoExacto, resaltadoValido } from "@/lib/contenido/resaltado";
import { ACENTOS } from "../components/mirada/constelacion-mirada";

// «Nuestra mirada» de Quiénes somos: una misma mirada, tres principios, cada
// uno con una frase que se tacha en vivo, su reformulación y cinco fichas; y
// la síntesis que enlaza con el equipo. El número y el color de cada
// principio son estructura (mirada/constelacion-mirada.ts), igual que la
// geometría de la constelación.

const principio = grupo({
  nombre: textoCorto({ maximo: 32, etiqueta: "Nombre", ayuda: "En el mapa de la computadora, junto a su número." }),
  frase: textoCorto({
    maximo: 60,
    etiqueta: "Frase",
    ayuda: "Sin punto final: lo pone el sitio. Lo que va entre **dobles asteriscos** se tacha en vivo (una parte, o ninguna).",
  })
    .refine((texto) => !texto.endsWith("."), "Sin punto final: lo pone el sitio.")
    .refine(
      (texto) => resaltadoValido(texto, { exactamente: 0 }) || resaltadoValido(texto, { exactamente: 1 }),
      "Como mucho una parte tachada, entre dobles asteriscos: **así**.",
    ),
  afirmacion: textoCorto({
    maximo: 80,
    etiqueta: "Afirmación",
    ayuda: "La reformulación, con punto final. Lo que va entre **dobles asteriscos** se destaca en el color del principio.",
  }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1)),
  fichas: listaFija(5, textoCorto({ maximo: 48, etiqueta: "Ficha" }), {
    etiqueta: "Fichas",
    etiquetaDelItem: "Ficha",
    ayuda: "Cinco, cortas: entran de a una debajo del principio.",
  }),
});

export const esquemaMirada = z.object({
  volanta: textoCorto({ maximo: 30, etiqueta: "Volanta", ayuda: "El nombre de la sección, arriba. Hoy dice lo mismo que el menú." }),
  titulo: textoCorto({ maximo: 60, etiqueta: "Título", ayuda: "Lo que va entre **dobles asteriscos** va en verde." }).refine(
    (texto) => resaltadoValido(texto, { exactamente: 1 }),
    resaltadoExacto(1),
  ),
  principios: listaFija(ACENTOS.length, principio, {
    etiqueta: "Principios",
    etiquetaDelItem: "Principio",
    ayuda: `Son ${ACENTOS.length}: la constelación está armada para esa cantidad, cada uno con su color.`,
  }),
  sintesis: textoCorto({ maximo: 100, etiqueta: "Síntesis", ayuda: "La frase final. Lo que va entre **dobles asteriscos** va en verde." }).refine(
    (texto) => resaltadoValido(texto, { exactamente: 1 }),
    resaltadoExacto(1),
  ),
  puente: textoCorto({ maximo: 110, etiqueta: "Puente", ayuda: "Debajo de la síntesis: enlaza con el equipo." }),
});

export type MiradaDeQuienesSomos = z.infer<typeof esquemaMirada>;
export type PrincipioDeLaMirada = MiradaDeQuienesSomos["principios"][number];

/** El contenido de hoy, tal cual está en el sitio. */
export const miradaInicial: MiradaDeQuienesSomos = {
  volanta: "Nuestra mirada",
  titulo: "Una misma mirada, tres **principios**.",
  principios: [
    {
      nombre: "Pensamiento matemático",
      frase: "La matemática no es solo **resolver cuentas**",
      afirmacion: "Es una manera de **pensar, argumentar y actuar** en el mundo.",
      fichas: ["Construir estrategias", "Argumentar", "Tomar decisiones", "Resolver problemas", "Actuar dentro y fuera del aula"],
    },
    {
      nombre: "Empoderamiento desde el saber",
      frase: "El poder no es **sobre otras personas**",
      afirmacion: "Es poder para **transformar**.",
      fichas: ["Saber", "Reflexión", "Experiencia", "Convicción para transformar", "Mirada no deficitaria"],
    },
    {
      nombre: "Transformación educativa",
      frase: "La educación es un derecho",
      afirmacion: "Transformarla es **ampliar posibilidades**.",
      fichas: ["Perspectiva de género", "Inclusión", "Justicia social", "Construcción colectiva del conocimiento", "Mirada no deficitaria del profesorado"],
    },
  ],
  sintesis: "Pensamiento matemático, saber y transformación forman **una misma mirada**.",
  puente: "Se sostiene en una red de especialistas, trayectorias y experiencias diversas.",
};
