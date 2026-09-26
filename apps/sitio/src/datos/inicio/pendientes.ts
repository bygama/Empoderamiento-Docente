import type { Capacidad } from "@ed/auth";
import { hayVariablesDeBusquedas } from "@/lib/busquedas/entorno";
import { paginasSinPublicar } from "./de-las-paginas";
import { enOrden, leerAisladas, visiblesPara } from "./registro";

/**
 * Qué tan urgente es una fila, de más a menos: el orden del SPEC padre §5.2,
 * entero desde hoy, como la tabla de `PUEDE`: la política en un solo lugar,
 * así cada módulo ubica su fila sin editarla. A igual urgencia, manda el
 * orden del registro.
 */
export const URGENCIAS = [
  /** Una persona espera respuesta: CV nuevos y mensajes sin leer. Los trae la lane 7, mensajes. */
  "alguien-espera",
  /** Algo se borra solo: CV que se borran en 7 días. Lo trae la lane 7. */
  "se-borra-pronto",
  /** Trabajo sin terminar: páginas con cambios sin publicar, y novedades en borrador hace más de 7 días (lane 6). */
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
export const CLAVES_DE_PENDIENTES = ["paginas-sin-publicar", "conectar-search-console"] as const;
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

export const PENDIENTES: Record<ClaveDePendiente, Pendiente> = {
  "paginas-sin-publicar": {
    urgencia: "sin-publicar",
    capacidad: "editarContenido",
    que: "las páginas",
    href: "/admin/contenido/paginas",
    accion: "Ir a Páginas",
    leer: paginasSinPublicar,
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

export type FilaDePendiente<C extends string = ClaveDePendiente> = LoPendiente & {
  clave: C;
  href: string;
  accion: string;
  /** La consulta tiró: la fila dice que no se pudo revisar, en vez de callarlo y dejar un «Todo al día» falso. */
  fallo: boolean;
};

/**
 * Las filas con algo pendiente de un registro que ese rol puede ver, de la
 * más urgente a la menos. Recibe el registro para poder probar el orden sin
 * base; el Inicio usa `pendientesPara`.
 */
export async function filasDePendientes<C extends string>(registro: Record<C, Pendiente>, rol: unknown): Promise<FilaDePendiente<C>[]> {
  const leidas = await leerAisladas(visiblesPara(enOrden(registro), rol), (p) => p.leer());
  const conOrden = leidas.flatMap(({ entrada: p, ...lectura }) => {
    const comun = { clave: p.clave, href: p.href, accion: p.accion };
    const orden = URGENCIAS.indexOf(p.urgencia);
    if ("fallo" in lectura) return [{ orden, fila: { ...comun, titulo: `No se pudo revisar ${p.que}`, detalle: "Probá recargar la página.", fallo: true } }];
    return lectura.valor ? [{ orden, fila: { ...comun, ...lectura.valor, fallo: false } }] : [];
  });
  // `sort` es estable: a igual urgencia queda el orden del registro.
  return conOrden.sort((a, b) => a.orden - b.orden).map(({ fila }) => fila);
}

/** Las filas con algo pendiente que ese rol puede ver, de la más urgente a la menos. */
export function pendientesPara(rol: unknown): Promise<FilaDePendiente[]> {
  return filasDePendientes(PENDIENTES, rol);
}
