import { BANDEJAS, type Bandeja } from "@/config/mensajes";
import { armarCorreo, type Contenido } from "./plantilla";

/**
 * El aviso de que llegó algo a una bandeja de Mensajes. **No lleva nada de
 * quien escribió** —ni su nombre, ni su correo, ni lo que mandó—, en ninguna
 * bandeja: el sitio promete borrar esos datos a los 24 meses (a los 12 un
 * CV), y una copia en cada buzón haría falsa la promesa. Por eso tampoco
 * recibe esos datos: solo la bandeja y el link a la ficha (ADR-0012).
 */
export function mensajeNuevo({ bandeja, enlace, nombre }: { bandeja: Bandeja; enlace: string; nombre?: string }): Contenido {
  const cv = bandeja === "cv";
  return armarCorreo({
    asunto: cv ? "Llegó un CV nuevo" : "Llegó un mensaje nuevo a Contacto",
    nombre,
    antes: [
      cv
        ? "Alguien mandó su CV por el formulario del sitio. Para verlo, entrá al admin."
        : "Alguien escribió por el formulario de contacto del sitio. Para leerlo y responderle, entrá al admin.",
    ],
    boton: { texto: cv ? "Ver el CV" : "Ver el mensaje", enlace },
    despues: [`Te llega porque tenés activado el aviso de ${BANDEJAS[bandeja].nombre}. Lo apagás en Mi cuenta, en «Avisos».`],
  });
}
