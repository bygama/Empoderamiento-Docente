import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { TIPOS_DE_ACTIVIDAD } from "@/datos/actividad";
import { CLAVES_DE_PENDIENTES } from "@/datos/inicio/pendientes";

// Los registros que se parten por módulo: cada archivo de la carpeta suma sus
// entradas y el índice las compone con spreads. Un spread no avisa si dos
// módulos declaran la misma clave —el último pisa al primero—, y el objeto
// literal único de antes sí. Esta es la guarda: la suma de las claves de los
// módulos tiene que dar la cuenta del índice. Si un módulo existe y el índice
// no lo compone, también falla.

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const REGISTROS = [
  { carpeta: "datos/actividad", cuantas: TIPOS_DE_ACTIVIDAD.length },
  { carpeta: "admin/actividad/frase", cuantas: TIPOS_DE_ACTIVIDAD.length },
  { carpeta: "admin/cuentas/actividad/modulos", cuantas: TIPOS_DE_ACTIVIDAD.length },
  { carpeta: "datos/inicio/pendientes", cuantas: CLAVES_DE_PENDIENTES.length },
];

/** Las claves que declara cada módulo de una carpeta: las de sus exports `DE_…` y `DEL_…`. */
async function clavesDeLosModulos(carpeta: string): Promise<string[]> {
  const dir = path.join(SRC, carpeta);
  const archivos = readdirSync(dir).filter((a) => a.endsWith(".ts") && a !== "index.ts" && !a.endsWith(".test.ts"));
  const modulos = await Promise.all(archivos.map((a) => import(pathToFileURL(path.join(dir, a)).href) as Promise<Record<string, unknown>>));
  return modulos.flatMap((m) => Object.entries(m).flatMap(([nombre, valor]) => (/^DEL?_/.test(nombre) && valor ? Object.keys(valor) : [])));
}

test("ninguna clave está en dos módulos, y todo módulo entra en su índice", async () => {
  for (const { carpeta, cuantas } of REGISTROS) {
    const claves = await clavesDeLosModulos(carpeta);
    assert.deepEqual(
      claves.filter((c, i) => claves.indexOf(c) !== i),
      [],
      `${carpeta}: claves en dos módulos`,
    );
    assert.equal(claves.length, cuantas, `${carpeta}: la suma de los módulos no da la cuenta del índice`);
  }
});
