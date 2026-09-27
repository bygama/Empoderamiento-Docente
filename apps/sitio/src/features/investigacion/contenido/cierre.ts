import { z } from "zod";
import { grupo, textoCorto } from "@/lib/contenido/campos";

// El cierre de Investigación: dos invitaciones que el haz del faro lee de
// costado, primero la Biblioteca y después Conversemos. Los destinos de los
// botones quedan en código (SPEC §4): la Biblioteca, y Contacto con el tema
// Investigación ya elegido.

export const esquemaCierreDeInvestigacion = z.object({
  biblioteca: grupo(
    {
      titulo: textoCorto({ maximo: 50, etiqueta: "Título" }),
      boton: textoCorto({ maximo: 30, etiqueta: "Botón", ayuda: "Lleva a la Biblioteca." }),
    },
    { etiqueta: "Biblioteca", ayuda: "La primera parada del haz del faro, a la izquierda." },
  ),
  conversemos: grupo(
    {
      antetitulo: textoCorto({ maximo: 35, etiqueta: "Antetítulo" }),
      titulo: textoCorto({ maximo: 55, etiqueta: "Título" }),
      boton: textoCorto({ maximo: 20, etiqueta: "Botón", ayuda: "Lleva a Contacto, con el tema Investigación ya elegido." }),
    },
    { etiqueta: "Conversemos", ayuda: "La última parada del haz, a la derecha." },
  ),
});

export type CierreDeInvestigacion = z.infer<typeof esquemaCierreDeInvestigacion>;

/** El contenido de hoy, tal cual está en el sitio. */
export const cierreDeInvestigacionInicial: CierreDeInvestigacion = {
  biblioteca: { titulo: "La investigación también se comparte.", boton: "Explorá la Biblioteca" },
  conversemos: {
    antetitulo: "Investigar para transformar",
    titulo: "Investigar permite hacer mejores preguntas.",
    boton: "Conversemos",
  },
};
