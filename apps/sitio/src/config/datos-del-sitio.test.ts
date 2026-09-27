import { test } from "node:test";
import assert from "node:assert/strict";
import { DATOS_INICIALES, esquemaDeDatosDelSitio } from "./datos-del-sitio";

// El esquema de Ajustes › Datos del sitio: lo que se guarda y lo que el sitio
// acepta al leer. Cada test cambia un campo de los datos iniciales.

const con = (cambio: Record<string, unknown>) => esquemaDeDatosDelSitio.safeParse({ ...DATOS_INICIALES, ...cambio });
const primerError = (resultado: ReturnType<typeof con>) => (resultado.success ? null : resultado.error.issues[0]?.message);

test("los datos iniciales pasan el esquema tal cual", () => {
  assert.deepEqual(esquemaDeDatosDelSitio.parse(DATOS_INICIALES), DATOS_INICIALES);
});

test("el WhatsApp se guarda solo con dígitos, y uno corto no pasa", () => {
  assert.equal(esquemaDeDatosDelSitio.parse({ ...DATOS_INICIALES, whatsapp: "+56 9 (1234) 56-78" }).whatsapp, "56912345678");
  assert.equal(esquemaDeDatosDelSitio.parse({ ...DATOS_INICIALES, whatsapp: "  " }).whatsapp, null);
  assert.match(primerError(con({ whatsapp: "1234" })) ?? "", /código de país/);
});

test("lo opcional vacío queda null", () => {
  const datos = esquemaDeDatosDelSitio.parse({ ...DATOS_INICIALES, direccion: { ...DATOS_INICIALES.direccion, complemento: " ", region: "" } });
  assert.equal(datos.direccion.complemento, null);
  assert.equal(datos.direccion.region, null);
});

test("cada red acepta solo una URL https de su dominio", () => {
  const redes = (cambio: Record<string, unknown>) => con({ redes: { ...DATOS_INICIALES.redes, ...cambio } });
  assert.ok(redes({ linkedin: "https://www.linkedin.com/company/ed/" }).success);
  assert.match(primerError(redes({ instagram: "https://www.facebook.com/ed" })) ?? "", /instagram\.com/);
  assert.match(primerError(redes({ facebook: "http://www.facebook.com/ed" })) ?? "", /https:\/\//);
  assert.match(primerError(redes({ linkedin: "https://linkedin.com.ejemplo.org/ed" })) ?? "", /linkedin\.com/);
});

test("los países: al menos uno, hasta diez y sin repetir", () => {
  assert.match(primerError(con({ paises: [] })) ?? "", /al menos un país/);
  assert.match(primerError(con({ paises: ["Chile", "chile"] })) ?? "", /repetido/);
  assert.match(primerError(con({ paises: Array.from({ length: 11 }, (_, i) => `País ${i}`) })) ?? "", /hasta 10/);
});

test("un correo que no es un correo no pasa, y lo obligatorio vacío tampoco", () => {
  assert.match(primerError(con({ correo: "contacto@" })) ?? "", /no parece un correo/);
  assert.match(primerError(con({ direccion: { ...DATOS_INICIALES.direccion, ciudad: " " } })) ?? "", /Completá «Ciudad»/);
});
