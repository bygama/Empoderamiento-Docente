import { test } from "node:test";
import assert from "node:assert/strict";
import type { sumarContador } from "./contadores";
import type { Enlace } from "./enlaces";
import { recibirEvento, type Dependencias } from "./recibir-evento";

type Sumado = Parameters<typeof sumarContador>[0];

/** Un pedido como el que manda el sitio, y lo que se sumó con él. */
async function mandar(cuerpo: unknown, deps: Dependencias = {}): Promise<{ estado: number; sumados: Sumado[] }> {
  const sumados: Sumado[] = [];
  const pedido = new Request("http://localhost/api/contar", { method: "POST", body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo) });
  const r = await recibirEvento(pedido, {
    tope: async () => true,
    buscarEnlace: async () => null,
    ...deps,
    sumar: async (s) => void sumados.push(s),
  });
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal(await r.text(), "");
  return { estado: r.status, sumados };
}

test("un evento de la lista suma con el canal del referido, y el referido no se guarda", async () => {
  const { estado, sumados } = await mandar({ evento: "cv-envio", referido: "www.linkedin.com" });
  assert.equal(estado, 204);
  assert.deepEqual(sumados, [{ evento: "cv-envio", canal: "redes", clave: "" }]);
});

test("sin referido es Directo", async () => {
  const { sumados } = await mandar({ evento: "contacto-envio" });
  assert.deepEqual(sumados, [{ evento: "contacto-envio", canal: "directo", clave: "" }]);
});

test("lo que no es de la lista pública no cuenta, y contesta lo mismo", async () => {
  for (const cuerpo of [{ evento: "enlace-clic" }, { evento: "visita" }, { evento: "cv-envio", referido: "<script>" }, "no es json", {}]) {
    const { estado, sumados } = await mandar(cuerpo);
    assert.equal(estado, 204);
    assert.deepEqual(sumados, [], JSON.stringify(cuerpo));
  }
});

test("pasado el tope de su IP no cuenta", async () => {
  const { estado, sumados } = await mandar({ evento: "cv-vio" }, { tope: async () => false });
  assert.equal(estado, 204);
  assert.deepEqual(sumados, []);
});

test("un CV que llegó por un link lleva el id del link; un código que no existe, nada", async () => {
  const enlace = { id: "id-del-link" } as Enlace;
  const conLink = await mandar({ evento: "cv-empezo", enlace: "taller-mty" }, { buscarEnlace: async (c) => (c === "taller-mty" ? enlace : null) });
  assert.deepEqual(conLink.sumados, [{ evento: "cv-empezo", canal: "directo", clave: "id-del-link" }]);
  const sinLink = await mandar({ evento: "cv-empezo", enlace: "no-existe" });
  assert.deepEqual(sinLink.sumados, [{ evento: "cv-empezo", canal: "directo", clave: "" }]);
});

test("un material cuenta solo si existe, y sin canal", async () => {
  const existe = await mandar({ evento: "material-consultado", clave: "m1", referido: "google.com" }, { material: async (id) => id === "m1" });
  assert.deepEqual(existe.sumados, [{ evento: "material-consultado", canal: "", clave: "m1" }]);
  const noExiste = await mandar({ evento: "material-consultado", clave: "m2" }, { material: async (id) => id === "m1" });
  assert.deepEqual(noExiste.sumados, []);
  const sinClave = await mandar({ evento: "material-consultado" }, { material: async () => true });
  assert.deepEqual(sinClave.sumados, []);
});

test("si la base no contesta, contesta igual 204", async () => {
  const pedido = new Request("http://localhost/api/contar", { method: "POST", body: JSON.stringify({ evento: "cv-vio" }) });
  const r = await recibirEvento(pedido, {
    tope: async () => {
      throw new Error("sin base");
    },
  });
  assert.equal(r.status, 204);
});
