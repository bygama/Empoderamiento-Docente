import type { Capacidad } from "@ed/auth";
import { base } from "@/datos/cliente";
import { paginasPublicadasDesde } from "./de-las-paginas";
import { enOrden, leerAisladas, visiblesPara } from "./registro";

/**
 * Cuándo fue la última visita de una cuenta: la vez anterior que entró, o sea
 * la «entro» más reciente **anterior al comienzo de esta sesión**. La fila de
 * «entro» se escribe después de crear la sesión, así que la de ahora queda
 * afuera sin márgenes, y la tabla guarda 12 meses. No sale de las sesiones de
 * better-auth: esa fila se borra al salir, al vencer y con «Cerrar las demás».
 */
export async function ultimaVisita(cuentaId: string, comienzoDeEstaSesion: Date): Promise<Date | null> {
  const fila = await base.actividad.findFirst({
    where: { cuentaId, tipo: "entro", en: { lt: comienzoDeEstaSesion } },
    orderBy: { en: "desc" },
    select: { en: true },
  });
  return fila?.en ?? null;
}

/** Lo que el Inicio cuenta que pasó desde tu última visita. Mensajes (lane 7) suma los CV y los mensajes que llegaron. */
export const CLAVES_DE_LO_NUEVO = ["paginas-publicadas"] as const;
export type ClaveDeLoNuevo = (typeof CLAVES_DE_LO_NUEVO)[number];

type DefinicionDeLoNuevo = {
  capacidad: Capacidad;
  /** Qué revisa, para decir «no se pudo revisar las páginas» si la consulta falla. */
  que: string;
  /** Una frase en minúscula, lista para ir después de «Desde tu última visita:», o `null` si no pasó nada. */
  leer: (desde: Date) => Promise<string | null>;
};

const LO_NUEVO: Record<ClaveDeLoNuevo, DefinicionDeLoNuevo> = {
  "paginas-publicadas": { capacidad: "editarContenido", que: "las páginas", leer: paginasPublicadasDesde },
};

/** Lo que pasó desde entonces y ese rol puede ver, una frase por entrada: «se publicó Inicio». */
export async function loNuevoPara(rol: unknown, desde: Date): Promise<string[]> {
  const leidas = await leerAisladas(visiblesPara(enOrden(LO_NUEVO), rol), (e) => e.leer(desde));
  return leidas.flatMap(({ entrada, ...lectura }) => {
    if ("fallo" in lectura) return [`no se pudo revisar ${entrada.que}`];
    return lectura.valor ? [lectura.valor] : [];
  });
}
