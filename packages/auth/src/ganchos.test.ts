import { test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { hashPassword as hashearConScrypt } from "better-auth/crypto";
import { claveDeBloqueo, claveDeCodigos, conUnFalloMas, type AlmacenDeBloqueos, type EstadoDeBloqueo } from "./bloqueo";
import { hashear, verificar } from "./contrasenas";
import { crearGanchos, destrabar } from "./ganchos";
import type { SucesoDeSesion } from "./opciones";

// Los ganchos corriendo adentro de better-auth de verdad, con su adaptador en
// memoria: lo que se prueba es que los pedidos a `/sign-in/email`,
// `/sign-out` y `/change-password` pasen por ellos como en producción, no una
// copia de su lógica. «Entró» lo anota el plugin del segundo factor, después
// de estos ganchos: se prueba en segundo-factor.test.ts.

const SECRETO = "un-secreto-de-prueba-que-no-sirve-para-nada-mas";
const CONTRASENA = "la-contrasena-buena-de-prueba";

function almacenEnMemoria(): AlmacenDeBloqueos & { filas: Map<string, EstadoDeBloqueo> } {
  const filas = new Map<string, EstadoDeBloqueo>();
  return {
    filas,
    async leer(clave) {
      return filas.get(clave) ?? null;
    },
    async actualizar(clave, cambio) {
      const siguiente = cambio(filas.get(clave) ?? null);
      filas.set(clave, siguiente);
      return siguiente;
    },
    async borrar(clave) {
      filas.delete(clave);
    },
    async podar() {},
  };
}

/**
 * Una instancia con una cuenta, cuya contraseña se guarda con `hash`. Lo que
 * se anota y los avisos que salen quedan en `sucesos` y `avisos`; `registrar`
 * se puede reemplazar para probar uno que falla.
 */
async function armar(
  correo: string,
  hash: (contrasena: string) => Promise<string>,
  registrar?: (suceso: SucesoDeSesion) => Promise<void>,
) {
  const bloqueos = almacenEnMemoria();
  const sucesos: SucesoDeSesion[] = [];
  const avisos: string[] = [];
  const sinEnlaces: string[] = [];
  const auth = betterAuth({
    database: memoryAdapter({ user: [], session: [], account: [], verification: [] }),
    secret: SECRETO,
    baseURL: "http://localhost",
    telemetry: { enabled: false },
    // Los «Invalid password» de cada fallo son el caso que se prueba, no ruido que leer.
    logger: { disabled: true },
    rateLimit: { enabled: false },
    emailAndPassword: { enabled: true, password: { hash: hashear, verify: verificar } },
    hooks: crearGanchos({
      bloqueos,
      secreto: SECRETO,
      registrar: registrar ?? (async (suceso) => void sucesos.push(suceso)),
      avisarCambioDeContrasena: async ({ para }) => void avisos.push(para),
      borrarEnlaces: async (idDeCuenta) => void sinEnlaces.push(idDeCuenta),
    }),
  });
  const ctx = await auth.$context;
  const cuenta = await ctx.internalAdapter.createUser({ email: correo, name: "Ana", emailVerified: true }, { method: "admin" });
  await ctx.internalAdapter.createAccount({ userId: cuenta.id, providerId: "credential", accountId: cuenta.id, password: await hash(CONTRASENA) });
  /** Un POST a la API de better-auth, como lo manda el navegador; con `cookie`, con sesión. */
  const pedir = (ruta: string, cuerpo: object, cookie?: string) =>
    auth.handler(
      new Request(`http://localhost/api/auth${ruta}`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost", ...(cookie ? { cookie } : {}) },
        body: JSON.stringify(cuerpo),
      }),
    );
  const entrar = (email: string, password: string) => pedir("/sign-in/email", { email, password });
  return { bloqueos, ctx, cuenta, entrar, pedir, sucesos, avisos, sinEnlaces, clave: claveDeBloqueo(correo, SECRETO) };
}

/** La cookie de sesión que puso una respuesta, lista para mandarla de vuelta. */
function cookieDe(res: Response): string {
  const cookie = res.headers.getSetCookie().find((c) => c.startsWith("better-auth.session_token="));
  assert.ok(cookie, "la respuesta no puso la cookie de sesión");
  return cookie.split(";")[0] ?? "";
}

test("un 401 cuenta un fallo, y entrar bien borra la fila", async () => {
  const { bloqueos, entrar, clave } = await armar("ana@ed.test", hashear);
  assert.equal((await entrar("ana@ed.test", "una-contrasena-mala")).status, 401);
  assert.equal(bloqueos.filas.get(clave)?.fallos, 1);
  assert.equal((await entrar("ana@ed.test", CONTRASENA)).status, 200);
  assert.equal(bloqueos.filas.has(clave), false);
});

