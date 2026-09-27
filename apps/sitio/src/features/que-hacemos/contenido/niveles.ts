import { z } from "zod";
import { grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { resaltadoExacto, resaltadoValido } from "@/lib/contenido/resaltado";
import { POS } from "../components/niveles-escala/niveles-escena";

// «Niveles en los que intervenimos» de Qué hacemos: las ondas expansivas. Los
// cuatro niveles de impacto del modelo conceptual más la red regional, de lo
// micro a lo macro: es el guion de la escena. Armados desde el brief y el
// modelo conceptual: PENDIENTES de validación fina con el cliente. La
// cantidad sale de la escena, que planta cada tarjeta en su lugar
// (niveles-escena.ts).

export const esquemaNiveles = z.object({
  titulo: textoCorto({
    maximo: 45,
    etiqueta: "Título",
    ayuda: "El nombre de la sección, arriba a la izquierda. Lo que va entre **dobles asteriscos** va en verde.",
  }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1)),
  frase: grupo(
    {
      primeraLinea: textoCorto({ maximo: 20, etiqueta: "Primer renglón" }),
      segundaLinea: textoCorto({ maximo: 30, etiqueta: "Segundo renglón", ayuda: "Va en verde, siempre en su propio renglón." }),
    },
    { etiqueta: "Frase grande", ayuda: "La frase en grande de la apertura, en dos renglones." },
  ),
  bajada: textoCorto({
    maximo: 120,
    etiqueta: "Bajada",
    ayuda: "Lo que va entre **dobles asteriscos** va en negrita: la idea que ordena los niveles.",
  }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1)),
  niveles: listaFija(
    POS.length,
    grupo({
      nombre: textoCorto({ maximo: 24, etiqueta: "Nombre" }),
      texto: textoCorto({ maximo: 70, etiqueta: "Texto", ayuda: "Una frase, con punto final." }),
    }),
    {
      etiqueta: "Niveles",
      etiquetaDelItem: "Nivel",
      ayuda: `Son ${POS.length}, de lo micro a lo macro: cada tarjeta tiene su lugar en la escena.`,
    },
  ),
});

export type NivelesDeQueHacemos = z.infer<typeof esquemaNiveles>;
export type NivelDeQueHacemos = NivelesDeQueHacemos["niveles"][number];

/** El contenido de hoy, tal cual está en el sitio. */
export const nivelesInicial: NivelesDeQueHacemos = {
  titulo: "Niveles en los que **intervenimos**",
  // «sistema educativo» siempre en el segundo renglón (Gastón, 2026-09-10).
  frase: { primeraLinea: "Del aula al", segundaLinea: "sistema educativo." },
  bajada: "**De lo micro a lo macro:** cinco niveles donde la transformación se sostiene.",
  niveles: [
    { nombre: "Docentes", texto: "Confianza y decisiones didácticas fundamentadas." },
    { nombre: "Estudiantes", texto: "Pensamiento matemático y uso funcional del saber." },
    { nombre: "Escuelas", texto: "Prácticas innovadoras y cultura de mejora continua." },
    { nombre: "Sistemas educativos", texto: "Políticas y decisiones basadas en evidencia." },
    { nombre: "Redes en cinco países", texto: "Comunidades e instituciones de América Latina." },
  ],
};
