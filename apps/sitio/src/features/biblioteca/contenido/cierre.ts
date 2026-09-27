import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";

// El cierre de Biblioteca: la tarjeta navy con el faro que remata la página.
// Los destinos quedan en código (SPEC §4): el botón lleva a Contacto con el
// tema «Otra consulta» ya elegido y el enlace, a Novedades.

export const esquemaCierreDeBiblioteca = z.object({
  titulo: textoCorto({ maximo: 30, etiqueta: "Título", ayuda: "Muy grande: sube por líneas al entrar." }),
  texto: textoCorto({ maximo: 150, etiqueta: "Texto" }),
  boton: textoCorto({ maximo: 32, etiqueta: "Botón", ayuda: "Lleva a Contacto, con el tema «Otra consulta» ya elegido." }),
  enlace: textoCorto({ maximo: 20, etiqueta: "Enlace", ayuda: "Al lado del botón; lleva a Novedades." }),
});

export type CierreDeBiblioteca = z.infer<typeof esquemaCierreDeBiblioteca>;

/** El contenido de hoy, tal cual está en el sitio. */
export const cierreDeBibliotecaInicial: CierreDeBiblioteca = {
  titulo: "Un faro para cada aula.",
  texto: "Todo lo que investigamos y diseñamos, abierto y listo para usar. La biblioteca sigue creciendo: volvé cuando quieras.",
  boton: "¿Buscás un material puntual?",
  enlace: "Ver novedades",
};
