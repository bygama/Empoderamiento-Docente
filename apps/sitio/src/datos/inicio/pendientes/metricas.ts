import { hayVariablesDeBusquedas } from "@/lib/busquedas/entorno";
import type { Pendientes } from "./pendiente";

export const DE_LAS_METRICAS = {
  "conectar-search-console": {
    urgencia: "sin-conectar",
    capacidad: "configurarConexiones",
    que: "Search Console",
    href: "/admin/metricas/busquedas",
    accion: "Ver los pasos",
    // «Conectado» es lo mismo que dice Búsquedas: las tres variables.
    leer: async () =>
      hayVariablesDeBusquedas() ? null : { titulo: "Conectá Search Console", detalle: "Para ver qué busca la gente en Google." },
  },
} satisfies Pendientes;