test("solo el 401 cuenta: un correo mal escrito no es un intento", async () => {
  const { bloqueos, entrar } = await armar("ana@ed.test", hashear);
  assert.equal((await entrar("esto-no-es-un-correo", "una-contrasena-mala")).status, 400);
  assert.equal(bloqueos.filas.size, 0);
});

test("una cuenta frenada contesta 429 antes de mirar la contraseña, aunque sea la buena", async () => {
  const { entrar } = await armar("ana@ed.test", hashear);
  for (let i = 0; i < 5; i++) assert.equal((await entrar("Ana@ED.test", "una-contrasena-mala")).status, 401);
  const res = await entrar("ana@ed.test", CONTRASENA);
  assert.equal(res.status, 429);
  assert.deepEqual(await res.json(), { message: "Too many requests. Please try again later." });
  assert.equal(res.headers.get("x-retry-after"), "900");
});

test("entrar bien con un hash scrypt lo pasa a Argon2id", async () => {
  const { ctx, cuenta, entrar } = await armar("ana@ed.test", hashearConScrypt);
  assert.ok(!(await ctx.internalAdapter.findCredentialAccount(cuenta.id))?.password?.startsWith("$argon2id$"));
  assert.equal((await entrar("ana@ed.test", CONTRASENA)).status, 200);
  const guardado = (await ctx.internalAdapter.findCredentialAccount(cuenta.id))?.password ?? "";
  assert.ok(guardado.startsWith("$argon2id$v=19$m=19456,t=2,p=1$"), guardado);
  assert.equal(await verificar({ hash: guardado, password: CONTRASENA }), true);
});

test("un reset de contraseña destraba la cuenta, escriba como escriba el correo, y también sus códigos", async () => {
  const { bloqueos, cuenta, entrar, clave } = await armar("ana@ed.test", hashear);
  for (let i = 0; i < 5; i++) await entrar("ana@ed.test", "una-contrasena-mala");
  assert.notEqual(bloqueos.filas.get(clave)?.hasta ?? null, null);
  const deCodigos = claveDeCodigos(cuenta.id, SECRETO);
  await bloqueos.actualizar(deCodigos, (actual) => conUnFalloMas(actual, new Date()));
  await destrabar(bloqueos, { id: cuenta.id, email: "Ana@ED.test" }, SECRETO);
  assert.equal(bloqueos.filas.has(clave), false);
  assert.equal(bloqueos.filas.has(deCodigos), false);
  assert.equal((await entrar("ana@ed.test", CONTRASENA)).status, 200);
});

test("salir anota «salio» antes de que la sesión deje de existir", async () => {
  const { cuenta, entrar, pedir, sucesos } = await armar("ana@ed.test", hashear);
  const cookie = cookieDe(await entrar("ana@ed.test", CONTRASENA));
  assert.equal((await pedir("/sign-out", {}, cookie)).status, 200);
  assert.deepEqual(sucesos, [{ tipo: "salio", idDeCuenta: cuenta.id }]);
  // Sin sesión no hay a quién atribuírselo.
  assert.equal((await pedir("/sign-out", {})).status, 200);
  assert.equal(sucesos.length, 1);
});

test("cambiar la contraseña bien la anota, avisa por correo y borra los enlaces de la cuenta; con la actual mala, nada", async () => {
  const { cuenta, entrar, pedir, sucesos, avisos, sinEnlaces } = await armar("ana@ed.test", hashear);
  const cookie = cookieDe(await entrar("ana@ed.test", CONTRASENA));
  const cambiar = (actual: string) =>
    pedir("/change-password", { currentPassword: actual, newPassword: "otra-contrasena-de-prueba", revokeOtherSessions: true }, cookie);
  assert.equal((await cambiar("una-contrasena-mala")).status, 400);
  assert.deepEqual(avisos, []);
  assert.deepEqual(sinEnlaces, []);
  assert.equal((await cambiar(CONTRASENA)).status, 200);
  assert.deepEqual(sucesos.at(-1), { tipo: "cambio-su-contrasena", idDeCuenta: cuenta.id });
  assert.deepEqual(avisos, ["ana@ed.test"]);
  assert.deepEqual(sinEnlaces, [cuenta.id]);
});

test("si anotar falla, entrar y salir andan igual", async () => {
  const { entrar, pedir } = await armar("ana@ed.test", hashear, async () => {
    throw new Error("la base no contesta");
  });
  const res = await entrar("ana@ed.test", CONTRASENA);
  assert.equal(res.status, 200);
  assert.equal((await pedir("/sign-out", {}, cookieDe(res))).status, 200);
});
