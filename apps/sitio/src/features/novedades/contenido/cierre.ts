import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";

// El cierre de Novedades: la invitación a escribir y a seguir las redes. El
// destino del botón (Contacto) queda en código; las redes, en config/site.ts.

export const esquemaCierreDeNovedades = z.object({
  titulo: textoCorto({ maximo: 40, etiqueta: "Título" }),
  conRedes: textoCorto({ maximo: 160, etiqueta: "Texto, con redes", ayuda: "El que se ve cuando hay al menos una red cargada en los datos del sitio." }),
  sinRedes: textoCorto({ maximo: 160, etiqueta: "Texto, sin redes", ayuda: "El que se ve mientras no hay ninguna red cargada." }),
  boton: textoCorto({ maximo: 20, etiqueta: "Botón (naranja)", ayuda: "Lleva a Contacto." }),
});

export type CierreDeNovedades = z.infer<typeof esquemaCierreDeNovedades>;

/** El contenido de hoy, tal cual está en el sitio. */
export const cierreDeNovedadesInicial: CierreDeNovedades = {
  titulo: "Enterate de todo.",
  conRedes: "Seguinos en redes para conocer cada novedad apenas sale.",
  sinRedes: "Escribinos y te contamos lo que estamos haciendo.",
  boton: "Hablemos",
};
