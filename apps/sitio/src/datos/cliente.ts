import { PrismaClient } from "@/../prisma/generado/client";
import { adaptadorPostgres } from "@ed/db";

/**
 * El cliente de Prisma de la app. **Esta es la única puerta a la base**
 * (AGENTS.md §3, la segunda frontera): ningún componente importa Prisma, todo
 * pasa por `datos/consultas/` y `datos/acciones/`.
 *
 * Acá se juntan las dos mitades que los paquetes dejan sueltas a propósito:
 * `@ed/db` sabe de Neon pero no del esquema, y el cliente generado sabe del
 * esquema pero no de dónde conectarse.
 */

// En desarrollo, cada recarga en caliente crearía un cliente nuevo y la base
// se quedaría sin conexiones. En producción el módulo se evalúa una vez y esto
// no hace falta.
const global_ = globalThis as unknown as { base?: PrismaClient };

export const base: PrismaClient = global_.base ?? new PrismaClient({ adapter: adaptadorPostgres() });

if (process.env.NODE_ENV !== "production") global_.base = base;
