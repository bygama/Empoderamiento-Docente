// Las migraciones van por la conexión directa (Neon da DATABASE_URL_UNPOOLED):
// el pooler corta transacciones largas. Payload marca PAYLOAD_MIGRATING=true
// mientras migra; el resto del tiempo se usa la conexión con pool.
//
// Sin ninguna de las dos no se corta nada: el sitio tiene que poder correr y
// compilar sin el panel. Se avisa por consola y el panel va a fallar recién
// al conectarse (en Vercel el chequeo de entorno.ts corta antes).
export function urlDeLaBase(): string {
  const directa = process.env.DATABASE_URL_UNPOOLED;
  if (process.env.PAYLOAD_MIGRATING === "true" && directa) return directa;
  const conPool = process.env.DATABASE_URL;
  if (!conPool) {
    console.warn(
      "[panel] Falta DATABASE_URL: el sitio anda, pero el panel no va a poder conectarse. " +
        "Copiá .env.example a .env.local (README, sección «Panel de administración»).",
    );
    return "";
  }
  return conPool;
}
