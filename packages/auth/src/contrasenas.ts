import { hash, parseOptions, verify } from "@node-rs/argon2";
import { verifyPassword as verificarScrypt } from "better-auth/crypto";

/**
 * Cómo se guardan las contraseñas: **Argon2id**, con los parámetros mínimos
 * que recomienda OWASP (19 MiB de memoria, dos pasadas, un hilo). Es lo que
 * frena de verdad a quien se lleve la tabla `account`: cada intento le cuesta
 * memoria, que es lo que una placa de video no tiene de sobra.
 *
 * Antes de esto better-auth hasheaba con scrypt (su default). Esos hashes
 * siguen verificando, y el login los reemplaza por Argon2id la primera vez que
 * la persona entra (`necesitaRehash` + el gancho de `ganchos.ts`): nadie tiene
 * que elegir otra contraseña.
 */

const PARAMETROS = {
  memoryCost: 19_456, // KiB = 19 MiB
  timeCost: 2,
  parallelism: 1,
  // `Algorithm.Argon2id`. El enum de la librería es `const` y con
  // `isolatedModules` no se puede leer, así que va el número; el test
  // comprueba que el hash sale `$argon2id$`.
  algorithm: 2,
} as const;

const PREFIJO_ARGON2ID = "$argon2id$";

/** El formato de scrypt de better-auth: `sal:clave`, las dos en hexadecimal. */
const SCRYPT = /^[0-9a-f]+:[0-9a-f]+$/;

export function hashear(contrasena: string): Promise<string> {
  return hash(contrasena, PARAMETROS);
}

/** Compara contra un hash guardado, sea Argon2id o el scrypt viejo. Un formato desconocido no verifica. */
export async function verificar({ hash: guardado, password }: { hash: string; password: string }): Promise<boolean> {
  if (guardado.startsWith(PREFIJO_ARGON2ID)) return verify(guardado, password);
  if (SCRYPT.test(guardado)) return verificarScrypt({ hash: guardado, password });
  return false;
}

/**
 * ¿Hay que volver a hashear esta contraseña la próxima vez que llegue en
 * claro? Sí si no es Argon2id, y también si lo es con otros parámetros: así,
 * el día que OWASP suba el piso, alcanza con cambiar `PARAMETROS`.
 */
export function necesitaRehash(guardado: string): boolean {
  if (!guardado.startsWith(PREFIJO_ARGON2ID)) return true;
  const actuales = parseOptions(guardado);
  return (
    actuales.memoryCost !== PARAMETROS.memoryCost ||
    actuales.timeCost !== PARAMETROS.timeCost ||
    actuales.parallelism !== PARAMETROS.parallelism
  );
}
