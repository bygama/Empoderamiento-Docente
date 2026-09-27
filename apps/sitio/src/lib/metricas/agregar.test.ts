import { test } from "node:test";
import assert from "node:assert/strict";
import { curvaDe, parte, sumarPorValor, visitasPorCanal } from "./agregar";

const fila = (valor: string, visitantes: number, agrupado = false) => ({ valor, agrupado, vistas: visitantes * 2, visitantes });

test("sumar por valor junta los días y deja «el resto» aparte", () => {
  const { valores, resto } = sumarPorValor([fila("/a", 3), fila("/b", 5), fila("/a", 4), fila("", 9, true)], "visitantes");
  assert.deepEqual(valores, [
    { valor: "/a", total: 7 },
    { valor: "/b", total: 5 },
  ]);
  assert.equal(resto, 9);
});

test("los canales salen los cinco, en su orden, sin el propio sitio y con el resto en Otros sitios", () => {
  const canales = visitasPorCanal(
    [fila("www.google.com", 10), fila("", 4), fila("l.facebook.com", 2), fila("relime.org", 1), fila("", 3, true), fila("ed.org", 50)],
    "ed.org",
  );
  assert.deepEqual(canales, [
    { canal: "buscador", visitas: 10 },
    { canal: "redes", visitas: 2 },
    { canal: "asistentes-ia", visitas: 0 },
    { canal: "directo", visitas: 4 },
    { canal: "otros-sitios", visitas: 4 },
  ]);
});

test("la parte es un entero, y sin total es cero", () => {
  assert.equal(parte(1, 3), 33);
  assert.equal(parte(0, 0), 0);
});

test("la curva: cero donde la API no trajo el día, nada antes de la primera copia", () => {
  const curva = curvaDe(new Map([["2026-09-03", 5]]), { desde: "2026-09-01", hasta: "2026-09-04", primero: "2026-09-02" });
  assert.deepEqual(curva, [
    { dia: "2026-09-01", valor: null },
    { dia: "2026-09-02", valor: 0 },
    { dia: "2026-09-03", valor: 5 },
    { dia: "2026-09-04", valor: 0 },
  ]);
});
