import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config as cargarEntorno } from "dotenv";
import type { Tarjeta } from "@/datos/consultas/metricas";
import { SIN_VARIABLES_DE_METRICAS } from "@/lib/metricas/entorno";
import { clicsSegun, cvDeLaSemana, materialesSegun, SIN_SEARCH_CONSOLE, visitantesSegun } from "./lecturas-de-la-semana";

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

// Los cortes de «Esta semana» son los de la pantalla de cada módulo: sin
// base, con el estado y la lectura inyectados. Los CV, contra la base.

const ventana: Tarjeta = { dias: 7, vistas: 3120, visitantes: 1204, variacionVistas: "+8 %", variacionVisitantes: "+12 %" };

test("sin las variables de la analítica, los visitantes dicen lo mismo que Resumen y no muestran la ventana vieja", async () => {
  let leida = false;
  const lectura = await visitantesSegun({ hayVariables: false, hastaDia: "2026-09-25" }, async () => {
    leida = true;
    return ventana;
  });
  assert.deepEqual(lectura, { motivo: SIN_VARIABLES_DE_METRICAS });
  assert.equal(leida, false);
});

test("sin ningún día copiado, los visitantes no tienen datos; con días, el número y su comparación", async () => {
  assert.equal(await visitantesSegun({ hayVariables: true, hastaDia: null }, async () => ventana), null);
  assert.deepEqual(await visitantesSegun({ hayVariables: true, hastaDia: "2026-09-25" }, async () => ventana), { valor: 1204, variacion: "+12 %" });
});

test("sin Search Console conectado, los clics lo dicen; conectado, los 7 días contra los 7 anteriores", async () => {
  const total = async (desde: string) => ({ valor: "", clics: desde === "2026-09-17" ? 84 : 90, impresiones: 0, sumaDePosiciones: 0 });
  assert.deepEqual(await clicsSegun({ conectado: false, hastaDia: "2026-09-23" }, total), { motivo: SIN_SEARCH_CONSOLE });
  assert.deepEqual(await clicsSegun({ conectado: true, hastaDia: "2026-09-23" }, total), { valor: 84, variacion: "−7 %" });
});

test("los CV recibidos cuentan los de la semana contra los de la anterior, y un cero es un cero", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  // En 1990: ningún otro test usa esas fechas.
  const hoy = new Date("1990-01-01T12:00:00.000Z");
  const correo = `prueba-${randomUUID()}@ed.test`;
  const fila = (bandeja: string, recibidoEn: string, estado = "nuevo") => ({ bandeja, nombre: "Prueba", correo, estado, recibidoEn: new Date(recibidoEn) });
  try {
    assert.deepEqual(await cvDeLaSemana(hoy), { valor: 0, variacion: "sin datos previos" });
    await base.mensaje.createMany({
      data: [
        fila("cv", "1989-12-29T10:00:00.000Z"),
        fila("cv", "1989-12-27T10:00:00.000Z", "spam"), // lo que llegó, llegó: también cuenta
        fila("cv", "1989-12-20T10:00:00.000Z"), // la semana anterior
        fila("contacto", "1989-12-30T10:00:00.000Z"), // de Contacto: no cuenta
      ],
    });
    assert.deepEqual(await cvDeLaSemana(hoy), { valor: 2, variacion: "+100 %" });
  } finally {
    await base.mensaje.deleteMany({ where: { correo } });
    await base.$disconnect();
  }
});

test("los materiales consultados son los últimos 7 días hasta hoy contra los 7 anteriores, y un cero es un cero", async () => {
  const pedidos: string[] = [];
  const sumar = async (desde: string, hasta: string) => {
    pedidos.push(`${desde}..${hasta}`);
    return desde === "2026-09-21" ? 4 : 0;
  };
  const leido = await materialesSegun(sumar, new Date("2026-09-27T15:00:00.000Z"));
  assert.deepEqual(leido, { valor: 4, variacion: "sin datos previos" });
  assert.deepEqual(pedidos, ["2026-09-21..2026-09-27", "2026-09-14..2026-09-20"]);
});
