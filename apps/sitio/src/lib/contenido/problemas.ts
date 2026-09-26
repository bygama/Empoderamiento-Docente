import type { z } from "zod";
import { describir } from "./describir";
import { caminoLegible } from "./descripcion";
import type { SeccionRegistrada } from "./documento";
import { resumenDeErrores, type ErrorDeCampo } from "./errores";

// Lo que no pasa el esquema, dicho para quien edita (SPEC §7.1 de
// `work/paginas-inicio/`): con las etiquetas del formulario y no las claves, y
// con el camino de cada campo para que el editor marque el suyo. Sin ED.

/** Dónde está un problema, en etiquetas: «¿Quiénes somos? › Texto». */
function dondeEsta(parte: SeccionRegistrada, camino: ReadonlyArray<PropertyKey>): string {
  return [parte.nombre, ...caminoLegible(describir(parte.esquema, parte.nombre), camino)].join(" › ");
}

/** El primer problema de una parte, en llano: «¿Quiénes somos? › Texto — Falta cerrar un resaltado…». */
export function primerProblema(parte: SeccionRegistrada, error: z.ZodError): string {
  const [problema] = error.issues;
  return `${dondeEsta(parte, problema?.path ?? [])} — ${problema?.message ?? "hay un dato que no pasa."}`;
}

/**
 * Todos los problemas de una parte que no se pudo guardar: cada uno con el
 * camino del campo en el formulario (`clave.camino`, el mismo `nombre` que
 * arma el editor), uno por campo, y el aviso que los resume.
 */
export function problemasAlGuardar(clave: string, parte: SeccionRegistrada, error: z.ZodError): { detalle: string; errores: ErrorDeCampo[] } {
  const porCamino = new Map<string, ErrorDeCampo>();
  for (const i of error.issues) {
    const camino = [clave, ...i.path.map(String)].join(".");
    if (!porCamino.has(camino)) porCamino.set(camino, { camino, donde: dondeEsta(parte, i.path), mensaje: i.message });
  }
  const errores = [...porCamino.values()];
  return { detalle: resumenDeErrores(errores), errores };
}
