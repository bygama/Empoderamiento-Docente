import { base } from "./cliente";

/**
 * Dónde cuentan su tope los formularios públicos: la tabla `limites_por_ip`,
 * una fila por formulario e IP (la clave es un HMAC, `lib/formularios/limite.ts`).
 * En la base y no en memoria porque el sitio corre en varias instancias.
 */

/**
 * Suma un envío a la ventana de esa clave y devuelve cuántos lleva, este
 * incluido. Si la ventana venció, empieza otra con este.
 *
 * **Atómico, a propósito:** un solo `INSERT … ON CONFLICT DO UPDATE …
 * RETURNING`. Con leer y escribir sueltos, dos envíos a la vez leerían el
 * mismo número y el tope se pasaría de a uno por cada par.
 */
export async function sumarEnvio(clave: string, ventanaMs: number, ahora: Date = new Date()): Promise<number> {
  const vencida = new Date(ahora.getTime() - ventanaMs);
  const [fila] = await base.$queryRaw<Array<{ envios: number }>>`
    INSERT INTO limites_por_ip (clave, envios, desde) VALUES (${clave}, 1, ${ahora})
    ON CONFLICT (clave) DO UPDATE SET
      envios = CASE WHEN limites_por_ip.desde <= ${vencida} THEN 1 ELSE limites_por_ip.envios + 1 END,
      desde = CASE WHEN limites_por_ip.desde <= ${vencida} THEN ${ahora} ELSE limites_por_ip.desde END
    RETURNING envios`;
  return fila.envios;
}

/** Borra las ventanas que empezaron antes de `antesDe`; devuelve cuántas. */
export async function podarLimites(antesDe: Date): Promise<number> {
  const { count } = await base.limitePorIp.deleteMany({ where: { desde: { lt: antesDe } } });
  return count;
}
