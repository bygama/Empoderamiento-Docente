// Las migraciones van por la conexión directa (Neon da DATABASE_URL_UNPOOLED):
// el pooler corta transacciones largas. Payload marca PAYLOAD_MIGRATING=true
// mientras migra; el resto del tiempo se usa la conexión con pool.
export function urlDeLaBase(): string {
  const directa = process.env.DATABASE_URL_UNPOOLED;
  if (process.env.PAYLOAD_MIGRATING === "true" && directa) return directa;
  return process.env.DATABASE_URL ?? "";
}
