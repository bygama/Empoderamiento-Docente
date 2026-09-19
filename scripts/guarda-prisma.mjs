// La guarda del CLI de Prisma. Delega todo, menos `db push` y `db pull`.
//
//   node scripts/guarda-prisma.mjs <lo que sea que le pasarías a prisma>
//
// `db push` aplica el esquema sin dejar migración: el entorno siguiente se
// queda sin esas tablas y el síntoma aparece en producción. `db pull` va al
// revés y sobrescribe el esquema desde la base, borrando los comentarios `//`.
//
// **Se invoca SIN shell**: con `shell: true`, `cmd.exe` volvía a partir la línea
// después del chequeo, y un `&` en cualquier argumento ejecutaba un comando
// arbitrario. Sin shell, Node entrega el arreglo al hijo tal cual.
//
// La review de cierre de la fase 1 rompió **cuatro** versiones de este archivo,
// cada una por una puerta distinta. El detalle está en el DECISIONS de la lane
// `cimientos-del-admin` y en el ADR-0008.

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argumentos = process.argv.slice(2);

// El esquema vive en la app: se corre parado ahí para que el `--schema` por
// defecto apunte al lugar correcto sin pasárselo.
const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "apps", "sitio");

/** El entry de JavaScript del CLI, para poder correrlo con node y sin shell. */
function entryDePrisma() {
  const req = createRequire(path.join(APP, "package.json"));
  const manifiesto = req.resolve("prisma/package.json");
  const { bin } = req(manifiesto);
  return path.join(path.dirname(manifiesto), typeof bin === "string" ? bin : bin.prisma);
}

/**
 * ¿Los argumentos podrían llegar a `db <cual>`?
 *
 * **No se parsea, y esa es la decisión.** Prisma tiene flags globales que
 * consumen el token siguiente, así que cualquier chequeo por orden o adyacencia
 * se rompe con un señuelo: `--telemetry-information push db push` pasaba.
 * Se pregunta lo único independiente del orden: si `db` y `push` (o `pull`)
 * están **las dos** presentes. Bloquea de más a propósito.
 */
function pideDb(args, cual) {
  const tokens = args.map((a) => a.toLowerCase());
  return tokens.includes("db") && tokens.includes(cual);
}

// Los errores dicen qué, por qué y el fix: escritos para que quien los lee sepa
// exactamente qué hacer (AGENTS.md, «Error messages carry the fix»).
const BLOQUEADOS = [
  {
    cual: "push",
    motivo: [
      "POR QUÉ: escribe el esquema en la base sin dejar archivo de migración. El",
      "  próximo entorno corre `migrate deploy` sin ella y el síntoma aparece en",
      "  producción como «la tabla no existe».",
      "",
      "FIX: `pnpm migrate` genera la migración y la aplica, y se commitea.",
    ],
  },
  {
    cual: "pull",
    motivo: [
      "POR QUÉ: lee la base y sobrescribe el esquema, que acá es la fuente de",
      "  verdad. Y borra los comentarios `//` en el camino.",
      "",
      "FIX: si la base y el esquema no coinciden, manda el esquema. Corregilo a",
      "  mano y generá la migración con `pnpm migrate`.",
    ],
  },
];

for (const { cual, motivo } of BLOQUEADOS) {
  if (!pideDb(argumentos, cual)) continue;
  console.error([`ERROR: \`prisma db ${cual}\` está bloqueado acá.`, "", ...motivo].join("\n"));
  process.exit(1);
}

// `format` no se bloquea: es útil y, probado contra el esquema de hoy con
// Prisma 7.10, conserva los comentarios. Avisa igual porque REIMPRIME los
// archivos enteros, y en la review de cierre alguien vio que se llevaba
// comentarios sueltos. Mirar el diff cuesta menos que descubrirlo después.
if (argumentos.some((a) => a.toLowerCase() === "format")) {
  console.warn(
    "AVISO: `prisma format` reimprime el esquema entero. Revisá el diff antes\n" +
      "  de commitear: los comentarios que no cuelgan de un modelo son lo\n" +
      "  primero que se pierde si alguna versión cambia de criterio.\n",
  );
}

const prisma = spawnSync(process.execPath, [entryDePrisma(), ...argumentos], {
  cwd: APP,
  stdio: "inherit",
});

// El exit del CLI se propaga tal cual: si `migrate status` encuentra pendientes
// sale != 0, y quien llame acá tiene que enterarse igual.
process.exit(prisma.status ?? 1);
