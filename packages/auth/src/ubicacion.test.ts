import { test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { hashear, verificar } from "./contrasenas";
import { CAMPOS_DE_LA_SESION, GANCHOS_DE_LA_BASE, ubicacionDelPedido } from "./ubicacion";

const cabeceras = (valores: Record<string, string>) => new Headers(valores);

test("lee la ciudad decodificada y el país en dos letras", () => {
  assert.deepEqual(ubicacionDelPedido(cabeceras({ "x-vercel-ip-city": "S%C3%A3o%20Paulo", "x-vercel-ip-country": "br" })), {
    ciudad: "São Paulo",
    pais: "BR",
  });
});

test("sin las cabeceras de Vercel, no sabe dónde", () => {
  assert.deepEqual(ubicacionDelPedido(cabeceras({})), { ciudad: null, pais: null });
  assert.deepEqual(ubicacionDelPedido(undefined), { ciudad: null, pais: null });
});

test("lo que no es una ciudad o un país no pasa", () => {
  const rara = ubicacionDelPedido(cabeceras({ "x-vercel-ip-city": "%E0%A4%A", "x-vercel-ip-country": "Argentina" }));
  assert.deepEqual(rara, { ciudad: null, pais: null });
  const larga = ubicacionDelPedido(cabeceras({ "x-vercel-ip-city": `Villa%0A${"a".repeat(200)}` }));
  assert.equal(larga.ciudad?.length, 80);
  assert.ok(!larga.ciudad?.includes("\n"));
});

test("la sesión que abre entrar guarda dónde se abrió", async () => {
  const sesiones: Record<string, unknown>[] = [];
  const auth = betterAuth({
    database: memoryAdapter({ user: [], session: sesiones, account: [], verification: [] }),
    secret: "un-secreto-de-prueba-que-no-sirve-para-nada-mas",
    baseURL: "http://localhost",
    telemetry: { enabled: false },
    rateLimit: { enabled: false },
    emailAndPassword: { enabled: true, password: { hash: hashear, verify: verificar } },
    session: { additionalFields: CAMPOS_DE_LA_SESION },
    databaseHooks: GANCHOS_DE_LA_BASE,
  });
  const ctx = await auth.$context;
  const cuenta = await ctx.internalAdapter.createUser({ email: "ana@ed.test", name: "Ana", emailVerified: true }, { method: "admin" });
  await ctx.internalAdapter.createAccount({ userId: cuenta.id, providerId: "credential", accountId: cuenta.id, password: await hashear("la-contrasena-buena-de-prueba") });
  const entrar = (extra: Record<string, string>) =>
    auth.handler(
      new Request("http://localhost/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost", ...extra },
        body: JSON.stringify({ email: "ana@ed.test", password: "la-contrasena-buena-de-prueba" }),
      }),
    );
  assert.equal((await entrar({ "x-vercel-ip-city": "C%C3%B3rdoba", "x-vercel-ip-country": "AR" })).status, 200);
  assert.equal((await entrar({})).status, 200);
  assert.deepEqual(
    sesiones.map(({ ciudad, pais }) => ({ ciudad, pais })),
    [
      { ciudad: "Córdoba", pais: "AR" },
      { ciudad: null, pais: null },
    ],
  );
});
