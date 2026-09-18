// La guarda del CLI de Prisma. Delega todo, menos `db push`.
//
//   node scripts/guarda-prisma.mjs <lo que sea que le pasarías a prisma>
//
// `db push` aplica el esquema contra la base SIN generar el archivo de
// migración. Anda perfecto en la máquina de quien lo corre, y la migración
// que nunca existió no se commitea: el entorno siguiente que despliega con
// `migrate deploy` se queda sin esas tablas, y el síntoma aparece recién en
// producción como «la tabla no existe».
//
// Por eso se bloquea acá y no en una convención: una convención se olvida a
// las tres semanas, y el costo de olvidarla lo paga alguien que no estuvo.
// Los scripts de base del package.json pasan todos por este archivo, así que
// la única forma de saltearlo es invocar el CLI a mano — que queda a la vista
// en el historial del shell, igual que `git push --no-verify` en §5.8.

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argumentos = process.argv.slice(2);

// El CLI y el esquema viven en la app, no en la raíz del workspace: se delega
// parado ahí para que `prisma` resuelva y para que el `--schema` por defecto
// apunte al lugar correcto sin pasárselo.
const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "apps", "sitio");

/**
 * `db push` en cualquiera de sus formas.
 *
 * Filtrar los tokens que empiezan con `-` y mirar los dos primeros NO alcanza:
 * un flag con valor separado deja su valor en la lista, y
 * `--schema ./x db push` corría igual porque el primer «verbo» pasaba a ser
 * `./x`. Lo encontró la review de cierre de esta lane.
 *
 * Acá se busca `db` y `push` como tokens sueltos, en ese orden, en cualquier
 * posición. Bloquea de más en un caso imaginable —un `--file push` junto a un
 * `db execute`— y eso está bien: ante un comando que cambia la base sin dejar
 * migración, el error que conviene es el que frena.
 */
function esDbPush(args) {
  const db = args.indexOf("db");
  const push = args.indexOf("push");
  return db !== -1 && push > db;
}

if (esDbPush(argumentos)) {
  // Qué, por qué y el fix: un error escrito para que quien lo lee sepa
  // exactamente qué hacer después (AGENTS.md, «Error messages carry the fix»).
  console.error(
    [
      "ERROR: `prisma db push` está bloqueado en este repo.",
      "",
      "POR QUÉ: `push` escribe el esquema en la base sin dejar un archivo de",
      "  migración. Esa migración no se commitea, el próximo entorno corre",
      "  `migrate deploy` sin ella, y el síntoma aparece en producción como",
      "  «la tabla no existe».",
      "",
      "FIX: `pnpm --filter sitio migrate:create` genera la migración y la",
      "  aplica. Se commitea junto con el cambio de esquema.",
    ].join("\n"),
  );
  process.exit(1);
}

const prisma = spawnSync("pnpm", ["exec", "prisma", ...argumentos], {
  cwd: APP,
  stdio: "inherit",
  shell: process.platform === "win32",
});

// El exit del CLI se propaga tal cual: si `migrate status` encuentra
// migraciones pendientes sale != 0, y quien llame a esta guarda tiene que
// enterarse igual que si hubiera llamado a Prisma directo.
process.exit(prisma.status ?? 1);
