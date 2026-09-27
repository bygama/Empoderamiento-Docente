import { test } from "node:test";
import assert from "node:assert/strict";
import { CABECERA_DEL_METODO } from "@/lib/metricas/clic";
import { contarClic, destinoConUtm, destinoDelEnlace } from "./abrir-enlace";
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

/** Cuántas veces cuenta un pedido con esas cabeceras, sin tocar la base. */
async function cuantasCuenta(cabeceras: Record<string, string>): Promise<number> {
  let sumados = 0;
  await contarClic(new Headers(cabeceras), ENLACE, { tope: async () => true, sumar: async () => void sumados++ });
  return sumados;
}

test("un GET de una persona cuenta; un HEAD no; sin la cabecera del proxy, tampoco", async () => {
  assert.equal(await cuantasCuenta({ [CABECERA_DEL_METODO]: "GET", "user-agent": PERSONA }), 1);
  assert.equal(await cuantasCuenta({ [CABECERA_DEL_METODO]: "HEAD", "user-agent": PERSONA }), 0);
  assert.equal(await cuantasCuenta({ "user-agent": PERSONA }), 0);
});

test("ni un robot ni la vista previa de una red cuentan, aunque sean un GET", async () => {
  assert.equal(await cuantasCuenta({ [CABECERA_DEL_METODO]: "GET", "user-agent": "LinkedInBot/1.0" }), 0);
  assert.equal(await cuantasCuenta({ [CABECERA_DEL_METODO]: "GET" }), 0);
});

test("pasado el tope de su IP no cuenta", async () => {
  let sumados = 0;
  await contarClic(new Headers({ [CABECERA_DEL_METODO]: "GET", "user-agent": PERSONA }), ENLACE, { tope: async () => false, sumar: async () => void sumados++ });
  assert.equal(sumados, 0);
});
