import { z } from "zod";
import { grupo, listaFija, textoCorto } from "@/lib/contenido/campos";
import { resaltadoExacto, resaltadoValido } from "@/lib/contenido/resaltado";
import { VERBO_POS } from "../components/preguntas-faro";

// La escena del faro de Qué hacemos: la apertura en la noche, el mensaje
// central (la frase del cartel oficial de ED, 2026-09-08), las cuatro frases
// del enfoque y el cierre que baja a las áreas.
//
// Las frases del enfoque dicen por qué esto no es una capacitación
// tradicional. En el sitemap aprobado, lo que sigue al hero es «Nuestro
// enfoque», y esta escena ocupa ese lugar: antes mostraba las cinco preguntas
// del método, que repetían «Cómo trabajamos». Salen de la devolución de Dani
// (junio de 2026) —«no formamos, se trata de una transformación educativa»,
// «partimos de lo que hay para potenciar, no desde lo que falta», «no
// proponemos enlatados», «información confiable, con estudio detrás»—, dichas
// llano (Facundo, 2026-09-10). La primera es la tesis y la que ya dice el
// Inicio. VALIDAR con ED, igual que el titular del cierre.

const frase = textoCorto({ maximo: 90, etiqueta: "Frase" }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1));

export const esquemaFaro = z.object({
  apertura: textoCorto({ maximo: 120, etiqueta: "Apertura", ayuda: "La primera frase de la escena, sola en la noche. Se ve en la computadora." }),
  mensaje: textoCorto({
    maximo: 110,
    etiqueta: "Mensaje",
    ayuda: "La frase del cartel de ED, el momento más grande de la escena y lo único que se ve en el celular. Lo que va entre **dobles asteriscos** va en celeste, con el subrayado verde: una sola parte.",
  }).refine((texto) => resaltadoValido(texto, { exactamente: 1 }), resaltadoExacto(1)),
  frases: listaFija(VERBO_POS.length, frase, {
    etiqueta: "Frases del enfoque",
    etiquetaDelItem: "Frase",
    ayuda: `Son ${VERBO_POS.length}, una por momento: cada una tiene su lugar en el cielo y su haz de luz. La primera es la tesis y va más grande. Cada una lleva una palabra clave entre **dobles asteriscos**, que la luz pinta de celeste. Se ven en la computadora.`,
  }),
  cierre: grupo(
    {
      titulo: textoCorto({ maximo: 60, etiqueta: "Título", ayuda: "Dos renglones parejos." }),
      boton: textoCorto({ maximo: 30, etiqueta: "Botón", ayuda: "Baja a las áreas." }),
    },
    { etiqueta: "Cierre de la escena" },
  ),
});

export type FaroDeQueHacemos = z.infer<typeof esquemaFaro>;

/** El contenido de hoy, tal cual está en el sitio. */
export const faroInicial: FaroDeQueHacemos = {
  apertura: "Cada contexto educativo presenta actores, objetivos, tensiones y posibilidades diferentes.",
  mensaje: "Consultora especializada en la transformación del **aprendizaje matemático**.",
  frases: [
    "No capacitamos docentes: **transformamos** la relación con las matemáticas.",
    "Partimos de **lo que hay**, no de lo que falta.",
    "Cada propuesta se diseña para su **contexto**.",
    "Todo lo que hacemos tiene **investigación** detrás.",
  ],
  cierre: { titulo: "La transformación queda encendida en cada equipo.", boton: "Ver las siete áreas" },
};
