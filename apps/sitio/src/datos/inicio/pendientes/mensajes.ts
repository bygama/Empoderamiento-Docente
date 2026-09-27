import { BANDEJAS } from "@/config/mensajes";
import { leerCvNuevos, leerCvQueSeBorran, leerMensajesSinLeer } from "../de-los-mensajes";
import type { Pendientes } from "./pendiente";

// En el orden del SPEC padre §5.2: a igual urgencia, los CV antes que Contacto.
export const DE_LOS_MENSAJES = {
  "cv-nuevos": { urgencia: "alguien-espera", capacidad: "verCV", que: "los CV", href: BANDEJAS.cv.href, accion: "Ir a CV", leer: leerCvNuevos },
  "mensajes-sin-leer": {
    urgencia: "alguien-espera",
    capacidad: "verContacto",
    que: "los mensajes de contacto",
    href: BANDEJAS.contacto.href,
    accion: "Ir a Contacto",
    leer: leerMensajesSinLeer,
  },
  "cv-que-se-borran": { urgencia: "se-borra-pronto", capacidad: "verCV", que: "los CV", href: BANDEJAS.cv.href, accion: "Ir a CV", leer: leerCvQueSeBorran },
} satisfies Pendientes;
