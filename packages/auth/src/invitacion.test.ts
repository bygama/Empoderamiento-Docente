import { test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import type { AlmacenDeBloqueos } from "./bloqueo";
import { configDeAuth } from "./config";
import { crearEnlaceDeInvitacion } from "./invitacion";

// El enlace de invitación contra better-auth de verdad, con la config de
// producción (tokens hasheados incluidos): si una versión nueva cambia el
// formato del reset, estos tests son los que se enteran.

const sinBloqueos: AlmacenDeBloqueos = {
  leer: async () => null,
  actualizar: async (_, cambio) => cambio(null),
  borrar: async () => {},
  podar: async () => {},
};

async function armar() {
  const auth = betterAuth({
    ...configDeAuth({
      secreto: "un-secreto-de-prueba-que-no-sirve-para-nada-mas",
      urlDelSitio: "http://localhost",
      mandarResetDeContrasena: async () => {},
      avisarCambioDeContrasena: async () => {},
      mandarCodigo: async () => {},
      segundoPlano: () => {},
      bloqueos: sinBloqueos,
      registrar: async () => {},
    }),
    database: memoryAdapter({ user: [], session: [], account: [], verification: [], twoFactor: [] }),
    logger: { disabled: true },
    rateLimit: { enabled: false },
  });
  const ctx = await auth.$context;
  // Como nace una invitada: sin credencial, sin contraseña.
  const cuenta = await ctx.internalAdapter.createUser({ email: "juan@ed.test", name: "Juan", emailVerified: false }, { method: "admin" });
  const abrir = (enlace: string) => auth.handler(new Request(enlace, { method: "GET" }));
  const elegir = (token: string) =>
    auth.handler(
      new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost" },
        body: JSON.stringify({ token, newPassword: "la-contrasena-que-eligio" }),
      }),
    );
  return { auth, ctx, cuenta, abrir, elegir };
}

test("el enlace lleva a «Elegí tu contraseña» con su token, y resetPassword crea la credencial", async () => {
  const { auth, ctx, cuenta, abrir, elegir } = await armar();
  const { enlace, vence } = await crearEnlaceDeInvitacion(auth, { idDeCuenta: cuenta.id, horas: 72, volverA: "/admin/nueva-contrasena" });
  assert.ok(Math.abs(vence.getTime() - (Date.now() + 72 * 3_600_000)) < 5_000);

  const res = await abrir(enlace);
  assert.equal(res.status, 302);
  const destino = new URL(res.headers.get("location") ?? "", "http://localhost");
  assert.equal(destino.pathname, "/admin/nueva-contrasena");
  const token = destino.searchParams.get("token") ?? "";
  assert.ok(token.length >= 24);

  assert.equal((await elegir(token)).status, 200);
  assert.ok((await ctx.internalAdapter.findCredentialAccount(cuenta.id))?.password);
  // Sirve una sola vez.
  assert.equal((await elegir(token)).status, 400);
});

test("vencido, el enlace no sirve", async () => {
  const { auth, cuenta, abrir, elegir } = await armar();
  const { enlace } = await crearEnlaceDeInvitacion(auth, { idDeCuenta: cuenta.id, horas: -1, volverA: "/admin/nueva-contrasena" });
  const destino = new URL((await abrir(enlace)).headers.get("location") ?? "", "http://localhost");
  assert.equal(destino.searchParams.get("error"), "INVALID_TOKEN");
  const token = new URL(enlace).pathname.split("/").at(-1) ?? "";
  assert.equal((await elegir(token)).status, 400);
});
