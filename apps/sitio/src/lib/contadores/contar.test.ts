import { test } from "node:test";
import assert from "node:assert/strict";
import { cuerpoDelEvento } from "./contar";

const SITIO = "https://empoderamientodocente.com";

test("manda el host de otro sitio, nunca la dirección entera", () => {
  assert.deepEqual(cuerpoDelEvento("cv-vio", { href: `${SITIO}/sumate-al-equipo`, referrer: "https://www.linkedin.com/feed/update/123" }), {
    evento: "cv-vio",
    referido: "www.linkedin.com",
  });
});

test("el propio sitio y un referido vacío o raro no mandan nada", () => {
  assert.deepEqual(cuerpoDelEvento("cv-vio", { href: `${SITIO}/sumate-al-equipo`, referrer: `${SITIO}/que-hacemos` }), { evento: "cv-vio" });
  assert.deepEqual(cuerpoDelEvento("cv-vio", { href: `${SITIO}/sumate-al-equipo`, referrer: "" }), { evento: "cv-vio" });
  assert.deepEqual(cuerpoDelEvento("cv-vio", { href: `${SITIO}/sumate-al-equipo`, referrer: "no es una url" }), { evento: "cv-vio" });
});

test("el código del link va solo si la URL lo trae como link", () => {
  const conLink = `${SITIO}/sumate-al-equipo?utm_source=whatsapp&utm_medium=link&utm_campaign=convocatoria`;
  assert.deepEqual(cuerpoDelEvento("cv-envio", { href: conLink, referrer: "" }), { evento: "cv-envio", enlace: "convocatoria" });
  const otraCampana = `${SITIO}/sumate-al-equipo?utm_medium=email&utm_campaign=boletin`;
  assert.deepEqual(cuerpoDelEvento("cv-envio", { href: otraCampana, referrer: "" }), { evento: "cv-envio" });
});

test("una app de Android manda su paquete, y la clave va si la hay", () => {
  assert.deepEqual(cuerpoDelEvento("material-consultado", { href: `${SITIO}/biblioteca`, referrer: "android-app://com.linkedin.android/" }, "m1"), {
    evento: "material-consultado",
    clave: "m1",
    referido: "com.linkedin.android",
  });
});
