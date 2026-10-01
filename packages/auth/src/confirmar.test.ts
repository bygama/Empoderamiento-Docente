import { test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { claveDeBloqueo, claveDeConfirmacion, type AlmacenDeBloqueos, type EstadoDeBloqueo } from "./bloqueo";
import { configDeAuth } from "./config";
import { confirmarContrasena } from "./confirmar";
import { hashear } from "./contrasenas";

// Contra better-auth de verdad, con la config de producción: `verifyPassword`
// desde el servidor, y cada intento contado en un freno propio de la cuenta,
// aparte del de entrar.

const SECRETO = "un-secreto-de-prueba-que-no-sirve-para-nada-mas";
const CONTRASENA = "la-contrasena-buena-de-prueba";

async function armar() {
  const filas = new Map<string, EstadoDeBloqueo>();
  const bloqueos: AlmacenDeBloqueos = {
    leer: async (clave) => filas.get(clave) ?? null,
    actualizar: async (clave, cambio) => {
      const siguiente = cambio(filas.get(clave) ?? null);
      filas.set(clave, siguiente);
      return siguiente;
    },
    borrar: async (clave) => void filas.delete(clave),
    podar: async () => {},
  };
  const auth = betterAuth({
    ...configDeAuth({
      secreto: SECRETO,
      urlDelSitio: "http://localhost",
      mandarResetDeContrasena: async () => {},
      avisarCambioDeContrasena: async () => {},
      mandarCodigo: async () => {},
      segundoPlano: () => {},
      bloqueos,
      borrarEnlaces: async () => {},
      registrar: async () => {},
    }),
    database: memoryAdapter({ user: [], session: [], account: [], verification: [], twoFactor: [] }),
    logger: { disabled: true },
    rateLimit: { enabled: false },
  });
  const ctx = await auth.$context;
  const cuenta = await ctx.internalAdapter.createUser({ email: "dora@ed.test", name: "Dora", emailVerified: true }, { method: "admin" });
  await ctx.internalAdapter.createAccount({ userId: cuenta.id, providerId: "credential", accountId: cuenta.id, password: await hashear(CONTRASENA) });
  const res = await auth.handler(
    new Request("http://localhost/api/auth/sign-in/email", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost" },
      body: JSON.stringify({ email: "dora@ed.test", password: CONTRASENA }),
    }),
  );
  const headers = new Headers({ cookie: res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ") });
  const confirmar = (contrasena: string) => confirmarContrasena(auth, { headers, idDeCuenta: cuenta.id, contrasena, bloqueos });
  const entrar = (contrasena: string) =>
    auth.handler(
      new Request("http://localhost/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost" },
        body: JSON.stringify({ email: "dora@ed.test", password: contrasena }),
      }),
    );
  return { confirmar, entrar, filas, clave: claveDeConfirmacion(cuenta.id, SECRETO) };
}

test("la buena confirma; la mala cuenta un fallo en su propio freno, por cuenta", async () => {
  const { confirmar, filas, clave } = await armar();
  assert.equal(await confirmar("una-contrasena-mala"), "mal");
  assert.equal(filas.get(clave)?.fallos, 1);
  assert.equal(await confirmar(CONTRASENA), "bien");
  assert.equal(filas.has(clave), false);
});

test("cinco fallos frenan la confirmación, y frenada no se prueba ni con la buena", async () => {
  const { confirmar } = await armar();
  for (let i = 0; i < 5; i++) assert.equal(await confirmar("una-contrasena-mala"), "mal");
  assert.equal(await confirmar(CONTRASENA), "frenada");
});

test("el freno de entrar no frena la confirmación, ni al revés: quien sabe el correo no traba lo que se hace con la sesión", async () => {
  const { confirmar, entrar, filas } = await armar();
  for (let i = 0; i < 5; i++) assert.equal((await entrar("una-contrasena-mala")).status, 401);
  assert.equal((await entrar(CONTRASENA)).status, 429);
  assert.notEqual(filas.get(claveDeBloqueo("dora@ed.test", SECRETO))?.hasta ?? null, null);
  assert.equal(await confirmar(CONTRASENA), "bien");

  const otra = await armar();
  for (let i = 0; i < 5; i++) await otra.confirmar("una-contrasena-mala");
  assert.equal(await otra.confirmar(CONTRASENA), "frenada");
  assert.equal((await otra.entrar(CONTRASENA)).status, 200);
});

test("una ráfaga de confirmaciones a la vez no pasa del tope: a lo sumo 5 se prueban", async () => {
  const { confirmar } = await armar();
  const rafaga = await Promise.all(Array.from({ length: 12 }, () => confirmar("una-contrasena-mala")));
  assert.equal(rafaga.filter((r) => r === "mal").length, 5);
  assert.equal(rafaga.filter((r) => r === "frenada").length, 7);
});
