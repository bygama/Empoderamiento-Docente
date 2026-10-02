import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";

// El cierre de Novedades: la invitación a seguir las redes. El botón lleva a
// la primera red cargada en Ajustes › Datos del sitio (Instagram, si está) y,
// mientras no haya ninguna, a Contacto; los destinos quedan en código. Era
// «Hablemos» hacia Contacto: a Daniela le sonaba raro en una sección que
// invita a seguir las redes (2026-09-30).

export const esquemaCierreDeNovedades = z.object({
  titulo: textoCorto({ maximo: 40, etiqueta: "Título" }),
  conRedes: textoCorto({ maximo: 160, etiqueta: "Texto, con redes", ayuda: "El que se ve cuando hay al menos una red cargada en los datos del sitio." }),
  sinRedes: textoCorto({ maximo: 160, etiqueta: "Texto, sin redes", ayuda: "El que se ve mientras no hay ninguna red cargada." }),
  boton: textoCorto({ maximo: 24, etiqueta: "Botón (naranja)", ayuda: "Lleva a la primera red cargada en Datos del sitio (Instagram, si está); sin redes, a Contacto." }),
});

export type CierreDeNovedades = z.infer<typeof esquemaCierreDeNovedades>;

/** El contenido de hoy, tal cual está en el sitio. */
export const cierreDeNovedadesInicial: CierreDeNovedades = {
  titulo: "Enterate de todo.",
  conRedes: "Seguinos en redes para conocer cada novedad apenas sale.",
  sinRedes: "Escribinos y te contamos lo que estamos haciendo.",
  boton: "Seguinos en Instagram",
};
