import { test } from "node:test";
import assert from "node:assert/strict";
import { SIN_VARIABLES_DE_METRICAS } from "@/lib/metricas/entorno";
import { sinVisitasPorque } from "./enlaces";

test("con Vercel en su plan gratuito, sin UTM, Links dice una vez por qué no hay visitas, aunque estén sus variables", () => {
  const vercel = { VERCEL: "1", VERCEL_TOKEN: "de-prueba", VERCEL_ANALYTICS_PROJECT_ID: "de-prueba" };
  assert.equal(sinVisitasPorque(vercel), "Vercel no da de dónde vienen las visitas en el plan gratuito: acá se ven los clics y los CV.");
});

test("con Umami las visitas por link se cuentan; sin sus variables, se dice qué falta", () => {
  assert.equal(sinVisitasPorque({ UMAMI_API_URL: "http://analitica:3000", UMAMI_API_KEY: "k", UMAMI_WEBSITE_ID: "s" }), null);
  assert.equal(sinVisitasPorque({}), `${SIN_VARIABLES_DE_METRICAS}: por ahora, acá se ven los clics y los CV.`);
});
