import { test } from "node:test";
import assert from "node:assert/strict";
import { puede } from "@ed/auth";
import type { NumeroDelResumen } from "@/correos/resumen-semanal";
import { enLaZona, mandarResumenSemanal } from "./resumen-semanal";

// El lunes 28 de septiembre de 2026 a las 4 UTC (la hora del cron) es lunes en Chile.
const LUNES = new Date("2026-09-28T04:00:00.000Z");
const PERSONAS = [
  { id: "a", nombre: "Ana", correo: "ana@ed.test", rol: "administra" },
  { id: "e", nombre: "Eva", correo: "eva@ed.test", rol: "edita" },
];

/** Los números como los arma el de verdad: los CV, solo para quien los ve. */
const numeros = async (rol: unknown): Promise<NumeroDelResumen[]> => [
  { etiqueta: "Visitantes", valor: 412, variacion: "+12 %" },
  ...(puede(rol, "verCV") ? [{ etiqueta: "CV recibidos", valor: 3, variacion: "igual" }] : []),
];

type Mandado = { para: string; texto: string; idempotencia?: string };

async function correr(hoy: Date, falla?: string): Promise<{ detalle: string; ok: boolean; mandados: Mandado[] }> {
  const mandados: Mandado[] = [];
  const r = await mandarResumenSemanal({
    hoy,
    faltan: async () => 0,
    destinatarios: async () => PERSONAS,
    numeros,
    pagina: async () => ({ nombre: "Inicio", vistas: 520 }),
    mandar: async ({ para, contenido, idempotencia }) => {
      if (para === falla) throw new Error("Resend no contestó");
      mandados.push({ para, texto: contenido.texto, idempotencia });
      return "consola";
    },
  });
  return { ...r, mandados };
}

test("el día es el de Chile: el cron de las 4 UTC del lunes cae el lunes", () => {
  assert.deepEqual(enLaZona(LUNES), { dia: "2026-09-28", lunes: true });
  assert.deepEqual(enLaZona(new Date("2026-09-28T02:00:00.000Z")), { dia: "2026-09-27", lunes: false });
});

test("los otros días no manda nada, y lo dice", async () => {
  const r = await correr(new Date("2026-09-29T04:00:00.000Z"));
  assert.equal(r.detalle, "Hoy no es lunes: el resumen sale los lunes.");
  assert.deepEqual(r.mandados, []);
});

test("sin un mes de datos no manda, y dice cuánto falta", async () => {
  const r = await mandarResumenSemanal({ hoy: LUNES, faltan: async () => 16, destinatarios: async () => PERSONAS });
  assert.deepEqual(r, { ok: true, detalle: "Todavía no hay un mes de datos (faltan 16 días): no se mandó." });
});

test("el lunes sale uno por persona, con los números de su rol y una clave por persona y lunes", async () => {
  const r = await correr(LUNES);
  assert.deepEqual(r, { ok: true, detalle: "Salió a 2 de 2 personas.", mandados: r.mandados });
  const [ana, eva] = r.mandados;
  assert.equal(ana.idempotencia, "resumen-semanal:2026-09-28:a");
  assert.equal(eva.idempotencia, "resumen-semanal:2026-09-28:e");
  assert.match(ana.texto, /semana del 21 al 27 de septiembre/);
  assert.match(ana.texto, /Visitantes: 412 \(\+12 % contra la semana anterior\)/);
  assert.match(ana.texto, /CV recibidos: 3 \(igual que la semana anterior\)/);
  assert.match(ana.texto, /La página más vista fue Inicio, con 520 vistas/);
  assert.doesNotMatch(eva.texto, /CV/);
});

test("un correo que no sale no frena a los demás, y la corrida queda fallida", async () => {
  const r = await correr(LUNES, "ana@ed.test");
  assert.equal(r.ok, false);
  assert.equal(r.detalle, "Salió a 1 de 2 personas.");
  assert.deepEqual(
    r.mandados.map((m) => m.para),
    ["eva@ed.test"],
  );
});
