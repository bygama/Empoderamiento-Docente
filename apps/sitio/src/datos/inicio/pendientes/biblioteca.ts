import { materialesConLinksRotos } from "../de-la-biblioteca";
import type { Pendientes } from "./pendiente";

export const DE_LA_BIBLIOTECA = {
  "materiales-con-el-link-roto": {
    urgencia: "a-corregir",
    capacidad: "editarBiblioteca",
    que: "los links de la Biblioteca",
    href: "/admin/biblioteca?salud=link-roto",
    accion: "Ver los materiales",
    leer: materialesConLinksRotos,
  },
} satisfies Pendientes;
