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

test("cambiar un correo, dar un rol que maneja las cuentas y pasar la dirección piden la contraseña antes de tocar la base", () => {
  for (const { archivo, accion, segunElRol } of CASOS) {
    const cuerpo = cuerpoDe(archivo, accion);
    const pide = cuerpo.indexOf("pedirTuContrasena(");
    assert.notEqual(pide, -1, `${accion} no pide la contraseña`);
    const toca = cuerpo.search(TOCA_LA_BASE);
    assert.ok(toca === -1 || pide < toca, `${accion} toca la base antes de pedir la contraseña`);
    const segunQue = /darloPideContrasena\(/.test(cuerpo.slice(0, pide));
    assert.equal(segunQue, segunElRol, segunElRol ? `${accion} tiene que pedirla según el rol que da` : `${accion} la tiene que pedir siempre`);
  }
});
