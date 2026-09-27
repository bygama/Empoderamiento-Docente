import { aliadosSinAutorizar } from "../de-los-aliados";
import type { Pendientes } from "./pendiente";

export const DE_LOS_ALIADOS = {
  "aliados-sin-autorizar": { urgencia: "sin-autorizar", capacidad: "autorizarAliados", que: "los aliados", href: "/admin/contenido/aliados", accion: "Ir a Aliados", leer: aliadosSinAutorizar },
} satisfies Pendientes;
