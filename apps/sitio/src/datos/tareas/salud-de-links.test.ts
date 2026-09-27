import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import type { Pedir } from "@/datos/biblioteca/buscar-datos";
import { chequearLink } from "@/datos/biblioteca/chequear-link";
import type { Resultado } from "@/lib/red/pedido-protegido";
import { POR_CORRIDA, resumenDeLaCorrida } from "./salud-de-links";

// El chequeo de un link sin red (el pedido se inyecta) y la corrida contra el
// Postgres local, que después devuelve cada material a como estaba.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

const contesta = (estado: number, cuerpo = ""): Resultado => ({ ok: true, estado, url: "https://x", tipo: "application/json", cuerpo, truncado: false });
const falla = (motivo: "dns" | "tiempo" | "ip", detalle = "No."): Resultado => ({ ok: false, motivo, detalle });
/** Un pedido que contesta lo mismo a todo, o según el método. */
const pedido = (porMetodo: { HEAD?: Resultado; GET?: Resultado }): Pedir => async (_url, o) => (o.metodo === "HEAD" ? porMetodo.HEAD : porMetodo.GET) ?? contesta(500);

test("un DOI se chequea en doi.org: registrado anda, sin registrar está roto, sin respuesta no es roto", async () => {
  const registrado = pedido({ GET: contesta(200, '{"responseCode":1}') });
  assert.equal((await chequearLink({ url: "https://doi.org/10.1/x", doi: "10.1/x" }, registrado)).chequeo, "bien");
  const noEsta = pedido({ GET: contesta(404, '{"responseCode":100}') });
  assert.equal((await chequearLink({ url: null, doi: "10.1/x" }, noEsta)).chequeo, "roto");
  assert.equal((await chequearLink({ url: null, doi: "10.1/x" }, pedido({ GET: falla("tiempo") }))).chequeo, "sin-respuesta");
});

test("un link: HEAD y, si no sirve, GET; solo el 404, el 410 y el sitio que no existe son rotos", async () => {
  const link = { url: "https://revista.org/a", doi: null };
  assert.equal((await chequearLink(link, pedido({ HEAD: contesta(405), GET: contesta(200) }))).chequeo, "bien");
  assert.deepEqual(await chequearLink(link, pedido({ HEAD: contesta(404), GET: contesta(404) })), { chequeo: "roto", detalle: "Dio 404: la página no está más." });
  assert.equal((await chequearLink(link, pedido({ HEAD: falla("dns"), GET: falla("dns") }))).chequeo, "roto");
  assert.equal((await chequearLink(link, pedido({ HEAD: contesta(503), GET: contesta(503) }))).chequeo, "sin-respuesta");
  assert.equal((await chequearLink(link, pedido({ HEAD: contesta(403), GET: contesta(403) }))).chequeo, "sin-respuesta");
  assert.equal((await chequearLink(link, pedido({ HEAD: falla("ip"), GET: falla("ip") }))).chequeo, "sin-chequear");
  assert.equal((await chequearLink({ url: "http://viejo.org/a", doi: null }, pedido({}))).chequeo, "sin-chequear");
  assert.equal((await chequearLink({ url: "/biblioteca/tesis.pdf", doi: null }, pedido({}))).chequeo, "bien");
});

test("lo que dice la corrida", () => {
  assert.equal(resumenDeLaCorrida([]), "No había links para chequear: todos se chequearon hace menos de 7 días.");
  const bien = { titulo: "A", chequeo: { chequeo: "bien" as const, detalle: "" } };
  const roto = { titulo: "B", chequeo: { chequeo: "roto" as const, detalle: "" } };
  assert.equal(resumenDeLaCorrida([bien, roto, bien]), "Se chequearon 3 links: 2 bien, 1 roto («B»).");
  assert.equal(resumenDeLaCorrida([roto]), "Se chequeó 1 link: 0 bien, 1 roto («B»).");
});

type Antes = { id: string; chequeoEn: Date | null; chequeo: string | null; chequeoDetalle: string | null };
let antes: Antes[] = [];

before(async () => {
  if (!process.env.DATABASE_URL) return;
  const { base } = await import("@/datos/cliente");
  antes = await base.material.findMany({ select: { id: true, chequeoEn: true, chequeo: true, chequeoDetalle: true } });
});
after(async () => {
  if (!process.env.DATABASE_URL) return;
  const { base } = await import("@/datos/cliente");
  for (const { id, ...chequeo } of antes) await base.material.update({ where: { id }, data: chequeo });
});

test("la corrida chequea lo vencido, hasta el tope, y lo recién chequeado espera una semana", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { chequearLinks } = await import("./salud-de-links");
  await base.material.updateMany({ data: { chequeoEn: null, chequeo: null, chequeoDetalle: null } });
  const todoBien: Pedir = async () => contesta(200, '{"responseCode":1}');
  const primera = await chequearLinks({ db: base, pedir: todoBien });
  assert.equal(primera.detalle, `Se chequearon ${POR_CORRIDA} links: ${POR_CORRIDA} bien.`);
  assert.equal(await base.material.count({ where: { chequeo: "bien" } }), POR_CORRIDA);
  // La segunda sigue con los que faltan: los recién chequeados esperan una semana.
  const publicados = await base.material.count({ where: { publicado: true } });
  const segunda = await chequearLinks({ db: base, pedir: todoBien });
  assert.equal(segunda.detalle, `Se chequearon ${Math.min(POR_CORRIDA, publicados - POR_CORRIDA)} links: ${Math.min(POR_CORRIDA, publicados - POR_CORRIDA)} bien.`);
});
