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

test("un caso, un aliado y una foto se nombran como en su lista", () => {
  assert.equal(fraseDe({ tipo: "publico-un-caso", quien: "Ana", sobre: "Caso 01" }), "Ana publicó el caso 01");
  assert.equal(fraseDe({ tipo: "autorizo-un-aliado", quien: "Ana", sobre: "UNESCO" }), "Ana autorizó el logo de UNESCO");
  assert.equal(fraseDe({ tipo: "quito-la-autorizacion-de-un-aliado", quien: "Ana", sobre: null }), "Ana le quitó la autorización a un logo de aliado");
  assert.equal(fraseDe({ tipo: "quito-la-autorizacion-de-un-aliado", quien: "Ana", sobre: "UNESCO" }), "Ana le quitó la autorización al logo de UNESCO");
  assert.equal(fraseDe({ tipo: "descarto-cambios-de-un-caso", quien: "Ana", sobre: "Caso 01" }), "Ana descartó los cambios del caso 01");
  assert.equal(fraseDe({ tipo: "descarto-cambios-de-un-caso", quien: "Ana", sobre: null }), "Ana descartó los cambios de un caso");
  assert.equal(fraseDe({ tipo: "reemplazo-una-foto", quien: "Ana", sobre: "Un aula" }), "Ana reemplazó el archivo de la foto «Un aula»");
});

test("cada rol ve la actividad de lo que usa: quien edita, la de Contenido, Contacto, Novedades, la Biblioteca y Métricas, y no la de cuentas ni CV", () => {
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
    "publico-un-caso",
    "descarto-cambios-de-un-caso",
    "autorizo-un-aliado",
    "quito-la-autorizacion-de-un-aliado",
    "publico-un-aliado",
    "despublico-un-aliado",
    "borro-un-aliado",
    "subio-una-foto",
    "reemplazo-una-foto",
    "borro-una-foto",
    "creo-un-enlace",
    "borro-un-enlace",
    "agrego-una-marca",
    "borro-una-marca",
  ]);
});

test("un link y una marca de Métricas se leen por su nombre, entre comillas", () => {
  assert.equal(fraseDe({ tipo: "creo-un-enlace", quien: "Ana", sobre: "Taller en Monterrey" }), "Ana creó el link «Taller en Monterrey»");
  assert.equal(fraseDe({ tipo: "borro-un-enlace", quien: "Ana", sobre: null }), "Ana borró un link");
  assert.equal(fraseDe({ tipo: "agrego-una-marca", quien: "Ana", sobre: "Posteamos en LinkedIn" }), "Ana agregó la marca «Posteamos en LinkedIn»");
  assert.equal(fraseDe({ tipo: "borro-una-marca", quien: "Ana", sobre: null }), "Ana borró una marca");
});

test("lo que se cambia en Ajustes se lee con qué cambió, y solo lo ve quien usa Ajustes", () => {
  assert.equal(fraseDe({ tipo: "agrego-una-redireccion", quien: "Ana", sobre: "/taller → /contacto" }), "Ana agregó la redirección /taller → /contacto");
  assert.equal(fraseDe({ tipo: "cambio-quien-recibe-un-aviso", quien: "Ana", sobre: "CV" }), "Ana cambió quién recibe los avisos de CV");
  assert.equal(fraseDe({ tipo: "cambio-los-plazos-de-guarda", quien: "Ana", sobre: "CV, de 12 meses a 6 meses" }), "Ana cambió los plazos de privacidad: CV, de 12 meses a 6 meses");
  assert.ok(!tiposQueVe("edita").includes("cambio-los-datos-del-sitio"));
  assert.ok(tiposQueVe("dirige").includes("cambio-los-datos-del-sitio"));
});
