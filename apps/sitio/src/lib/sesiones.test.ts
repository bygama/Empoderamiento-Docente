import { test } from "node:test";
import assert from "node:assert/strict";
import { dispositivoDe, lugarDe } from "./sesiones";

// User agents reales, copiados de los navegadores de hoy.
const UA = {
  chromeWindows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  edgeWindows: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0",
  safariIphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
  chromeIphone: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.0.0 Mobile/15E148 Safari/604.1",
  firefoxMac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 15.6; rv:143.0) Gecko/20100101 Firefox/143.0",
  chromeAndroid: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
  safariMac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15",
};

test("dice el navegador y el sistema de los de todos los días", () => {
  assert.equal(dispositivoDe(UA.chromeWindows), "Chrome en Windows");
  assert.equal(dispositivoDe(UA.edgeWindows), "Edge en Windows");
  assert.equal(dispositivoDe(UA.safariIphone), "Safari en iPhone");
  assert.equal(dispositivoDe(UA.chromeIphone), "Chrome en iPhone");
  assert.equal(dispositivoDe(UA.firefoxMac), "Firefox en Mac");
  assert.equal(dispositivoDe(UA.chromeAndroid), "Chrome en Android");
  assert.equal(dispositivoDe(UA.safariMac), "Safari en Mac");
});

test("con lo que sepa, o que no sabe", () => {
  assert.equal(dispositivoDe("curl/8.9.1"), "Dispositivo desconocido");
  assert.equal(dispositivoDe(null), "Dispositivo desconocido");
  assert.equal(dispositivoDe("Algo raro (Linux x86_64)"), "Un navegador en Linux");
});

test("el lugar, con el nombre del país en castellano", () => {
  assert.equal(lugarDe({ ciudad: "Córdoba", pais: "AR" }), "Córdoba, Argentina");
  assert.equal(lugarDe({ ciudad: null, pais: "MX" }), "México");
  assert.equal(lugarDe({ ciudad: "Santiago", pais: null }), "Santiago");
  assert.equal(lugarDe({ ciudad: null, pais: null }), "Ubicación desconocida");
});
