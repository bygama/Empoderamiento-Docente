import { test } from "node:test";
import assert from "node:assert/strict";
import { SIN_CONEXION } from "@/lib/busquedas/entorno";
import { avisoDeCorrida } from "./aviso";

const fallo = (detalle: string) => ({ corridaEn: new Date("2026-09-26T04:00:00.000Z"), ok: false, detalle });

test("recién conectado, la corrida que falló por falta de variables se lee como una confirmación", () => {
  assert.deepEqual(avisoDeCorrida({ conectado: true, hastaDia: null, ultima: fallo(SIN_CONEXION) }), {
    tono: "bien",
    texto: "Search Console quedó conectado: la primera copia llega esta noche, o antes con «Actualizar ahora».",
  });
  assert.match(avisoDeCorrida({ conectado: true, hastaDia: "2026-09-20", ultima: fallo(SIN_CONEXION) })!.texto, /la próxima copia/);
});

test("cualquier otro fallo, conectado, sigue siendo un error", () => {
  assert.deepEqual(avisoDeCorrida({ conectado: true, hastaDia: null, ultima: fallo("Google respondió 403.") }), {
    tono: "error",
    texto: "La última actualización falló: Google respondió 403.",
  });
});

test("sin conexión, o con la última corrida bien, no hay aviso", () => {
  assert.equal(avisoDeCorrida({ conectado: false, hastaDia: null, ultima: fallo(SIN_CONEXION) }), null);
  assert.equal(avisoDeCorrida({ conectado: true, hastaDia: null, ultima: null }), null);
  assert.equal(avisoDeCorrida({ conectado: true, hastaDia: null, ultima: { ...fallo("x"), ok: true } }), null);
});
