import { test } from "node:test";
import assert from "node:assert/strict";
import { TIPOS_DE_ACTIVIDAD, tiposQueVe } from "@/datos/actividad";
import { fraseDe } from "./frase";

test("cada fila se lee como una frase, con quién y sobre qué", () => {
  assert.equal(fraseDe({ tipo: "invito", quien: "Ana Pérez", sobre: "Juan Pérez" }), "Ana Pérez invitó a Juan Pérez");
  assert.equal(fraseDe({ tipo: "cambio-el-rol", quien: "Ana", sobre: "Juan, de edita a administra" }), "Ana cambió el rol de Juan, de edita a administra");
  assert.equal(fraseDe({ tipo: "entro", quien: "Ana", sobre: null }), "Ana entró");
  assert.equal(fraseDe({ tipo: "oculto-un-material", quien: "Ana", sobre: "Un libro" }), "Ana ocultó el material «Un libro»");
  for (const tipo of TIPOS_DE_ACTIVIDAD) assert.match(fraseDe({ tipo, quien: "Ana", sobre: "Juan" }), /^Ana \S/, tipo);
});

test("cada rol ve la actividad de lo que usa: quien edita, la de páginas, Contacto, Novedades y la Biblioteca, y no la de cuentas ni CV", () => {
  assert.deepEqual(tiposQueVe("administra"), [...TIPOS_DE_ACTIVIDAD]);
  assert.deepEqual(tiposQueVe("edita"), [
    "publico-una-pagina",
    "descarto-un-borrador",
    "restauro-una-version",
    "tomo-un-mensaje",
    "cerro-un-mensaje",
    "marco-un-mensaje-como-spam",
    "borro-un-mensaje",
    "publico-una-novedad",
    "despublico-una-novedad",
    "descarto-cambios-de-una-novedad",
    "borro-una-novedad",
    "agrego-un-material",
    "publico-un-material",
    "oculto-un-material",
    "descarto-cambios-de-un-material",
    "borro-un-material",
  ]);
});

test("lo que se cambia en Ajustes se lee con qué cambió, y solo lo ve quien usa Ajustes", () => {
  assert.equal(fraseDe({ tipo: "agrego-una-redireccion", quien: "Ana", sobre: "/taller → /contacto" }), "Ana agregó la redirección /taller → /contacto");
  assert.equal(fraseDe({ tipo: "cambio-quien-recibe-un-aviso", quien: "Ana", sobre: "CV" }), "Ana cambió quién recibe los avisos de CV");
  assert.equal(fraseDe({ tipo: "cambio-los-plazos-de-guarda", quien: "Ana", sobre: "CV, de 12 meses a 6 meses" }), "Ana cambió los plazos de privacidad: CV, de 12 meses a 6 meses");
  assert.ok(!tiposQueVe("edita").includes("cambio-los-datos-del-sitio"));
  assert.ok(tiposQueVe("dirige").includes("cambio-los-datos-del-sitio"));
});
