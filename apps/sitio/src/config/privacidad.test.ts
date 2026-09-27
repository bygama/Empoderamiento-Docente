import { test } from "node:test";
import assert from "node:assert/strict";
import { aLos, enPalabras, esquemaDePlazos, plazoPara, seBorraEl, vencidos, type PlazosDeGuarda, type Tramo } from "./privacidad";

// La política de los plazos, sin base: cómo se cuentan, con historial
// (ADR-0014). Rige el menor entre el plazo de cuando llegó y cualquiera
// posterior: alargar no toca lo ya recibido, acortar vale para todo. Vencido
// es que su fecha de borrado ya pasó: la tarea borra con `lt`, al instante.

const LLEGO = new Date("2026-09-21T14:05:00.000Z");
const SIEMPRE = new Date(0);
const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const DE_ANTES: PlazosDeGuarda = { cv: [{ desde: SIEMPRE, valor: 12 }], contacto: [{ desde: SIEMPRE, valor: 24 }], spam: 30 };

test("sin cambios, Contacto se borra a los 24 meses de llegar y un CV a los 12", () => {
  const base = { estado: "nuevo" as const, recibidoEn: LLEGO, estadoEn: LLEGO };
  assert.equal(seBorraEl({ ...base, bandeja: "contacto" }, DE_ANTES).toISOString(), "2028-09-21T14:05:00.000Z");
  assert.equal(seBorraEl({ ...base, bandeja: "cv" }, DE_ANTES).toISOString(), "2027-09-21T14:05:00.000Z");
});

test("el spam se borra a los 30 días de marcado, salvo que su plazo llegue antes", () => {
  const marcado = d("2026-10-01");
  assert.equal(seBorraEl({ bandeja: "contacto", estado: "spam", recibidoEn: LLEGO, estadoEn: marcado }, DE_ANTES).toISOString(), "2026-10-31T00:00:00.000Z");
  const tarde = d("2027-09-10");
  assert.equal(seBorraEl({ bandeja: "cv", estado: "spam", recibidoEn: LLEGO, estadoEn: tarde }, DE_ANTES).toISOString(), "2027-09-21T14:05:00.000Z");
});

test("alargar vale para lo que llega desde ahora, no para lo ya recibido", () => {
  const alargado: Tramo[] = [
    { desde: SIEMPRE, valor: 12 },
    { desde: d("2026-06-01"), valor: 18 },
  ];
  assert.equal(plazoPara(alargado, d("2026-01-15")), 12);
  assert.equal(plazoPara(alargado, d("2026-06-01")), 18);
  assert.equal(plazoPara(alargado, d("2026-07-15")), 18);
});

test("acortar vale para todo, y lo alargado en el medio no suma", () => {
  const vueltas: Tramo[] = [
    { desde: SIEMPRE, valor: 12 },
    { desde: d("2026-03-01"), valor: 18 },
    { desde: d("2026-06-01"), valor: 6 },
  ];
  assert.equal(plazoPara(vueltas, d("2026-01-15")), 6);
  assert.equal(plazoPara(vueltas, d("2026-04-15")), 6);
  assert.equal(plazoPara(vueltas, d("2026-07-15")), 6);
});

test("lo vencido de la consulta es lo mismo que dice cada ficha", () => {
  const tramos: Tramo[] = [
    { desde: SIEMPRE, valor: 12 },
    { desde: d("2025-06-01"), valor: 24 },
    { desde: d("2026-02-01"), valor: 9 },
  ];
  const plazos: PlazosDeGuarda = { ...DE_ANTES, cv: tramos };
  const hoy = d("2026-09-26");
  const rangos = vencidos(tramos, hoy);
  for (let t = d("2024-01-01").getTime(); t < hoy.getTime(); t += 5 * 86_400_000) {
    const llegada = new Date(t);
    const segunLaFicha = seBorraEl({ bandeja: "cv", estado: "nuevo", recibidoEn: llegada, estadoEn: llegada }, plazos) < hoy;
    const segunLaConsulta = rangos.some(({ desde, antesDe }) => llegada >= desde && llegada < antesDe);
    assert.equal(segunLaConsulta, segunLaFicha, llegada.toISOString());
  }
});

test("los topes: enteros, de 1 al máximo de cada uno", () => {
  assert.ok(esquemaDePlazos.safeParse({ cv: 24, contacto: 36, spam: 90 }).success);
  for (const fuera of [{ cv: 0 }, { cv: 25 }, { contacto: 37 }, { spam: 91 }, { spam: 1.5 }]) {
    assert.equal(esquemaDePlazos.safeParse({ cv: 12, contacto: 24, spam: 30, ...fuera }).success, false, JSON.stringify(fuera));
  }
  const error = esquemaDePlazos.safeParse({ cv: 25, contacto: 24, spam: 30 });
  assert.equal(error.success ? null : error.error.issues[0]?.message, "«CV» va de 1 a 24 meses, en números enteros.");
});

test("cómo se dice un plazo", () => {
  assert.equal(enPalabras("cv", 12), "12 meses");
  assert.equal(enPalabras("cv", 1), "1 mes");
  assert.equal(enPalabras("spam", 1), "1 día");
  assert.equal(aLos("contacto", 24), "a los 24 meses");
  assert.equal(aLos("contacto", 1), "al mes");
  assert.equal(aLos("spam", 1), "al día");
});
