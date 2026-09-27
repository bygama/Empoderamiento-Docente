import type { Capacidad } from "@ed/auth";
import { BANDEJAS } from "@/config/mensajes";
import { hayVariablesDeBusquedas } from "@/lib/busquedas/entorno";
import { materialesConLinksRotos } from "./de-la-biblioteca";
import { novedadesEnBorradorViejas } from "./de-las-novedades";
import { paginasSinPublicar } from "./de-las-paginas";
import { leerCvNuevos, leerCvQueSeBorran, leerMensajesSinLeer } from "./de-los-mensajes";

/**
 * Qué tan urgente es una fila, de más a menos: el orden del SPEC padre §5.2,
 * entero desde hoy, como la tabla de `PUEDE`: la política en un solo lugar,
 * así cada módulo ubica su fila sin editarla. A igual urgencia, manda el
 * orden del registro.
 */
export const URGENCIAS = [
  /** Una persona espera respuesta: CV nuevos y mensajes sin leer. */
  "alguien-espera",
  /** Algo se borra solo: CV que se borran en 7 días. */
  "se-borra-pronto",
  /** Trabajo sin terminar: páginas con cambios sin publicar, y novedades en borrador hace más de 7 días. */
  "sin-publicar",
  /** Algo se ve mal en el sitio: materiales con el link roto (lane 8) y fotos sin texto alternativo (lane 9). */
  "a-corregir",
  /** Aliados sin autorizar. Lo trae la lane 9. */
  "sin-autorizar",
  /** Un servicio sin conectar: Search Console. */
  "sin-conectar",
] as const;
export type Urgencia = (typeof URGENCIAS)[number];

/** Las filas que existen. Un módulo que llega suma su clave acá y su entrada en `PENDIENTES`. */
export const CLAVES_DE_PENDIENTES = [
  "cv-nuevos",
  "mensajes-sin-leer",
  "cv-que-se-borran",
  "paginas-sin-publicar",
  "novedades-en-borrador",
  "materiales-con-el-link-roto",
  "conectar-search-console",
] as const;
export type ClaveDePendiente = (typeof CLAVES_DE_PENDIENTES)[number];

/** Lo que dice una fila con algo pendiente: «2 páginas con cambios sin publicar» · «Inicio y Qué hacemos». */
export type LoPendiente = { titulo: string; detalle?: string };

export type Pendiente = {
  urgencia: Urgencia;
  capacidad: Capacidad;
  /** Qué revisa, para decir «No se pudo revisar las páginas» si la consulta falla. */
  que: string;
  /** La pantalla que lo resuelve, y el texto del link que lleva ahí. */
  href: string;
  accion: string;
  /** `null` si no hay nada pendiente: la fila no aparece. */
  leer: () => Promise<LoPendiente | null>;
};

// En el orden del SPEC padre §5.2: a igual urgencia, los CV antes que Contacto.
export const PENDIENTES: Record<ClaveDePendiente, Pendiente> = {
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
  "paginas-sin-publicar": {
    urgencia: "sin-publicar",
    capacidad: "editarContenido",
    que: "las páginas",
    href: "/admin/contenido/paginas",
    accion: "Ir a Páginas",
    leer: paginasSinPublicar,
  },
  "novedades-en-borrador": {
    urgencia: "sin-publicar",
    capacidad: "editarNovedades",
    que: "las novedades",
    href: "/admin/novedades/borradores",
    accion: "Ir a Borradores",
    leer: () => novedadesEnBorradorViejas(),
  },
  "materiales-con-el-link-roto": {
    urgencia: "a-corregir",
    capacidad: "editarBiblioteca",
    que: "los links de la Biblioteca",
    href: "/admin/biblioteca?salud=link-roto",
    accion: "Ver los materiales",
    leer: materialesConLinksRotos,
  },
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
};
