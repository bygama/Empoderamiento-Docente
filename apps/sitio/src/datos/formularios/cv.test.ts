import { after, test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";

cargarEntorno({ path: [".env.local"], quiet: true });
const hayBase = Boolean(process.env.DATABASE_URL);
const sinBase = { skip: !hayBase && "sin DATABASE_URL" };

// Abierto y sin token: los archivos van a apps/sitio/.cv/, como en local.
const ABIERTO = { ...process.env, CV_ABIERTO: "si", CV_BLOB_READ_WRITE_TOKEN: undefined, VERCEL: undefined };
const correo = `prueba-${randomUUID()}@ed.test`;
const ips: string[] = [];
const CAMPOS = { nombre: "Ana Prueba", correo, pais: "México", nivel: "Secundaria o media", area: "Matemática", mensaje: "" };
const PDF = new TextEncoder().encode("%PDF-1.7\nun CV de prueba");

/** Una IP propia de esta prueba, de la red de pruebas de rendimiento (198.18.0.0/15): el cupo sale solo de una IP válida. */
function ipDePrueba(): string {
  const [a = 0, b = 0, c = 0] = randomBytes(3);
  return `198.${18 + (a & 1)}.${b}.${c}`;
}

function pedido({ campos = CAMPOS, archivo = PDF as Uint8Array | null, ip = ipDePrueba() } = {}): Request {
  ips.push(ip);
  const datos = new FormData();
  for (const [clave, valor] of Object.entries(campos)) datos.set(clave, valor);
  if (archivo) datos.set("archivo", new File([new Uint8Array(archivo)], "mi-cv.pdf", { type: "application/pdf" }));
  return new Request("http://localhost/api/cv", { method: "POST", body: datos, headers: { "x-real-ip": ip } });
}

after(async () => {
  if (!hayBase) return;
  const { base } = await import("@/datos/cliente");
  const { claveDeLimite } = await import("@/lib/formularios/limite");
  const { almacenDeCV } = await import("./cv");
  for (const { archivo } of await base.mensaje.findMany({ where: { correo } })) if (archivo) await almacenDeCV(ABIERTO).borrar(archivo);
  await base.mensaje.deleteMany({ where: { correo } });
  const claves = ips.map((ip) => claveDeLimite("cv", ip, process.env.BETTER_AUTH_SECRET ?? ""));
  await base.limitePorIp.deleteMany({ where: { clave: { in: claves } } });
  await base.$disconnect();
});

test("apagado, /api/cv no existe", sinBase, async () => {
  const { recibirCV } = await import("./cv");
  assert.equal((await recibirCV(pedido(), { ...ABIERTO, CV_ABIERTO: undefined })).status, 404);
});

test("un CV válido queda con su archivo privado, y lo demás en datos", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { almacenDeCV, recibirCV } = await import("./cv");
  const r = await recibirCV(pedido(), ABIERTO);
  assert.deepEqual(await r.json(), { ok: true });
  const fila = await base.mensaje.findFirstOrThrow({ where: { correo } });
  assert.equal(fila.bandeja, "cv");
  assert.equal(fila.archivo, `cv/${fila.id}.pdf`);
  assert.equal(fila.archivoBytes, PDF.byteLength);
  assert.equal(fila.mensaje, null);
  assert.deepEqual(fila.datos, [
    { etiqueta: "Nivel en que enseñás", valor: "Secundaria o media" },
    { etiqueta: "Área en que enseñás", valor: "Matemática" },
  ]);
  const leido = await almacenDeCV(ABIERTO).leer(fila.archivo!);
  assert.equal(await new Response(leido?.stream).text(), "%PDF-1.7\nun CV de prueba");
});

test("sin archivo, con uno que no es PDF o sin un campo obligatorio, 400 y nada guardado", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { recibirCV } = await import("./cv");
  const antes = await base.mensaje.count({ where: { correo } });
  const error = async (p: Request) => (await (await recibirCV(p, ABIERTO)).json()).error;
  assert.equal(await error(pedido({ archivo: null })), "Adjuntá tu CV en PDF.");
  assert.match(await error(pedido({ archivo: new TextEncoder().encode("<html>hola</html>") })), /no es un PDF/);
  assert.equal(await error(pedido({ campos: { ...CAMPOS, nivel: "" } })), "Elegí una opción de «Nivel en que enseñás».");
  assert.equal(await base.mensaje.count({ where: { correo } }), antes);
});

test("en Vercel sin el token del store privado, 503 y nunca el disco", sinBase, async () => {
  const { recibirCV } = await import("./cv");
  const r = await recibirCV(pedido(), { ...ABIERTO, VERCEL: "1" });
  assert.equal(r.status, 503);
  assert.match((await r.json()).error, /no podemos recibir CV/);
});

test("el cuarto CV de la misma IP en una hora recibe 429", sinBase, async () => {
  const { recibirCV, TOPE_DE_CV } = await import("./cv");
  const ip = ipDePrueba();
  for (let i = 0; i < TOPE_DE_CV; i++) assert.equal((await recibirCV(pedido({ ip }), ABIERTO)).status, 200);
  assert.equal((await recibirCV(pedido({ ip }), ABIERTO)).status, 429);
});

test("un cuerpo chunked de más recibe 413 sin leerse entero, aunque no diga su largo", async () => {
  const { pedidoChunked } = await import("@/lib/formularios/__fixtures__/pedido-chunked");
  const { recibirCV } = await import("./cv");
  // 400 pedazos de 16 KB: 6,25 MB, más que el tope de 4 MB y su margen.
  const { pedido, contador } = pedidoChunked(400, "http://localhost/api/cv", { "content-type": "multipart/form-data; boundary=x" });
  const r = await recibirCV(pedido, ABIERTO);
  assert.equal(r.status, 413);
  assert.ok(contador.pedidos < 300, `leyó ${contador.pedidos} de 400 pedazos`);
});
