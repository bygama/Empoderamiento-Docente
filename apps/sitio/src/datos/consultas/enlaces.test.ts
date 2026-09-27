import { test } from "node:test";
import assert from "node:assert/strict";
import { PLAN_DE_VERCEL } from "@/config/metricas";
import { sinVisitasPorque } from "./enlaces";

test("en el plan de hoy, sin UTM, Links dice una vez por qué no hay visitas, aunque estén las variables de Vercel", () => {
  // Si ED cambia de plan, se prende PLAN_DE_VERCEL.utm y este test se reescribe con él.
  assert.equal(PLAN_DE_VERCEL.utm, false);
  process.env.VERCEL_TOKEN = "de-prueba";
  process.env.VERCEL_ANALYTICS_PROJECT_ID = "de-prueba";
  assert.equal(sinVisitasPorque(), "Vercel no da de dónde vienen las visitas en el plan gratuito: acá se ven los clics y los CV.");
});
