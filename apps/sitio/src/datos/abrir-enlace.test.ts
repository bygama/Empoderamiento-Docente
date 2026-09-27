import { test } from "node:test";
import assert from "node:assert/strict";
import { destinoConUtm, destinoDelEnlace, esUnClic } from "./abrir-enlace";
import type { Enlace } from "./enlaces";

const ENLACE: Enlace = {
  id: "7c1f7c4e-0000-4000-8000-000000000000",
  codigo: "taller-mty",
  nombre: "Taller en Monterrey",
  destino: "/que-hacemos",
  canal: "linkedin",
  creadoEn: new Date("2026-09-27T12:00:00.000Z"),
  creadoPor: "Ana",
};

const PERSONA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

test("lleva a la página con los UTM de dónde se compartió", () => {
  assert.equal(destinoConUtm(ENLACE), "/que-hacemos?utm_source=linkedin&utm_medium=link&utm_campaign=taller-mty");
});

test("un link que existe da su destino y cuenta el clic", async () => {
  const contados: string[] = [];
  const destino = await destinoDelEnlace(new Headers({ "user-agent": PERSONA }), "taller-mty", {
    buscar: async () => ENLACE,
    contar: async (_cabeceras, enlace) => void contados.push(enlace.id),
  });
  assert.equal(destino, "/que-hacemos?utm_source=linkedin&utm_medium=link&utm_campaign=taller-mty");
  assert.deepEqual(contados, [ENLACE.id]);
});

test("un código que no es de ningún link no tiene destino: la página da el 404", async () => {
  assert.equal(await destinoDelEnlace(new Headers(), "nada", { buscar: async () => null }), null);
});

test("un conteo que falla no rompe la redirección", async () => {
  const destino = await destinoDelEnlace(new Headers(), "taller-mty", {
    buscar: async () => ENLACE,
    contar: async () => {
      throw new Error("la base no contesta");
    },
  });
  assert.ok(destino?.startsWith("/que-hacemos?"));
});

test("un clic es de una persona: ni un robot, ni la vista previa de una red", () => {
  assert.equal(esUnClic(new Headers({ "user-agent": PERSONA })), true);
  assert.equal(esUnClic(new Headers({ "user-agent": "LinkedInBot/1.0" })), false);
  assert.equal(esUnClic(new Headers()), false);
});
