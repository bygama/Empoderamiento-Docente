// La guarda del CLI de Prisma. Delega todo, menos `db push` y `db pull`.
//
//   node scripts/guarda-prisma.mjs <lo que sea que le pasarías a prisma>
//
// `db push` aplica el esquema contra la base SIN generar el archivo de
// migración. La migración que nunca existió no se commitea, el entorno
// siguiente se queda sin esas tablas, y el síntoma aparece en producción.
//
// `db pull` va al revés: lee la base, sobrescribe el esquema —que acá es la
// fuente de verdad— y borra los comentarios `//` en el camino.
//
// **Se invoca a Prisma SIN shell, y eso es lo que hace que la guarda sirva.**
// Tres versiones se colaron mientras usaba `shell: true`, todas por la misma
// razón: `cmd.exe` recibía la línea armada y la volvía a partir DESPUÉS del
// chequeo. Pasaban `"db push"` como un argumento, `db pu^sh` (el `^` se lo come
// el shell) y `db %VAR%` con la variable en el entorno. Peor: un `&` adentro de
// cualquier argumento ejecutaba un comando arbitrario — inyección a través del
// wrapper, sin relación con `db push`. Sin shell, Node pasa el arreglo al
// proceso hijo tal cual y la guarda ve lo mismo que Prisma.

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

/** ¿Los argumentos piden `db <cual>`? Se compara sin distinguir mayúsculas. */
function pideDb(args, cual) {
  const tokens = args.map((a) => a.toLowerCase());
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
      "POR QUÉ: escribe el esquema en la base sin dejar un archivo de migración.",
      "  El próximo entorno corre `migrate deploy` sin ella y el síntoma aparece",
      "  en producción como «la tabla no existe».",
      "",
      "FIX: `pnpm migrate` genera la migración y la aplica. Se commitea junto",
      "  con el cambio de esquema.",
    ],
  },
  {
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
