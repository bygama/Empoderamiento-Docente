import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Si lo que llegó es el secreto esperado, comparado en **tiempo constante**:
 * con `!==`, la comparación corta en el primer carácter distinto y cuánto
 * tarda dice cuánto se acertó. `timingSafeEqual` pide dos buffers del mismo
 * largo, así que se comparan los SHA-256 de los dos, que siempre miden 32
 * bytes: tampoco se filtra el largo. Sin secreto esperado, nada pasa.
 */
export function esElSecreto(recibido: string | null, esperado: string | null | undefined): boolean {
  if (!esperado) return false;
  const resumen = (valor: string) => createHash("sha256").update(valor).digest();
  return timingSafeEqual(resumen(recibido ?? ""), resumen(esperado));
}
