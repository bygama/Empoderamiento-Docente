import { test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import type { AlmacenDeBloqueos } from "./bloqueo";
import { configDeAuth } from "./config";

// De dónde sale la IP del rate limit por IP, con la config de producción y
// su tabla `rateLimit` en memoria: solo de x-real-ip, que el proxy de delante
// pisa siempre (el borde de Vercel, Caddy en el VPS). x-forwarded-for no la
// elige, y una IPv6 cuenta por su /64. `/sign-in/email` deja 3 por minuto.

const sinBloqueos: AlmacenDeBloqueos = {
  leer: async () => null,
  actualizar: async (_, cambio) => cambio(null),
  borrar: async () => {},
  podar: async () => {},
};

function armar() {
  const auth = betterAuth({
    ...configDeAuth({
      secreto: "un-secreto-de-prueba-que-no-sirve-para-nada-mas",
      urlDelSitio: "http://localhost",
      mandarResetDeContrasena: async () => {},
      avisarCambioDeContrasena: async () => {},
      mandarCodigo: async () => {},
      segundoPlano: () => {},
      bloqueos: sinBloqueos,
      borrarEnlaces: async () => {},
      registrar: async () => {},
    }),
    database: memoryAdapter({ user: [], session: [], account: [], verification: [], twoFactor: [], rateLimit: [] }),
    logger: { disabled: true },
  });
  let n = 0;
  /** Un intento de entrar con un correo que no existe, cada vez otro: solo cuenta la IP. */
  return (cabeceras: Record<string, string>) =>
    auth.handler(
      new Request("http://localhost/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost", ...cabeceras },
        body: JSON.stringify({ email: `nadie-${n++}@ed.test`, password: "una-contrasena-cualquiera" }),
      }),
    );
}

test("el cupo es de x-real-ip: cambiar x-forwarded-for no da intentos nuevos", async () => {
  const entrar = armar();
  for (let i = 0; i < 3; i++) assert.equal((await entrar({ "x-real-ip": "203.0.113.5", "x-forwarded-for": `198.51.100.${i}` })).status, 401);
  assert.equal((await entrar({ "x-real-ip": "203.0.113.5", "x-forwarded-for": "198.51.100.99" })).status, 429);
  // Otra IP tiene su propio cupo.
  assert.equal((await entrar({ "x-real-ip": "203.0.113.6" })).status, 401);
});

test("una IPv6 cuenta por su /64", async () => {
  const entrar = armar();
  for (let i = 1; i <= 3; i++) assert.equal((await entrar({ "x-real-ip": `2001:db8:1:2::${i}` })).status, 401);
  assert.equal((await entrar({ "x-real-ip": "2001:db8:1:2:ffff::9" })).status, 429);
  assert.equal((await entrar({ "x-real-ip": "2001:db8:1:3::1" })).status, 401);
});
