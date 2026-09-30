import { mock, test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import type { AlmacenDeBloqueos } from "./bloqueo";
import { configDeAuth } from "./config";
import { hashear } from "./contrasenas";

// Una sesión que se usa todo el tiempo se renueva cada hora, pero no pasa de
// 7 días desde que se abrió. Con la config de producción y el reloj simulado:
// se la usa una vez por hora durante una semana y se mira cuándo deja de
// servir, por la API del navegador, por la del servidor y por una ruta de
// better-auth que mira la sesión por dentro.

const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;
const CONTRASENA = "la-contrasena-buena-de-prueba";

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
      borrarEnlaces: async () => {},
      registrar: async () => {},
    }),
    database: memoryAdapter({ user: [], session: [], account: [], verification: [], twoFactor: [] }),
    logger: { disabled: true },
    rateLimit: { enabled: false },
  });
  const ctx = await auth.$context;
  const cuenta = await ctx.internalAdapter.createUser({ email: "ana@ed.test", name: "Ana", emailVerified: true, rol: "edita" }, { method: "admin" });
  await ctx.internalAdapter.createAccount({ userId: cuenta.id, providerId: "credential", accountId: cuenta.id, password: await hashear(CONTRASENA) });
  const pedir = (ruta: string, metodo: "GET" | "POST", cookie = "", cuerpo?: object) =>
    auth.handler(
      new Request(`http://localhost/api/auth${ruta}`, {
        method: metodo,
        headers: { "content-type": "application/json", origin: "http://localhost", cookie },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
      }),
    );
  const res = await pedir("/sign-in/email", "POST", "", { email: "ana@ed.test", password: CONTRASENA });
  const cookie = res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  return { auth, pedir, cookie };
}

test("una sesión usada cada hora no pasa de 7 días desde que se abrió, por ningún camino", async (t) => {
  t.after(() => mock.timers.reset());
  mock.timers.enable({ apis: ["Date"], now: new Date("2026-10-01T09:00:00Z") });
  const { auth, pedir, cookie } = await armar();

  const hasta = 7 * DIA - HORA;
  for (let pasado = HORA; pasado <= hasta; pasado += HORA) {
    mock.timers.tick(HORA);
    const sesion: unknown = await (await pedir("/get-session", "GET", cookie)).json();
    assert.ok(sesion, `a las ${pasado / HORA} horas la sesión todavía sirve`);
  }

  mock.timers.tick(HORA + 60_000);
  // Una ruta que mira la sesión por dentro (el middleware de better-auth), antes que nada.
  assert.equal((await pedir("/list-sessions", "GET", cookie)).status, 401);
  assert.equal(await auth.api.getSession({ headers: new Headers({ cookie }) }), null);
  assert.equal(await (await pedir("/get-session", "GET", cookie)).json(), null);
});
