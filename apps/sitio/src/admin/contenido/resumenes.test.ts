import { test } from "node:test";
import assert from "node:assert/strict";
import { guiaDeContenido } from "@/admin/por-hacer/guias-de-contenido";
import { resumenDeAliados, resumenDeCasos, resumenDeFotos } from "./resumenes";

const caso = (borradorEn: string | null) => ({ estado: { borradorEn } });

test("casos: la cuenta y los que tienen cambios sin publicar", () => {
  assert.equal(resumenDeCasos([caso("2026-09-27T10:00:00.000Z"), caso(null), caso(null), caso(null)]), "4 casos · 1 con cambios sin publicar");
  assert.equal(resumenDeCasos([caso(null), caso(null), caso(null), caso(null)]), "4 casos");
});

test("aliados: la cuenta y los sin autorizar, con el singular", () => {
  const autorizado = { autorizado: true };
  assert.equal(resumenDeAliados([autorizado, autorizado, autorizado, autorizado, { autorizado: false }]), "5 aliados · 1 sin autorizar");
  assert.equal(resumenDeAliados([autorizado]), "1 aliado");
});

test("fotos: la cuenta y las sin texto alternativo", () => {
  assert.equal(resumenDeFotos({ total: 47, sinAlt: 2 }), "47 fotos · 2 sin texto alternativo");
  assert.equal(resumenDeFotos({ total: 1, sinAlt: 0 }), "1 foto");
});

test("las guías de Contenido: solo queda la de Equipo", () => {
  assert.equal(guiaDeContenido("equipo")?.nombre, "Equipo");
  for (const hecha of ["paginas", "casos", "aliados", "fotos", "otra"]) assert.equal(guiaDeContenido(hecha), undefined, hecha);
});
