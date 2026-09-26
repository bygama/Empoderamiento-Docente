import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MODULOS } from "./barra-lateral/modulos";

// Cada módulo del admin pasa por su guarda, con la capacidad que le da
// `modulos.ts`: la misma que decide si aparece en la sidebar. Este test es lo
// que hace que un módulo nuevo no pueda olvidarse de ella, como
// `acciones-con-sesion.test.ts` hace con la sesión de cada acción.

const PROTEGIDO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../app/(admin)/admin/(protegido)");

/** Las carpetas de `(protegido)/` que no son un módulo de la sidebar, con su motivo. */
const SIN_GUARDA: Record<string, string> = {};

/** El código sin comentarios: una guarda comentada no es una guarda. */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/** Lo que está mal en el layout de un módulo que pide `capacidad`. */
function problemasDelLayout(fuente: string | null, capacidad: string | undefined): string[] {
  if (fuente === null) return ["no tiene layout.tsx"];
  const llamada = sinComentarios(fuente).match(/<Guarda\s+capacidad="(\w+)"/);
  if (!llamada) return ["su layout no llama a <Guarda capacidad=…>"];
  if (llamada[1] !== capacidad) return [`su layout pide «${llamada[1]}» y modulos.ts dice «${capacidad ?? "ninguna"}»`];
  return [];
}

const carpetas = () =>
  readdirSync(PROTEGIDO, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("[") && !e.name.startsWith("("))
    .map((e) => e.name);

test("el chequeo encuentra un layout sin guarda y uno con otra capacidad", () => {
  assert.deepEqual(problemasDelLayout(null, "usarCuentas"), ["no tiene layout.tsx"]);
  assert.deepEqual(problemasDelLayout(`// <Guarda capacidad="usarCuentas">\nexport default ({ children }) => children;`, "usarCuentas"), [
    "su layout no llama a <Guarda capacidad=…>",
  ]);
  assert.deepEqual(problemasDelLayout(`<Guarda capacidad="verMetricas">{children}</Guarda>`, "usarCuentas"), [
    "su layout pide «verMetricas» y modulos.ts dice «usarCuentas»",
  ]);
});

test("cada módulo con carpeta propia pasa por su guarda, con la capacidad de modulos.ts", () => {
  const encontradas = carpetas();
  assert.ok(encontradas.length > 0, "no encontró ninguna carpeta en (protegido)/: el recorrido está roto");
  for (const carpeta of encontradas) {
    if (Object.hasOwn(SIN_GUARDA, carpeta)) continue;
    const modulo = MODULOS.find((m) => m.segmentos.includes(carpeta));
    assert.ok(modulo, `${carpeta}/ no es un módulo de modulos.ts: sumalo ahí con su capacidad, o a SIN_GUARDA con el motivo`);
    const layout = path.join(PROTEGIDO, carpeta, "layout.tsx");
    const fuente = existsSync(layout) ? readFileSync(layout, "utf8") : null;
    assert.deepEqual(problemasDelLayout(fuente, modulo.capacidad), [], `${carpeta}/`);
  }
});

test("los módulos que todavía son una guía pasan por la misma guarda", () => {
  const fuente = sinComentarios(readFileSync(path.join(PROTEGIDO, "[modulo]", "page.tsx"), "utf8"));
  assert.match(fuente, /<Guarda\s+capacidad=\{capacidad\}/);
  assert.match(fuente, /moduloDe\(modulo\)\?\.capacidad/);
});

test("cada excepción apunta a una carpeta que existe", () => {
  for (const carpeta of Object.keys(SIN_GUARDA)) {
    assert.ok(carpetas().includes(carpeta), `${carpeta}/ ya no existe: sacala de SIN_GUARDA`);
  }
});
