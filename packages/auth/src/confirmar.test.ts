import { test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import type { AlmacenDeBloqueos, EstadoDeBloqueo } from "./bloqueo";
import { configDeAuth } from "./config";
import { confirmarContrasena } from "./confirmar";
import { hashear } from "./contrasenas";

// Contra better-auth de verdad, con la config de producción: `verifyPassword`
// desde el servidor, y cada fallo contado en el bloqueo por cuenta.

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
  const confirmar = (contrasena: string) => confirmarContrasena(auth, { headers, correo: "dora@ed.test", contrasena, bloqueos });
  return { confirmar, filas };
}

test("la buena confirma; la mala cuenta un fallo en el bloqueo por cuenta", async () => {
  const { confirmar, filas } = await armar();
  assert.equal(await confirmar("una-contrasena-mala"), "mal");
  assert.equal([...filas.values()][0]?.fallos, 1);
  assert.equal(await confirmar(CONTRASENA), "bien");
  assert.equal(filas.size, 0);
});

test("cinco fallos frenan la cuenta, y frenada no se prueba ni con la buena", async () => {
  const { confirmar } = await armar();
  for (let i = 0; i < 5; i++) assert.equal(await confirmar("una-contrasena-mala"), "mal");
  assert.equal(await confirmar(CONTRASENA), "frenada");
});
