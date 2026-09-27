import { test } from "node:test";
import assert from "node:assert/strict";
import { marcasDeLaActividad } from "./marcas";

test("publicar lo mismo varias veces el mismo día es una sola marca, con su texto", () => {
  const marcas = marcasDeLaActividad([
    { tipo: "publico-una-pagina", sobre: "Inicio", sobreId: "inicio", en: new Date("2026-09-20T10:00:00.000Z") },
    { tipo: "publico-una-pagina", sobre: "Inicio", sobreId: "inicio", en: new Date("2026-09-20T18:00:00.000Z") },
    { tipo: "publico-una-pagina", sobre: "Inicio", sobreId: "inicio", en: new Date("2026-09-21T09:00:00.000Z") },
    { tipo: "publico-una-novedad", sobre: "Taller en Monterrey", sobreId: "n1", en: new Date("2026-09-20T12:00:00.000Z") },
  ]);
  assert.deepEqual(
    marcas.map((m) => [m.dia, m.texto, m.aMano]),
    [
      ["2026-09-20", "Se publicó Inicio", null],
      ["2026-09-21", "Se publicó Inicio", null],
      ["2026-09-20", "Se publicó la novedad «Taller en Monterrey»", null],
    ],
  );
});

test("sin nombre, se dice qué fue", () => {
  const [marca] = marcasDeLaActividad([{ tipo: "publico-una-novedad", sobre: null, sobreId: null, en: new Date("2026-09-20T12:00:00.000Z") }]);
  assert.equal(marca.texto, "Se publicó una novedad");
});
