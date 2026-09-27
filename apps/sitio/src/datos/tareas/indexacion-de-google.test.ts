import { after, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import type { ClienteDeInspeccion } from "@/lib/busquedas/inspeccion";

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

// La revisión de la indexación contra el Postgres local, con un cliente falso:
// sin red y sin cuota. Las rutas son de esta prueba; como la tarea borra las
// filas de las rutas que no le pasan, al terminar la tabla queda vacía, que es
// como está en una base local sin Search Console.
const RUTAS = Array.from({ length: 25 }, (_, i) => `/prueba-indexacion-${String(i).padStart(2, "0")}`);

/** Un cliente que anota qué le pidieron: PASS a las pares, NEUTRAL a las impares; `rota` tira. */
function clienteFalso(pedidas: string[], rota?: number): ClienteDeInspeccion {
  return {
    async inspeccionar(url) {
      if (pedidas.length === rota) throw new Error("Google respondió 429: se pasó la cuota de inspecciones (2000 por día y 600 por minuto).");
      pedidas.push(new URL(url).pathname);
      const n = Number(url.slice(-2));
      return { veredicto: n % 2 ? "NEUTRAL" : "PASS", cobertura: n % 2 ? "Crawled - currently not indexed" : "Submitted and indexed", ultimoRastreo: null };
    },
  };
}

after(async () => {
  if (sinBase.skip) return;
  const { base } = await import("@/datos/cliente");
  await base.indexacionDeUrl.deleteMany({ where: { ruta: { startsWith: "/prueba-indexacion" } } });
  await base.$disconnect();
});

test("revisa hasta 20 por corrida, las nunca revisadas primero, y guarda cada una", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { revisarIndexacion } = await import("./indexacion-de-google");
  const primera: string[] = [];
  const r = await revisarIndexacion({ cliente: clienteFalso(primera), base, rutas: RUTAS, sitio: "https://ejemplo.org" });
  assert.deepEqual(r, { ok: true, detalle: "Se revisaron 20 de 25 URLs: 10 en Google; las otras 5, en la próxima corrida." });
  assert.deepEqual(primera, RUTAS.slice(0, 20));
  const segunda: string[] = [];
  await revisarIndexacion({ cliente: clienteFalso(segunda), base, rutas: RUTAS, sitio: "https://ejemplo.org" });
  assert.deepEqual(segunda.slice(0, 5), RUTAS.slice(20), "las que faltaban van primero");
  const fila = await base.indexacionDeUrl.findUniqueOrThrow({ where: { ruta: RUTAS[1] } });
  assert.equal(fila.veredicto, "NEUTRAL");
  assert.equal(fila.cobertura, "Crawled - currently not indexed");
});

test("borra las filas de las rutas que ya no están", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { revisarIndexacion } = await import("./indexacion-de-google");
  await base.indexacionDeUrl.create({ data: { ruta: "/prueba-indexacion-vieja", veredicto: "PASS", cobertura: "", revisadaEn: new Date() } });
  await revisarIndexacion({ cliente: clienteFalso([]), base, rutas: RUTAS.slice(0, 2), sitio: "https://ejemplo.org" });
  assert.equal(await base.indexacionDeUrl.count({ where: { ruta: "/prueba-indexacion-vieja" } }), 0);
  assert.equal(await base.indexacionDeUrl.count({ where: { ruta: { startsWith: "/prueba-indexacion" } } }), 2);
});

test("un error corta la corrida con su explicación, y lo ya revisado queda", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { revisarIndexacion } = await import("./indexacion-de-google");
  await base.indexacionDeUrl.deleteMany({ where: { ruta: { startsWith: "/prueba-indexacion" } } });
  const r = await revisarIndexacion({ cliente: clienteFalso([], 2), base, rutas: RUTAS.slice(0, 5), sitio: "https://ejemplo.org" });
  assert.equal(r.ok, false);
  assert.match(r.detalle, /^Se revisaron 2 de 5 URLs y se cortó: Google respondió 429/);
  assert.equal(await base.indexacionDeUrl.count({ where: { ruta: { startsWith: "/prueba-indexacion" } } }), 2);
});

test("pasados los 35 segundos no empieza otra", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { revisarIndexacion } = await import("./indexacion-de-google");
  let ahora = 0;
  // Cada pregunta al reloj corre 20 segundos: la tercera ya pasó el freno.
  const reloj = () => (ahora += 20_000);
  const pedidas: string[] = [];
  const r = await revisarIndexacion({ cliente: clienteFalso(pedidas), base, rutas: RUTAS.slice(0, 5), sitio: "https://ejemplo.org", reloj });
  assert.equal(pedidas.length, 1);
  assert.equal(r.ok, true);
});

test("sin las variables de Search Console, la corrida sale fallida y no toca la API; y está en el cron", async () => {
  const { revisarIndexacionDesdeEntorno, indexacionDeGoogle } = await import("./indexacion-de-google");
  const { SIN_CONEXION } = await import("@/lib/busquedas/entorno");
  const { TAREAS_DIARIAS } = await import("./diarias");
  const antes = process.env.SEARCH_CONSOLE_CLIENT_EMAIL;
  delete process.env.SEARCH_CONSOLE_CLIENT_EMAIL;
  try {
    assert.deepEqual(await revisarIndexacionDesdeEntorno(), { ok: false, detalle: SIN_CONEXION });
  } finally {
    if (antes !== undefined) process.env.SEARCH_CONSOLE_CLIENT_EMAIL = antes;
  }
  assert.ok(TAREAS_DIARIAS.includes(indexacionDeGoogle));
});
