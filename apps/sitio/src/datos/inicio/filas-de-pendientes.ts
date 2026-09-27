import { PENDIENTES, URGENCIAS, type ClaveDePendiente, type LoPendiente, type Pendiente } from "./pendientes";
import { enOrden, leerAisladas, visiblesPara } from "./registro";

// Lo que el Inicio hace con el registro de pendientes (`pendientes/`):
// filtrar por rol, leer cada fila aislada y ordenarlas por urgencia.

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
