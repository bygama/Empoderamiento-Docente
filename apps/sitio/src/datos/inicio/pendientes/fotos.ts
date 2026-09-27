import { fotosSinAlt } from "../de-las-fotos";
import type { Pendientes } from "./pendiente";

export const DE_LAS_FOTOS = {
  "fotos-sin-alt": { urgencia: "a-corregir", capacidad: "editarContenido", que: "las fotos", href: "/admin/contenido/fotos?filtro=sin-alt", accion: "Ir a Fotos", leer: fotosSinAlt },
} satisfies Pendientes;
