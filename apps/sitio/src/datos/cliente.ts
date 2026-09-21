import { PrismaClient, type Prisma } from "@/../prisma/generado/client";
import { adaptadorPostgres } from "@ed/db";

/**
 * El cliente de Prisma de la app. **Esta es la única puerta a la base**
 * (AGENTS.md §3, la segunda frontera): ningún componente importa Prisma, todo
 * pasa por `datos/consultas/` y `datos/acciones/`.
 *
 * Acá se juntan las dos mitades que los paquetes dejan sueltas a propósito:
 * `@ed/db` sabe de Neon pero no del esquema, y el cliente generado sabe del
 * esquema pero no de dónde conectarse.
 *
 * **La URL de la base se lee en la primera consulta, no al importar.**
 * `next build` importa cada ruta y cada layout para leer su configuración
 * (`maxDuration`, `dynamic`…) aunque no los renderice, y lo hace con el
 * entorno que tenga: con el adaptador armado al cargar el módulo, el build sin
 * `.env.local` moría en `/api/cron/metricas` con «Falta DATABASE_URL». Prisma
 * llama a `adapter.connect()` recién en la primera consulta, así que el
 * adaptador de abajo posterga hasta ahí la lectura de la URL; el error, con el
 * mismo texto, aparece donde de verdad hace falta la base. El sitio compila
 * sin base, como dice el README.
 *
 * No es un Proxy que instancie el cliente en el primer acceso, a propósito:
 * better-auth lee `_runtimeDataModel` del cliente al construirse (para
 * chequear el esquema), y ese acceso tiraría adentro de su arranque asíncrono,
 * como un rechazo sin manejar que mata al build. El cliente real existe desde
 * el import; lo único que espera es la conexión.
 */

const adaptadorPerezoso: Prisma.PrismaClientOptionsWithAdapter["adapter"] = {
  provider: "postgres",
  adapterName: "@prisma/adapter-pg",
  connect: () => adaptadorPostgres().connect(),
};

// En desarrollo, cada recarga en caliente crearía un cliente nuevo y la base
// se quedaría sin conexiones. En producción el módulo se evalúa una vez y esto
// no hace falta.
const global_ = globalThis as unknown as { base?: PrismaClient };

export const base: PrismaClient = global_.base ?? new PrismaClient({ adapter: adaptadorPerezoso });

if (process.env.NODE_ENV !== "production") global_.base = base;
