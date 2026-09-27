import { paginasSinPublicar } from "../de-las-paginas";
import type { Pendientes } from "./pendiente";

export const DE_LAS_PAGINAS = {
  "paginas-sin-publicar": {
    urgencia: "sin-publicar",
    capacidad: "editarContenido",
    que: "las páginas",
    href: "/admin/contenido/paginas",
    accion: "Ir a Páginas",
    leer: paginasSinPublicar,
  },
} satisfies Pendientes;
