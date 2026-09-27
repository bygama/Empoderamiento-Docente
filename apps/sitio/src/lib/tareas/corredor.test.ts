import { test } from "node:test";
import assert from "node:assert/strict";
import { correrTareas, type Corrida } from "./corredor";
import { definirTareas, type Tarea } from "./registro";

const bien = (clave: string): Tarea => ({ clave, nombre: clave, correr: async () => ({ ok: true, detalle: `${clave} al día.` }) });

test("una tarea que tira no frena a las otras, y todas quedan registradas", async () => {
  const registradas: Corrida[] = [];
  const rota: Tarea = {
    clave: "rota",
    nombre: "Rota",
    correr: async () => {
      throw new Error("La API respondió 500.");
    },
  };
  const corridas = await correrTareas([bien("a"), rota, bien("b")], { registrar: async (c) => void registradas.push(c), limiteMs: 1000 });
  assert.deepEqual(corridas, [
    { clave: "a", ok: true, detalle: "a al día." },
    { clave: "rota", ok: false, detalle: "La API respondió 500." },
    { clave: "b", ok: true, detalle: "b al día." },
  ]);
  assert.deepEqual(registradas.map((c) => c.clave).sort(), ["a", "b", "rota"]);
});

test("una tarea que no termina a tiempo queda fallida y se registra", async () => {
  const colgada: Tarea = { clave: "colgada", nombre: "Colgada", correr: () => new Promise(() => {}) };
  const registradas: Corrida[] = [];
  const corridas = await correrTareas([colgada, bien("a")], { registrar: async (c) => void registradas.push(c), limiteMs: 50 });
  assert.equal(corridas[0].ok, false);
  assert.match(corridas[0].detalle, /^No terminó en \d+ segundos\.$/);
  assert.equal(corridas[1].ok, true);
  assert.equal(registradas.length, 2);
});

test("si registrar falla, la corrida lo dice y las demás se registran igual", async () => {
  const registradas: string[] = [];
  const corridas = await correrTareas([bien("a"), bien("b")], {
    registrar: async (c) => {
      if (c.clave === "a") throw new Error("la base no contesta");
      registradas.push(c.clave);
    },
    limiteMs: 1000,
  });
  assert.equal(corridas[0].detalle, "a al día. No se pudo registrar: la base no contesta");
  assert.deepEqual(registradas, ["b"]);
});

test("dos tareas con la misma clave no se pueden definir, ni una que espera a otra que no va antes", () => {
  assert.throws(() => definirTareas([bien("a"), bien("a")]), /dos tareas con la clave «a»/);
  assert.equal(definirTareas([bien("a"), bien("b")]).length, 2);
  assert.throws(() => definirTareas([{ ...bien("b"), despuesDe: "a" }, bien("a")]), /«b» espera a «a», que tiene que ir antes/);
  assert.equal(definirTareas([bien("a"), { ...bien("b"), despuesDe: "a" }]).length, 2);
});

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

test("la que espera a otra empieza cuando esa terminó, aunque haya fallado; las demás no esperan", async () => {
  const orden: string[] = [];
  const copia: Tarea = {
    clave: "copia",
    nombre: "Copia",
    correr: async () => {
      await esperar(30);
      orden.push("copia");
      throw new Error("Vercel respondió 500.");
    },
  };
  const lee: Tarea = { clave: "lee", nombre: "Lee", despuesDe: "copia", correr: async () => (orden.push("lee"), { ok: true, detalle: "leyó" }) };
  const suelta: Tarea = { clave: "suelta", nombre: "Suelta", correr: async () => (orden.push("suelta"), { ok: true, detalle: "listo" }) };
  const corridas = await correrTareas([copia, lee, suelta], { registrar: async () => {}, limiteMs: 1000 });
  assert.deepEqual(orden, ["suelta", "copia", "lee"]);
  assert.deepEqual(
    corridas.map((c) => [c.clave, c.ok]),
    [
      ["copia", false],
      ["lee", true],
      ["suelta", true],
    ],
  );
});

test("la espera cuenta en su tiempo: si la otra se cuelga, la corrida entera sigue cabiendo en el límite", async () => {
  // Si el reloj arrancara recién al terminar la espera, «lee» empezaría a los 50 ms y terminaría bien a los 90.
  const colgada: Tarea = { clave: "copia", nombre: "Copia", correr: () => new Promise(() => {}) };
  const lee: Tarea = { clave: "lee", nombre: "Lee", despuesDe: "copia", correr: async () => (await esperar(40), { ok: true, detalle: "leyó" }) };
  const [, esperando] = await correrTareas([colgada, lee], { registrar: async () => {}, limiteMs: 50 });
  assert.equal(esperando.ok, false);
  assert.match(esperando.detalle, /^No terminó en \d+ segundos\.$/);
});
