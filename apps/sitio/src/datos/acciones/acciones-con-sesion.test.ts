import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// AGENTS.md §12: toda Server Action del admin empieza por
// `auth.api.getSession`. El middleware deja pasar las acciones sin cookie (un
// redirect no es una respuesta válida para una acción) y el layout protegido
// no las cubre, así que la sesión la verifica cada acción o nadie. Este test
// es lo que hace que la regla no dependa de acordarse.

/** Archivos «use server» que no piden sesión a propósito, cada uno con su motivo. */
const SIN_SESION: Record<string, string> = {
  "datos/acciones/salir-de-vista-previa.ts":
    "apaga una cookie que es de quien la tiene: quien ya salió del admin también tiene que poder salir del borrador",
};

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Lo que está mal en un archivo con «use server»: cada función exportada
 * tiene que llamar a `auth.api.getSession`, y no se exporta otra cosa que
 * funciones y tipos (una acción como `const` escaparía a este chequeo).
 */
function problemasDe(fuente: string): string[] {
  const problemas: string[] = [];
  for (const [, exportado] of fuente.matchAll(/^export (?!async function |type )(.*)$/gm)) {
    problemas.push(`exporta algo que no es una función ni un tipo: «export ${exportado.trim()}»`);
  }
  for (const parte of fuente.split(/^export async function /m).slice(1)) {
    const nombre = parte.slice(0, parte.indexOf("("));
    // El cuerpo termina en la primera llave que cierra en la columna 0.
    const cuerpo = parte.slice(0, parte.search(/^\}/m));
    if (!cuerpo.includes("auth.api.getSession(")) problemas.push(`${nombre} no llama a auth.api.getSession`);
  }
  return problemas;
}

function archivosDe(carpeta: string): string[] {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(carpeta, e.name);
    if (e.isDirectory()) return archivosDe(ruta);
    return /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [ruta] : [];
  });
}

/** Cada archivo de src/ que declara «use server», con su ruta relativa a src/ en barras normales. */
function archivosDeAcciones(): Array<{ relativa: string; fuente: string }> {
  return archivosDe(SRC)
    .map((ruta) => ({ relativa: path.relative(SRC, ruta).split(path.sep).join("/"), fuente: readFileSync(ruta, "utf8") }))
    .filter(({ fuente }) => /["']use server["']/.test(fuente));
}

test("el chequeo encuentra una acción sin sesión", () => {
  const fuente = `"use server";\n\nexport async function publicar(slug: string) {\n  return base.pagina.update({ where: { slug } });\n}\n`;
  assert.deepEqual(problemasDe(fuente), ["publicar no llama a auth.api.getSession"]);
});

test("el chequeo no mira la sesión de la función que sigue", () => {
  const fuente = `"use server";\n\nexport async function a() {\n  return 1;\n}\n\nexport async function b() {\n  const sesion = await auth.api.getSession({ headers: await headers() });\n}\n`;
  assert.deepEqual(problemasDe(fuente), ["a no llama a auth.api.getSession"]);
});

test("el chequeo no deja pasar una acción exportada como const", () => {
  const fuente = `"use server";\n\nexport const borrar = async () => {\n  return 1;\n};\n`;
  assert.equal(problemasDe(fuente).length, 1);
});

test("toda Server Action de la app vive en datos/acciones/ y empieza por la sesión", () => {
  const acciones = archivosDeAcciones();
  assert.ok(acciones.length > 0, "no encontró ningún archivo «use server»: el recorrido de src/ está roto");
  for (const { relativa, fuente } of acciones) {
    assert.ok(relativa.startsWith("datos/acciones/"), `${relativa} declara «use server» fuera de datos/acciones/ (AGENTS.md §12)`);
    assert.ok(fuente.trimStart().startsWith('"use server"'), `${relativa}: «use server» va arriba del archivo, no adentro de una función`);
    if (relativa in SIN_SESION) continue;
    assert.deepEqual(problemasDe(fuente), [], `${relativa}`);
  }
});

test("cada excepción apunta a un archivo «use server» que existe", () => {
  const acciones = new Set(archivosDeAcciones().map((a) => a.relativa));
  for (const relativa of Object.keys(SIN_SESION)) {
    assert.ok(acciones.has(relativa), `${relativa} ya no es una acción: sacalo de SIN_SESION`);
  }
});
