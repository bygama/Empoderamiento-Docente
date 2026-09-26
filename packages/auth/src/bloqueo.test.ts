import { test } from "node:test";
import assert from "node:assert/strict";
import {
  claveDeBloqueo,
  conUnFalloMas,
  respuestaDeFreno,
  segundosDeFreno,
  type AlmacenDeBloqueos,
  type EstadoDeBloqueo,
} from "./bloqueo";
import { destrabar } from "./ganchos";

const MINUTO = 60 * 1000;
const T0 = new Date("2026-09-26T12:00:00.000Z");
const mas = (fecha: Date, minutos: number) => new Date(fecha.getTime() + minutos * MINUTO);

/** Aplica `n` fallos (uno o más), uno por minuto desde `desde`. Devuelve el estado y la hora del último. */
function fallar(n: number, desde: Date, inicial: EstadoDeBloqueo | null = null) {
  let ahora = desde;
  let estado = conUnFalloMas(inicial, ahora);
  for (let i = 1; i < n; i++) {
    ahora = mas(desde, i);
    estado = conUnFalloMas(estado, ahora);
  }
  return { estado, ahora };
}

function almacenEnMemoria(): AlmacenDeBloqueos & { filas: Map<string, EstadoDeBloqueo> } {
  const filas = new Map<string, EstadoDeBloqueo>();
  return {
    filas,
    async leer(clave) {
      return filas.get(clave) ?? null;
    },
    async actualizar(clave, cambio) {
      const siguiente = cambio(filas.get(clave) ?? null);
      filas.set(clave, siguiente);
      return siguiente;
    },
    async borrar(clave) {
      filas.delete(clave);
    },
    async podar() {},
  };
}

test("cuatro fallos no frenan; el quinto frena 15 minutos y contesta 429", () => {
  const cuatro = fallar(4, T0);
  assert.equal(segundosDeFreno(cuatro.estado, mas(cuatro.ahora, 0)), null);

  const cinco = fallar(5, T0);
  const segundos = segundosDeFreno(cinco.estado, cinco.ahora);
  assert.equal(segundos, 15 * 60);
  const error = respuestaDeFreno(segundos ?? 0);
  assert.equal(error.statusCode, 429);
  assert.deepEqual(error.body, { message: "Too many requests. Please try again later." });
  assert.deepEqual(error.headers, { "X-Retry-After": "900" });
});

test("los fallos fuera de la ventana de 15 minutos no suman", () => {
  let { estado } = fallar(4, T0);
  estado = conUnFalloMas(estado, mas(T0, 20));
  assert.equal(estado.fallos, 1);
  assert.equal(segundosDeFreno(estado, mas(T0, 20)), null);
});

test("el freno se duplica hasta una hora: 15, 30, 60, 60", () => {
  let estado: EstadoDeBloqueo | null = null;
  let desde = T0;
  const frenos: number[] = [];
  for (let vuelta = 0; vuelta < 4; vuelta++) {
    const r = fallar(5, desde, estado);
    estado = r.estado;
    frenos.push((segundosDeFreno(estado, r.ahora) ?? 0) / 60);
    desde = mas(estado.hasta ?? r.ahora, 1);
  }
  assert.deepEqual(frenos, [15, 30, 60, 60]);
});

test("un fallo durante el freno no lo alarga", () => {
  const { estado, ahora } = fallar(5, T0);
  assert.deepEqual(conUnFalloMas(estado, mas(ahora, 1)), estado);
});

test("tras un día quieto la escalera vuelve a 15 minutos", () => {
  const primera = fallar(5, T0);
  const otroDia = mas(primera.ahora, 25 * 60);
  const segunda = fallar(5, otroDia, primera.estado);
  assert.equal(segundosDeFreno(segunda.estado, segunda.ahora), 15 * 60);
});

test("el HMAC no lleva el correo, no cambia entre llamadas y depende del secreto", () => {
  const clave = claveDeBloqueo("ana@ed.org", "secreto-a");
  assert.match(clave, /^[0-9a-f]{64}$/);
  assert.ok(!clave.includes("ana"));
  assert.equal(claveDeBloqueo("  Ana@ED.org ", "secreto-a"), clave);
  assert.notEqual(claveDeBloqueo("ana@ed.org", "secreto-b"), clave);
});

test("un reset de contraseña destraba la cuenta, escriba como escriba el correo", async () => {
  const almacen = almacenEnMemoria();
  const clave = claveDeBloqueo("Ana@ED.org", "secreto");
  const { estado, ahora } = fallar(5, T0);
  await almacen.actualizar(clave, () => estado);
  assert.notEqual(segundosDeFreno(await almacen.leer(clave), ahora), null);

  await destrabar(almacen, "ana@ed.org", "secreto");
  assert.equal(await almacen.leer(clave), null);
});
