import type { Capacidad } from "@ed/auth";

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
  /** Algo se ve mal en el sitio: materiales con el link roto (lane 8) y fotos sin texto alternativo. */
  "a-corregir",
  /** Aliados sin autorizar: su logo no se publica hasta que alguien lo marque. */
  "sin-autorizar",
  /** Un servicio sin conectar: Search Console. */
  "sin-conectar",
] as const;
export type Urgencia = (typeof URGENCIAS)[number];

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

/** Las filas de un módulo, por su clave. */
export type Pendientes = Record<string, Pendiente>;
