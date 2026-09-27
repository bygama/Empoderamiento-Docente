import { BANDEJAS, type Bandeja, type EstadoDeMensaje } from "@/config/mensajes";
import { aLos } from "@/config/privacidad";

// Lo que dicen las pantallas de Mensajes, en un lugar: el módulo, y qué decir
// cuando una bandeja no tiene nada en un estado.

export const MENSAJES = { nombre: "Mensajes", para: "Lo que llega por los formularios del sitio." };

/** «el mensaje» o «el CV»: cómo se nombra una cosa de esa bandeja. */
export const COSA: Record<Bandeja, { una: string; varias: string }> = {
  contacto: { una: "el mensaje", varias: "mensajes" },
  cv: { una: "el CV", varias: "CV" },
};

const DE_DONDE: Record<Bandeja, string> = {
  contacto: "el formulario de contacto del sitio",
  cv: "el formulario de CV del sitio",
};

/**
 * Qué decir cuando la bandeja no tiene nada en ese estado. `plazos` son los
 * que rigen hoy en Ajustes › Privacidad: el de la bandeja, en meses, y el del
 * spam, en días.
 */
export function vacioDe(bandeja: Bandeja, estado: EstadoDeMensaje, cvAbierto: boolean, plazos: { guarda: number; spam: number }): { titulo: string; texto: string } {
  const { varias } = COSA[bandeja];
  switch (estado) {
    case "nuevo":
      return {
        titulo: `No hay ${varias} nuevos`,
        texto:
          bandeja === "cv" && !cvAbierto
            ? "El formulario de CV del sitio está apagado hasta que ED confirme qué datos pide. Mientras, los CV llegan por correo."
            : `Los que lleguen por ${DE_DONDE[bandeja]} aparecen acá.`,
      };
    case "en-curso":
      return { titulo: `No hay ${varias} en curso`, texto: "Los que alguien tome con «Lo tomo yo» aparecen acá." };
    case "cerrado":
      return { titulo: `No hay ${varias} cerrados`, texto: `Se borran solos ${aLos(bandeja, plazos.guarda)} de llegar.` };
    case "spam":
      return { titulo: "No hay spam", texto: `Lo que se marque como spam se borra solo ${aLos("spam", plazos.spam)}.` };
  }
}

export function nombreDe(bandeja: Bandeja): string {
  return BANDEJAS[bandeja].nombre;
}
