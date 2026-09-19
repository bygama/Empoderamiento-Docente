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
 * ¿Los argumentos piden `db <cual>`?
 *
 * **La regla de oro: el chequeo tiene que mirar los MISMOS tokens que va a ver
 * Prisma.** Dos versiones se colaron por romper eso, las dos encontradas por la
 * review de cierre. Filtrar lo que empieza con `-` y mirar los dos primeros
 * falla porque un flag con valor separado deja su valor en la lista. Y buscar
 * en el array falla porque en Windows se invoca con `shell: true`: Node pega
 * los argumentos con espacios y `cmd.exe` los vuelve a separar, así que un solo
 * elemento `"db push"` pasaba el chequeo y Prisma lo recibía partido en dos.
 *
 * Por eso se parte todo por espacios primero, que es lo que hace el shell.
 * Bloquea de más en un caso imaginable —un `--file push` junto a un
 * `db execute`— y está bien: ante un comando que toca la base o el esquema, el
 * error que conviene es el que frena.
 */
function pideDb(args, cual) {
  const tokens = args.flatMap((a) => a.split(/\s+/)).filter(Boolean);
  const db = tokens.indexOf("db");
  const sub = tokens.indexOf(cual);
  return db !== -1 && sub > db;
}

// Los errores dicen qué, por qué y el fix: escritos para que quien los lee sepa
// exactamente qué hacer (AGENTS.md, «Error messages carry the fix»).
const BLOQUEADOS = [
  {
    cual: "push",
    motivo: [
      "POR QUÉ: `push` escribe el esquema en la base sin dejar un archivo de",
      "  migración. Esa migración no se commitea, el próximo entorno corre",
      "  `migrate deploy` sin ella, y el síntoma aparece en producción como",
      "  «la tabla no existe».",
      "",
      "FIX: `pnpm migrate` genera la migración y la aplica. Se commitea junto",
      "  con el cambio de esquema.",
    ],
  },
  {
    // Está acá porque pasó: se corrió como prueba de que la guarda no bloqueaba
    // de más, y dejó el esquema sin una sola explicación. Se recuperó de git.
    cual: "pull",
    motivo: [
      "POR QUÉ: lee la base y sobrescribe el esquema, que acá es la fuente de",
      "  verdad. Y borra los comentarios `//` en el camino: conserva los `///`",
      "  de doc, no los que explican por qué.",
      "",
      "FIX: si la base y el esquema no coinciden, manda el esquema. Corregilo a",
      "  mano y generá la migración con `pnpm migrate`.",
    ],
  },
];

for (const { cual, motivo } of BLOQUEADOS) {
  if (!pideDb(argumentos, cual)) continue;
  console.error(
    [`ERROR: \`prisma db ${cual}\` está bloqueado en este repo.`, "", ...motivo].join("\n"),
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
