import { test } from "node:test";
import assert from "node:assert/strict";
import { CONEXIONES } from "@/config/conexiones";
import { estadoDeLasConexiones } from "./conexiones";
import { TAREAS_DIARIAS } from "./tareas/diarias";

// El estado de las conexiones con un entorno y unas corridas falsas: sin base.

const AYER = new Date("2026-09-25T06:00:00.000Z");
const HOY = new Date("2026-09-26T06:00:00.000Z");

/** Las corridas que devuelve cada tarea: la de Vercel falló hoy y salió bien ayer; las demás, bien. */
async function leer(tarea: string | null) {
  if (tarea === "metricas-de-vercel") return { ultima: { corridaEn: HOY, ok: false, detalle: "Vercel respondió 401." }, ultimaCorrecta: AYER };
  return { ultima: { corridaEn: HOY, ok: true, detalle: "Nada nuevo: ya estaba al día." }, ultimaCorrecta: HOY };
}

const ENTORNO = { VERCEL_TOKEN: "un-secreto-que-no-sale", VERCEL_ANALYTICS_PROJECT_ID: "prj_x", CRON_SECRET: "otro-secreto", RESEND_API_KEY: "" };

test("sin usarAjustes no dice nada", async () => {
  assert.deepEqual(await estadoDeLasConexiones("edita", { entorno: ENTORNO, leer }), []);
});

test("configurada o no por sus variables, con los nombres de las que faltan y nunca un valor", async () => {
  const estado = await estadoDeLasConexiones("administra", { entorno: ENTORNO, leer });
  const de = (clave: string) => estado.find((c) => c.clave === clave)!;
  assert.deepEqual(de("vercel-analytics").faltan, []);
  assert.deepEqual(de("search-console").faltan, ["SEARCH_CONSOLE_CLIENT_EMAIL", "SEARCH_CONSOLE_PRIVATE_KEY", "SEARCH_CONSOLE_SITE_URL"]);
  // Una variable vacía no configura nada.
  assert.deepEqual(de("resend").faltan, ["RESEND_API_KEY", "CORREO_REMITENTE"]);
  const todo = JSON.stringify(estado);
  assert.ok(!todo.includes("un-secreto-que-no-sale") && !todo.includes("otro-secreto"), "salió el valor de una variable");
});

test("con error si está configurada y su última corrida falló, con la última correcta", async () => {
  const estado = await estadoDeLasConexiones("dirige", { entorno: ENTORNO, leer });
  const vercel = estado.find((c) => c.clave === "vercel-analytics")!;
  assert.equal(vercel.conError, true);
  assert.deepEqual(vercel.tareasDeLaConexion.map((t) => [t.nombre, t.ultima?.ok, t.ultimaCorrecta]), [["Copia de Vercel Analytics", false, AYER]]);
  // Sin configurar no es un error: es lo que falta hacer.
  const sinConfigurar = await estadoDeLasConexiones("dirige", { entorno: {}, leer });
  assert.equal(sinConfigurar.find((c) => c.clave === "vercel-analytics")!.conError, false);
});

test("el cron mira la última corrida de cualquier tarea", async () => {
  const pedidas: Array<string | null> = [];
  const estado = await estadoDeLasConexiones("administra", { entorno: ENTORNO, leer: async (t) => (pedidas.push(t), leer(t)) });
  assert.ok(pedidas.includes(null));
  assert.equal(estado.find((c) => c.clave === "cron")!.tareasDeLaConexion.length, 1);
});

test("cada tarea que nombra el registro es una del cron diario", () => {
  const claves = TAREAS_DIARIAS.map((t) => t.clave);
  for (const { nombre, tareas } of CONEXIONES) {
    if (tareas === "todas") continue;
    for (const tarea of tareas) assert.ok(claves.includes(tarea), `${nombre}: «${tarea}» no es una tarea del cron`);
  }
});
