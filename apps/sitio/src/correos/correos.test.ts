import { test } from "node:test";
import assert from "node:assert/strict";
import { elegiTuContrasena } from "./elegi-tu-contrasena";
import { mandarCorreo } from "./mandar";
import { tuCodigo } from "./tu-codigo";
import { tuContrasenaCambio } from "./tu-contrasena-cambio";

const ENLACE = "https://ed.test/api/auth/reset-password/token-secreto?callbackURL=%2Fadmin%2Fnueva-contrasena";
const PARA = "ana@ed.test";

test("«Elegí tu contraseña» lleva el enlace, cuánto dura, y escapa lo que llega de afuera", () => {
  const correo = elegiTuContrasena({ nombre: "Ana <script>", enlace: ENLACE, minutosDeVigencia: 60 });
  assert.equal(correo.asunto, "Elegí tu contraseña");
  assert.ok(correo.texto.includes(ENLACE));
  assert.match(correo.texto, /vence en 1 hora/);
  assert.ok(!correo.html.includes("<script>"));
  assert.ok(correo.html.includes("Ana &#60;script&#62;"));
  assert.ok(correo.html.includes(`href="${ENLACE.replace(/&/g, "&#38;")}"`));
  assert.match(elegiTuContrasena({ enlace: ENLACE, minutosDeVigencia: 72 * 60 }).texto, /^Hola:[\s\S]*vence en 72 horas/);
});

test("«Tu contraseña cambió» dice cuándo, en hora universal, y qué hacer si no fue la persona, sin botón", () => {
  const cuando = new Date("2026-09-26T20:15:42.000Z");
  const correo = tuContrasenaCambio({ nombre: "Ana", cuando, olvideMiContrasena: "https://ed.test/admin/olvide-mi-contrasena" });
  assert.equal(correo.asunto, "Tu contraseña cambió");
  assert.match(correo.texto, /^Hola, Ana:/);
  assert.match(correo.texto, /cambió el 26 de septiembre de 2026 a las 20:15, hora universal./);
  assert.ok(correo.html.includes("a las 20:15, hora universal."));
  assert.match(correo.texto, /Si no fuiste vos, elegí otra ya mismo desde https:\/\/ed\.test\/admin\/olvide-mi-contrasena/);
  assert.ok(!correo.html.includes("<a "));
});

test("en producción sin clave el correo no sale y el log no lleva ni el enlace ni el destinatario", async (t) => {
  const error = t.mock.method(console, "error", () => {});
  const info = t.mock.method(console, "info", () => {});
  const contenido = elegiTuContrasena({ enlace: ENLACE, minutosDeVigencia: 60 });
  assert.equal(await mandarCorreo({ para: PARA, contenido }, { entorno: { NODE_ENV: "production" } }), "no-salio");
  assert.equal(info.mock.callCount(), 0);
  assert.equal(error.mock.callCount(), 1);
  const logueado = error.mock.calls.flatMap((c) => c.arguments).join(" ");
  assert.ok(!logueado.includes("token-secreto"), logueado);
  assert.ok(!logueado.includes(PARA), logueado);
});

test("en local sin clave el correo sale entero por la consola", async (t) => {
  const info = t.mock.method(console, "info", () => {});
  const salida = await mandarCorreo({ para: PARA, contenido: elegiTuContrasena({ enlace: ENLACE, minutosDeVigencia: 60 }) }, { entorno: { NODE_ENV: "development" } });
  assert.equal(salida, "consola");
  assert.equal(info.mock.callCount(), 1);
  assert.ok(String(info.mock.calls[0].arguments[0]).includes(ENLACE));
});

test("con clave sale por Resend desde CORREO_REMITENTE, y sin remitente no sale", async () => {
  const pedidos: RequestInit[] = [];
  const fetchImpl = (async (_: string, init: RequestInit) => {
    pedidos.push(init);
    return Response.json({ id: "x" });
  }) as unknown as typeof fetch;
  const contenido = elegiTuContrasena({ enlace: ENLACE, minutosDeVigencia: 60 });
  const entorno = { NODE_ENV: "production", RESEND_API_KEY: "re_x", CORREO_REMITENTE: "ED <no-responder@ed.test>" } as const;

  assert.equal(await mandarCorreo({ para: PARA, contenido }, { entorno, fetchImpl }), "resend");
  assert.equal(pedidos.length, 1);
  assert.equal(JSON.parse(String(pedidos[0].body)).from, "ED <no-responder@ed.test>");

  await assert.rejects(mandarCorreo({ para: PARA, contenido }, { entorno: { ...entorno, CORREO_REMITENTE: "" }, fetchImpl }), /CORREO_REMITENTE/);
  assert.equal(pedidos.length, 1);
});

test("«Tu código para entrar» lleva el código a la vista, cuánto dura y qué hacer si no fue la persona", () => {
  const correo = tuCodigo({ nombre: "Ana", codigo: "048213", minutosDeVigencia: 10, olvideMiContrasena: "https://ed.test/admin/olvide-mi-contrasena" });
  assert.equal(correo.asunto, "Tu código para entrar");
  assert.ok(correo.texto.includes("\n\n048213\n\n"), "el código va solo, en su párrafo");
  assert.ok(correo.html.includes(">048213</p>"));
  assert.match(correo.texto, /Vence en 10 minutos y sirve una sola vez\./);
  assert.ok(correo.texto.includes("alguien tiene tu contraseña: elegí otra ya mismo desde https://ed.test/admin/olvide-mi-contrasena"));
});
