import { test } from "node:test";
import assert from "node:assert/strict";
import { cifrasMasLargasQueElPlan } from "./cifras-del-periodo";

const sumarVistas = async (desde: string) => (desde === "2026-06-30" ? 900 : 600);
// Solo una fuente con ventana (Vercel Hobby) llega acá: Umami no tiene.
const plan = { nombre: "Vercel", dias: 30 };

test("a 90 días, las vistas se suman día por día y se comparan con el anterior entero; los visitantes dicen por qué no hay", async () => {
  const c = await cifrasMasLargasQueElPlan({ periodo: 90, desde: "2026-06-30", hasta: "2026-09-27", desdeLaCopia: "2026-01-01", sumarVistas, plan });
  assert.deepEqual(c.vistas, { valor: 900, variacion: "+50 %" });
  assert.equal(c.visitantes.valor, null);
  assert.match(c.visitantes.nota ?? "", /^No se puede medir: Vercel da personas distintas de hasta 30 días/);
});

test("sin el período anterior entero en la copia, «sin datos previos»; sin el período entero, ni el número", async () => {
  const parcial = await cifrasMasLargasQueElPlan({ periodo: 90, desde: "2026-06-30", hasta: "2026-09-27", desdeLaCopia: "2026-05-01", sumarVistas, plan });
  assert.deepEqual(parcial.vistas, { valor: 900, variacion: "sin datos previos" });
  const corta = await cifrasMasLargasQueElPlan({ periodo: 90, desde: "2026-06-30", hasta: "2026-09-27", desdeLaCopia: "2026-08-01", sumarVistas, plan });
  assert.deepEqual(corta.vistas, { valor: null, nota: "La copia todavía no tiene los 90 días enteros" });
});
