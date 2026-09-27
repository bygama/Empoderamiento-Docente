import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";

// El cierre de Qué hacemos: la invitación a conversar después de la prueba
// (Proyectos). Los destinos de los dos links son estructura: el botón lleva
// a Contacto con el tema «formación» ya elegido, que no es una ruta del menú,
// y el link a Investigación (SPEC §6 de work/paginas-que-hacemos-y-quienes-somos/).

export const esquemaCierre = z.object({
  titulo: textoCorto({ maximo: 60, etiqueta: "Título", ayuda: "Entra renglón por renglón al llegar." }),
  texto: textoCorto({ maximo: 160, etiqueta: "Texto" }),
  boton: textoCorto({ maximo: 30, etiqueta: "Botón (naranja)", ayuda: "Lleva a Contacto, con el tema «formación» ya elegido." }),
  link: textoCorto({ maximo: 40, etiqueta: "Link", ayuda: "Lleva a Investigación." }),
});

export type CierreDeQueHacemos = z.infer<typeof esquemaCierre>;

/** El contenido de hoy, tal cual está en el sitio. */
export const cierreInicial: CierreDeQueHacemos = {
  titulo: "Cada contexto merece su propia solución.",
  texto: "Contanos dónde estás y qué necesitás: pensamos juntas el camino. Nada de lo que hacemos viene enlatado.",
  boton: "Hablemos de tu contexto",
  link: "Conocé la investigación detrás",
};
