import { test } from "node:test";
import assert from "node:assert/strict";
import { leerConTope } from "./cuerpo";
import { PEDAZO, pedidoChunked } from "./__fixtures__/pedido-chunked";

test("lo que entra en el tope se lee entero", async () => {
  const pedido = new Request("http://localhost/x", { method: "POST", body: "hola" });
  assert.equal(new TextDecoder().decode((await leerConTope(pedido, 10)) ?? undefined), "hola");
});

test("un cuerpo chunked de más se corta al pasar el tope, sin leerse entero", async () => {
  const { pedido, contador } = pedidoChunked(100);
  assert.equal(pedido.headers.get("content-length"), null);
  assert.equal(await leerConTope(pedido, 4 * PEDAZO), null);
  assert.ok(contador.pedidos < 10, `pidió ${contador.pedidos} de 100 pedazos`);
});
