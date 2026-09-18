import { PrismaNeon } from "@prisma/adapter-neon";

/**
 * De dónde sale la conexión a Postgres, y con qué adaptador.
 *
 * Este paquete **no importa el cliente generado de Prisma** a propósito: ese
 * cliente se genera del esquema de la app, y conocerlo sería saber del dominio
 * (AGENTS.md §3, la primera frontera). Acá vive la parte que no cambia entre
 * proyectos; la app construye su `PrismaClient` y le pasa este adaptador.
 */

/**
 * Neon da dos URLs y no son intercambiables: el pooler corta las transacciones
 * largas, que es justo lo que hace una migración. `directa` pide la de
 * `DATABASE_URL_UNPOOLED`, con `DATABASE_URL` como red de contención.
 */
export function urlDeLaBase({ directa = false } = {}): string {
  const conPool = process.env.DATABASE_URL;
  const sinPool = process.env.DATABASE_URL_UNPOOLED;
  const elegida = directa ? (sinPool ?? conPool) : conPool;
  if (!elegida) {
    throw new Error(
      "Falta DATABASE_URL. Copiá apps/sitio/.env.example a .env.local y completala " +
        "(README, sección «Admin»). Sin base, el admin no arranca; el sitio sí.",
    );
  }
  return elegida;
}

/** El adaptador que el `PrismaClient` de la app recibe por constructor. */
export function adaptadorNeon(opciones?: { directa?: boolean }): PrismaNeon {
  return new PrismaNeon({ connectionString: urlDeLaBase(opciones) });
}
