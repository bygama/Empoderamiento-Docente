import { novedadesEnBorradorViejas } from "../de-las-novedades";
import type { Pendientes } from "./pendiente";

export const DE_LAS_NOVEDADES = {
  "novedades-en-borrador": {
    urgencia: "sin-publicar",
    capacidad: "editarNovedades",
    que: "las novedades",
    href: "/admin/novedades/borradores",
    accion: "Ir a Borradores",
    leer: () => novedadesEnBorradorViejas(),
  },
} satisfies Pendientes;
