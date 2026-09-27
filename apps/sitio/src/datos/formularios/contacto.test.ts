import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

const correo = `prueba-${randomUUID()}@ed.test`;
const ips: string[] = [];
const BIEN = { tema: "investigacion", nombre: "Ana Prueba", email: correo, institucion: "Escuela 1", pais: "Chile", mensaje: "Hola", web: "" };

/** Un pedido como el del formulario, desde una IP propia de esta prueba. */
function pedido(cuerpo: unknown, ip = `prueba-${randomUUID()}`): Request {
  ips.push(ip);
  return new Request("http://localhost/api/contacto", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(cuerpo),
  });
}

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  const { claveDeLimite } = await import("@/lib/formularios/limite");
  await base.mensaje.deleteMany({ where: { correo } });
  const claves = ips.map((ip) => claveDeLimite("contacto", ip, process.env.BETTER_AUTH_SECRET ?? ""));
  await base.limitePorIp.deleteMany({ where: { clave: { in: claves } } });
  await base.$disconnect();
});

test("un contacto válido queda en la bandeja, con el tema como se lee", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { recibirContacto } = await import("./contacto");
  const r = await recibirContacto(pedido(BIEN));
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true });
  const fila = await base.mensaje.findFirstOrThrow({ where: { correo } });
  assert.equal(fila.bandeja, "contacto");
  assert.equal(fila.estado, "nuevo");
  assert.equal(fila.tema, "Investigación");
  assert.equal(fila.pais, "Chile");
  assert.deepEqual(fila.datos, [{ etiqueta: "Institución u organización", valor: "Escuela 1" }]);
});

test("el campo trampa contesta que salió bien y no guarda nada", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { recibirContacto } = await import("./contacto");
  const antes = await base.mensaje.count({ where: { correo } });
  const r = await recibirContacto(pedido({ ...BIEN, web: "https://spam.test" }));
  assert.deepEqual(await r.json(), { ok: true });
  assert.equal(await base.mensaje.count({ where: { correo } }), antes);
});

test("lo inválido vuelve con el primer problema, en llano", sinBase, async () => {
  const { recibirContacto } = await import("./contacto");
  const sinCorreo = await recibirContacto(pedido({ ...BIEN, email: "ana" }));
  assert.equal(sinCorreo.status, 400);
  assert.deepEqual(await sinCorreo.json(), { ok: false, error: "Revisá «Email»: no parece un correo." });
  const sinTema = await recibirContacto(pedido({ ...BIEN, tema: "cualquiera" }));
  assert.deepEqual(await sinTema.json(), { ok: false, error: "Elegí de qué querés hablar." });
  const roto = await recibirContacto(new Request("http://localhost/api/contacto", { method: "POST", body: "{no es json" }));
  assert.equal(roto.status, 400);
});

test("el país es uno de los de Ajustes › Datos del sitio, u «Otro»", sinBase, async () => {
  const { recibirContacto } = await import("./contacto");
  const { datosDelSitio } = await import("@/datos/consultas/sitio");
  const [primero] = (await datosDelSitio()).paises;
  const inventado = await recibirContacto(pedido({ ...BIEN, pais: "Atlántida" }));
  assert.deepEqual(await inventado.json(), { ok: false, error: "Elegí una opción de «País»." });
  assert.equal((await recibirContacto(pedido({ ...BIEN, pais: primero }))).status, 200);
  assert.equal((await recibirContacto(pedido({ ...BIEN, pais: "Otro" }))).status, 200);
});

test("el sexto de la misma IP en una hora recibe 429, con cuándo volver", sinBase, async () => {
  const { recibirContacto, TOPE_DE_CONTACTO } = await import("./contacto");
  const ip = `prueba-${randomUUID()}`;
  for (let i = 0; i < TOPE_DE_CONTACTO; i++) assert.equal((await recibirContacto(pedido(BIEN, ip))).status, 200);
  const r = await recibirContacto(pedido(BIEN, ip));
  assert.equal(r.status, 429);
  assert.equal(r.headers.get("retry-after"), "3600");
  assert.match((await r.json()).error, /Probá de nuevo en una hora/);
});

test("un cuerpo chunked de más recibe 413 sin leerse entero, aunque no diga su largo", async () => {
  const { pedidoChunked } = await import("@/lib/formularios/__fixtures__/pedido-chunked");
  const { recibirContacto } = await import("./contacto");
  const { pedido, contador } = pedidoChunked(100, "http://localhost/api/contacto", { "content-type": "application/json" });
  const r = await recibirContacto(pedido);
  assert.equal(r.status, 413);
  assert.ok(contador.pedidos < 10, `leyó ${contador.pedidos} de 100 pedazos`);
});
