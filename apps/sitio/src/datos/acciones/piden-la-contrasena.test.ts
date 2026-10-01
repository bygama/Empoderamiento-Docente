import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Lo que reparte o recupera acceso pide otra vez la contraseña de quien lo
// hace (`pedirTuContrasena`, sobre-cuentas.ts): cambiar un correo, dar un rol
// que maneja las cuentas (`darloPideContrasena`) y pasar la dirección. Una
// acción no corre fuera de un pedido de Next, así que, como
// acciones-con-sesion.test.ts, esto lee su código: la confirmación tiene que
// estar, y antes de tocar la base.

const AQUI = path.dirname(fileURLToPath(import.meta.url));

const CASOS = [
  { archivo: "cuentas.ts", accion: "cambiarElCorreo", segunElRol: false },
  { archivo: "cuentas.ts", accion: "cambiarElRol", segunElRol: true },
  { archivo: "invitaciones.ts", accion: "invitar", segunElRol: true },
  { archivo: "direccion.ts", accion: "pasarLaDireccion", segunElRol: false },
] as const;

/** Desde acá la acción ya leyó o escribió: la contraseña se pide antes. */
const TOCA_LA_BASE = /\bbase\.|\bponerRol\(|\bcreateUser\(|\bcerrarElAcceso\(/;

/** El cuerpo de una función exportada, sin comentarios (hasta la primera llave que cierra en la columna 0). */
function cuerpoDe(archivo: string, accion: string): string {
  const fuente = readFileSync(path.join(AQUI, archivo), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
  const desde = fuente.indexOf(`export async function ${accion}(`);
  assert.notEqual(desde, -1, `${accion} no está en ${archivo}`);
  const resto = fuente.slice(desde);
  return resto.slice(0, resto.search(/^\}/m));
}

/** Pedirla y no contestar el rechazo es como no pedirla: el resultado se devuelve en la línea de al lado. */
const DEVUELVE_EL_RECHAZO = /const (\w+) = await pedirTuContrasena\([^;]*\);\s*if \(\1\) return \1;/;

test("el chequeo encuentra una acción que pide la contraseña y sigue igual", () => {
  const ignora = "const rechazo = await pedirTuContrasena(sesion, contrasena);\n      await base.user.update({});";
  assert.doesNotMatch(ignora, DEVUELVE_EL_RECHAZO);
  assert.match("const rechazo = await pedirTuContrasena(sesion, contrasena);\n      if (rechazo) return rechazo;", DEVUELVE_EL_RECHAZO);
});

test("cambiar un correo, dar un rol que maneja las cuentas y pasar la dirección piden la contraseña antes de tocar la base", () => {
  for (const { archivo, accion, segunElRol } of CASOS) {
    const cuerpo = cuerpoDe(archivo, accion);
    const pide = cuerpo.indexOf("pedirTuContrasena(");
    assert.notEqual(pide, -1, `${accion} no pide la contraseña`);
    assert.match(cuerpo, DEVUELVE_EL_RECHAZO, `${accion} pide la contraseña pero no devuelve el rechazo`);
    const toca = cuerpo.search(TOCA_LA_BASE);
    assert.ok(toca === -1 || pide < toca, `${accion} toca la base antes de pedir la contraseña`);
    const segunQue = /darloPideContrasena\(/.test(cuerpo.slice(0, pide));
    assert.equal(segunQue, segunElRol, segunElRol ? `${accion} tiene que pedirla según el rol que da` : `${accion} la tiene que pedir siempre`);
  }
});
