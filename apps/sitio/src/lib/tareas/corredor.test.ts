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

test("dos tareas con la misma clave no se pueden definir", () => {
  assert.throws(() => definirTareas([bien("a"), bien("a")]), /dos tareas con la clave «a»/);
  assert.equal(definirTareas([bien("a"), bien("b")]).length, 2);
});
