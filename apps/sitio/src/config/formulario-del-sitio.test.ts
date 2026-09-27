import { test } from "node:test";
import assert from "node:assert/strict";
import { DATOS_INICIALES, esquemaDeDatosDelSitio } from "./datos-del-sitio";
import { aValores, campoDe, desdeValores } from "./formulario-del-sitio";

// El formulario de Datos del sitio: ida y vuelta entre lo escrito y lo que
// valida el esquema, y cada problema en su campo.

test("los datos pasan a texto y vuelven iguales", () => {
  const valores = aValores(DATOS_INICIALES);
  assert.equal(valores.paises, "Chile, México, Argentina, Colombia, Brasil");
  assert.equal(valores.linkedin, "");
  assert.deepEqual(esquemaDeDatosDelSitio.parse(desdeValores(valores)), DATOS_INICIALES);
});

test("los países se separan por coma y se saltean los vacíos", () => {
  const datos = desdeValores({ ...aValores(DATOS_INICIALES), paises: " Chile,, Perú ,  " }) as { paises: string[] };
  assert.deepEqual(datos.paises, ["Chile", "Perú"]);
});

test("cada problema del esquema cae en su campo", () => {
  assert.equal(campoDe(["correo"]), "correo");
  assert.equal(campoDe(["direccion", "calle"]), "calle");
  assert.equal(campoDe(["redes", "linkedin"]), "linkedin");
  assert.equal(campoDe(["paises", 3]), "paises");
});
