import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import type { AlmacenDeBloqueos } from "./bloqueo";
import { configDeAuth } from "./config";
import { hashear } from "./contrasenas";
import { CONTRASENA_FILTRADA } from "./errores";
import { crearEnlaceDeInvitacion } from "./invitacion";

// Elegir o cambiar una contraseña que aparece en filtraciones se rechaza, con
// la config de producción. Have I Been Pwned se consulta por rango
// (k-anonimato: viajan los primeros 5 caracteres del SHA-1, nunca la
// contraseña); acá su respuesta la da un `fetch` de mentira, sin red.

const FILTRADA = "una-contrasena-que-ya-se-filtro";
const NUEVA = "una-contrasena-nueva-que-nadie-vio";
const ACTUAL = "la-contrasena-buena-de-prueba";

const sinBloqueos: AlmacenDeBloqueos = {
  leer: async () => null,
  actualizar: async (_, cambio) => cambio(null),
  borrar: async () => {},
  podar: async () => {},
};

const fetchDeVerdad = globalThis.fetch;
const pedidos: string[] = [];
afterEach(() => {
  globalThis.fetch = fetchDeVerdad;
  pedidos.length = 0;
});

/** Contesta el rango de HIBP como si solo `FILTRADA` estuviera filtrada; con `estado`, como si el servicio fallara. */
function conHibp(estado = 200) {
  const sha1 = createHash("sha1").update(FILTRADA).digest("hex").toUpperCase();
  globalThis.fetch = async (entrada: string | URL | Request) => {
    const url = entrada instanceof Request ? entrada.url : String(entrada);
    assert.ok(url.startsWith("https://api.pwnedpasswords.com/range/"), `pidió ${url}`);
    const prefijo = url.slice(-5);
    pedidos.push(prefijo);
    const cuerpo = prefijo === sha1.slice(0, 5) ? `${sha1.slice(5)}:42\r\n0000000000000000000000000000000000A:0` : "0000000000000000000000000000000000B:0";
    return new Response(estado === 200 ? cuerpo : "", { status: estado });
  };
}

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
  const pedir = (ruta: string, cuerpo: object, cookie = "") =>
    auth.handler(
      new Request(`http://localhost/api/auth${ruta}`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost", cookie },
        body: JSON.stringify(cuerpo),
      }),
    );
  return { auth, ctx, pedir };
}

/** El `code` del cuerpo de una respuesta de error. */
async function codigoDe(res: Response): Promise<unknown> {
  const cuerpo: unknown = await res.json();
  return typeof cuerpo === "object" && cuerpo !== null && "code" in cuerpo ? cuerpo.code : undefined;
}

test("elegir la contraseña por el enlace (la invitación) rechaza una filtrada y deja pasar otra", async () => {
  conHibp();
  const { auth, ctx, pedir } = await armar();
  const cuenta = await ctx.internalAdapter.createUser({ email: "juan@ed.test", name: "Juan", emailVerified: false }, { method: "admin" });
  const token = async () => {
    const { enlace } = await crearEnlaceDeInvitacion(auth, { idDeCuenta: cuenta.id, horas: 72, volverA: "/admin/nueva-contrasena" });
    return new URL(enlace).pathname.split("/").at(-1) ?? "";
  };
  const res = await pedir("/reset-password", { token: await token(), newPassword: FILTRADA });
  assert.equal(res.status, 400);
  assert.equal(await codigoDe(res), CONTRASENA_FILTRADA);
  assert.equal(await ctx.internalAdapter.findCredentialAccount(cuenta.id), null);
  // Solo viajan los 5 primeros caracteres del hash.
  assert.ok(pedidos.every((p) => /^[0-9A-F]{5}$/.test(p)), pedidos.join(","));
  assert.equal((await pedir("/reset-password", { token: await token(), newPassword: NUEVA })).status, 200);
});

test("cambiarla desde la cuenta también; entrar con una filtrada que ya tenía, no se frena", async () => {
  const { ctx, pedir } = await armar();
  const cuenta = await ctx.internalAdapter.createUser({ email: "ana@ed.test", name: "Ana", emailVerified: true }, { method: "admin" });
  await ctx.internalAdapter.createAccount({ userId: cuenta.id, providerId: "credential", accountId: cuenta.id, password: await hashear(ACTUAL) });
  conHibp();
  const entrada = await pedir("/sign-in/email", { email: "ana@ed.test", password: ACTUAL });
  assert.equal(entrada.status, 200);
  assert.deepEqual(pedidos, [], "entrar no consulta HIBP");
  const cookie = entrada.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  const cambio = await pedir("/change-password", { currentPassword: ACTUAL, newPassword: FILTRADA }, cookie);
  assert.equal(cambio.status, 400);
  assert.equal(await codigoDe(cambio), CONTRASENA_FILTRADA);
  assert.equal((await pedir("/change-password", { currentPassword: ACTUAL, newPassword: NUEVA }, cookie)).status, 200);
});

test("si HIBP no contesta, la contraseña no se guarda: mejor pedir que se pruebe de nuevo", async () => {
  conHibp(503);
  const { auth, ctx, pedir } = await armar();
  const cuenta = await ctx.internalAdapter.createUser({ email: "eva@ed.test", name: "Eva", emailVerified: false }, { method: "admin" });
  const { enlace } = await crearEnlaceDeInvitacion(auth, { idDeCuenta: cuenta.id, horas: 72, volverA: "/admin/nueva-contrasena" });
  const res = await pedir("/reset-password", { token: new URL(enlace).pathname.split("/").at(-1), newPassword: NUEVA });
  assert.equal(res.status, 500);
  assert.equal(await ctx.internalAdapter.findCredentialAccount(cuenta.id), null);
});
