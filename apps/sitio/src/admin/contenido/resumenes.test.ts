import { test } from "node:test";
import assert from "node:assert/strict";
import { resumenDeAliados, resumenDeCasos, resumenDeEquipo, resumenDeFotos } from "./resumenes";

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

test("equipo: la cuenta y los que tienen cambios sin publicar, con el singular", () => {
  assert.equal(resumenDeEquipo([caso("2026-09-27T10:00:00.000Z"), caso(null)]), "2 perfiles · 1 con cambios sin publicar");
  assert.equal(resumenDeEquipo([caso(null)]), "1 perfil");
});
