import { after } from "next/server";

/**
 * `after()` de Next: la tarea sigue después de contestar y la función de
 * Vercel no se apaga hasta que termine. Fuera de un request (los scripts de
 * `scripts/`, los tests) `after` tira; la promesa ya está corriendo y termina
 * igual.
 */
export function segundoPlano(tarea: Promise<unknown>): void {
  try {
    after(tarea);
  } catch {
    // Sin request no hay a quién esperar.
  }
}
