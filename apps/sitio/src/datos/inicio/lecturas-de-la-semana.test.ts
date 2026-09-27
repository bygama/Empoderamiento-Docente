import { test } from "node:test";
import assert from "node:assert/strict";
import type { Tarjeta } from "@/datos/consultas/metricas";
import { SIN_VARIABLES_DE_METRICAS } from "@/lib/metricas/entorno";
import { clicsSegun, SIN_SEARCH_CONSOLE, visitantesSegun } from "./lecturas-de-la-semana";

// Los cortes de «Esta semana» son los de la pantalla de cada módulo: sin
// base, con el estado y la lectura inyectados.

const ventana: Tarjeta = { dias: 7, vistas: 3120, visitantes: 1204, variacionVistas: "+8 %", variacionVisitantes: "+12 %" };

test("sin las variables de Vercel, los visitantes dicen lo mismo que Resumen y no muestran la ventana vieja", async () => {
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
