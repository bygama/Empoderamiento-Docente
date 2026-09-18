import { config as cargarEntorno } from "dotenv";
import { defineConfig } from "prisma/config";

// El CLI de Prisma corre fuera de Next, así que nadie le cargó el `.env.local`:
// hay que hacerlo acá o la URL sale vacía y el error no dice por qué. El orden
// importa: `.env.local` pisa a `.env`, igual que en Next.
cargarEntorno({ path: [".env.local", ".env"], quiet: true });

/**
 * Esta URL la usa **solo el CLI**: migraciones, `db execute`, Studio. Las
 * consultas en runtime NO pasan por acá — van por el driver adapter que arma
 * `@ed/db` con `DATABASE_URL`.
 *
 * Por eso acá se pide la conexión **directa** primero: el pooler de Neon corta
 * las transacciones largas, que es exactamente lo que hace una migración.
 * `DATABASE_URL` queda de red de contención para local, donde las dos son la
 * misma. En Prisma 7 ya no hay `directUrl` en el esquema ni en la config: la
 * separación se hace acá, eligiendo cuál se le pasa al CLI.
 */
const urlParaMigrar = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  // Carpeta, no archivo: el esquema está partido por tema y Prisma los junta.
  schema: "prisma/schema",
  migrations: { path: "prisma/migrations" },
  datasource: { url: urlParaMigrar },
});
