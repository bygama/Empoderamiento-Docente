import { test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { claveDeCodigos, type AlmacenDeBloqueos, type EstadoDeBloqueo } from "./bloqueo";
import { configDeAuth } from "./config";
import { hashear } from "./contrasenas";
import type { OpcionesDeAuth, SucesoDeSesion } from "./opciones";

// El segundo factor corriendo adentro de better-auth de verdad, con la config
// de producción (`configDeAuth`) y su adaptador en memoria. **La tabla
// `twoFactor` empieza vacía y tiene que terminar vacía**: todo el diseño se
// apoya en que el código por correo no la necesita (DECISIONS de
// work/cuentas).

const CONTRASENA = "la-contrasena-buena-de-prueba";
const SECRETO = "un-secreto-de-prueba-que-no-sirve-para-nada-mas";

/** El bloqueo por cuenta en memoria: sus filas quedan a la vista. */
function almacenEnMemoria(): AlmacenDeBloqueos & { filas: Map<string, EstadoDeBloqueo> } {
  const filas = new Map<string, EstadoDeBloqueo>();
  return {
    filas,
    leer: async (clave) => filas.get(clave) ?? null,
    actualizar: async (clave, cambio) => {
      const siguiente = cambio(filas.get(clave) ?? null);
      filas.set(clave, siguiente);
      return siguiente;
    },
    borrar: async (clave) => void filas.delete(clave),
    podar: async () => {},
  };
}

/** Un frasco de cookies: junta lo que ponen las respuestas y lo manda de vuelta. */
function frasco() {
  const cookies = new Map<string, string>();
  return {
    guardar(res: Response) {
      for (const c of res.headers.getSetCookie()) {
        const [par = ""] = c.split(";");
        const [nombre = "", valor = ""] = par.split("=");
        if (/max-age=0/i.test(c) || valor === "") cookies.delete(nombre);
        else cookies.set(nombre, valor);
      }
      return res;
    },
    cabecera: () => [...cookies].map(([n, v]) => `${n}=${v}`).join("; "),
    tiene: (parte: string) => [...cookies.keys()].some((n) => n.includes(parte)),
  };
}

/** El `code` del cuerpo de una respuesta de error, o `undefined`. */
async function codigoDe(res: Response): Promise<unknown> {
  const cuerpo: unknown = await res.json();
  return typeof cuerpo === "object" && cuerpo !== null && "code" in cuerpo ? cuerpo.code : undefined;
}

async function armar(rol: "administra" | "edita", mandarCodigo?: OpcionesDeAuth["mandarCodigo"]) {
  const db = { user: [], session: [], account: [], verification: [], twoFactor: [] as unknown[] };
  const sucesos: SucesoDeSesion[] = [];
  const codigos: string[] = [];
  const enSegundoPlano: Promise<unknown>[] = [];
  const bloqueos = almacenEnMemoria();
  const auth = betterAuth({
    ...configDeAuth({
      secreto: SECRETO,
      urlDelSitio: "http://localhost",
      mandarResetDeContrasena: async () => {},
      avisarCambioDeContrasena: async () => {},
      mandarCodigo: mandarCodigo ?? (async ({ codigo }) => void codigos.push(codigo)),
      segundoPlano: (tarea) => void enSegundoPlano.push(tarea),
      bloqueos,
      borrarEnlaces: async () => {},
      registrar: async (suceso) => void sucesos.push(suceso),
    }),
    database: memoryAdapter(db),
    logger: { disabled: true },
    rateLimit: { enabled: false },
  });
  const ctx = await auth.$context;
  const cuenta = await ctx.internalAdapter.createUser(
    { email: "ana@ed.test", name: "Ana", emailVerified: true, rol, twoFactorEnabled: rol === "administra" },
    { method: "admin" },
  );
  await ctx.internalAdapter.createAccount({ userId: cuenta.id, providerId: "credential", accountId: cuenta.id, password: await hashear(CONTRASENA) });
  const galletas = frasco();
  const pedir = async (ruta: string, cuerpo: object = {}) => {
    const res = await auth.handler(
      new Request(`http://localhost/api/auth${ruta}`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost", cookie: galletas.cabecera() },
        body: JSON.stringify(cuerpo),
      }),
    );
    await Promise.all(enSegundoPlano.splice(0));
    return galletas.guardar(res);
  };
  const entrar = () => pedir("/sign-in/email", { email: "ana@ed.test", password: CONTRASENA });
  const suspender = () => ctx.internalAdapter.updateUser(cuenta.id, { suspendida: true });
  return { db, cuenta, sucesos, codigos, galletas, pedir, entrar, suspender, bloqueos };
}

/** Un código que no es el último que salió. */
const malo = (codigos: string[]) => (codigos.at(-1) === "000000" ? "111111" : "000000");

test("la contraseña sola no es una sesión ni anota «entro»; el código sí, con la tabla twoFactor vacía", async () => {
  const { db, cuenta, sucesos, codigos, galletas, pedir, entrar } = await armar("administra");
  const res = await entrar();
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { twoFactorRedirect: true, twoFactorMethods: ["otp"] });
  assert.equal(galletas.tiene("session_token"), false);
  assert.deepEqual(sucesos, []);

  assert.equal((await pedir("/two-factor/send-otp")).status, 200);
  assert.match(codigos[0] ?? "", /^\d{6}$/);
  assert.equal((await pedir("/two-factor/verify-otp", { code: codigos[0] === "000000" ? "111111" : "000000" })).status, 401);
  assert.equal((await pedir("/two-factor/verify-otp", { code: codigos[0] })).status, 200);
  assert.ok(galletas.tiene("session_token"));
  assert.deepEqual(sucesos, [{ tipo: "entro", idDeCuenta: cuenta.id }]);
  assert.equal(db.twoFactor.length, 0);
});

test("recordar el dispositivo saltea el código la vez siguiente, y esa vez también «entró»", async () => {
  const { db, sucesos, codigos, pedir, entrar } = await armar("administra");
  await entrar();
  await pedir("/two-factor/send-otp");
  assert.equal((await pedir("/two-factor/verify-otp", { code: codigos[0], trustDevice: true })).status, 200);
  const otraVez = await entrar();
  assert.equal(otraVez.status, 200);
  const cuerpo: unknown = await otraVez.json();
  assert.ok(typeof cuerpo === "object" && cuerpo !== null && "user" in cuerpo, "sin código: la respuesta ya trae la sesión");
  assert.equal(sucesos.filter((s) => s.tipo === "entro").length, 2);
  assert.equal(db.twoFactor.length, 0);
});

test("cinco intentos fallidos frenan la cuenta, aunque el sexto sea el bueno", async () => {
  const { codigos, pedir, entrar } = await armar("administra");
  await entrar();
  await pedir("/two-factor/send-otp");
  for (let i = 0; i < 5; i++) assert.equal((await pedir("/two-factor/verify-otp", { code: malo(codigos) })).status, 401);
  // El mismo 429 del rate limit: quien prueba no distingue un freno del otro.
  const frenado = await pedir("/two-factor/verify-otp", { code: codigos[0] });
  assert.equal(frenado.status, 429);
  assert.deepEqual(await frenado.json(), { message: "Too many requests. Please try again later." });
});

test("los códigos fallidos se cuentan por cuenta: pedir otro código o volver a entrar no los borra", async () => {
  const { codigos, pedir, entrar, bloqueos, cuenta } = await armar("administra");
  await entrar();
  await pedir("/two-factor/send-otp");
  for (let i = 0; i < 3; i++) assert.equal((await pedir("/two-factor/verify-otp", { code: malo(codigos) })).status, 401);
  // Un código nuevo trae sus propios 5 intentos, pero la cuenta sigue contando.
  await pedir("/two-factor/send-otp");
  for (let i = 0; i < 2; i++) assert.equal((await pedir("/two-factor/verify-otp", { code: malo(codigos) })).status, 401);
  assert.equal((await pedir("/two-factor/verify-otp", { code: codigos.at(-1) })).status, 429);
  // Con la contraseña buena de nuevo, tampoco: ni con el código bueno.
  await entrar();
  await pedir("/two-factor/send-otp");
  assert.equal((await pedir("/two-factor/verify-otp", { code: codigos.at(-1) })).status, 429);
  assert.notEqual(bloqueos.filas.get(claveDeCodigos(cuenta.id, SECRETO))?.hasta ?? null, null);
});

test("el código bueno borra los fallos de la cuenta", async () => {
  const { codigos, pedir, entrar, bloqueos, cuenta } = await armar("administra");
  await entrar();
  await pedir("/two-factor/send-otp");
  for (let i = 0; i < 4; i++) await pedir("/two-factor/verify-otp", { code: malo(codigos) });
  assert.equal(bloqueos.filas.get(claveDeCodigos(cuenta.id, SECRETO))?.fallos, 4);
  assert.equal((await pedir("/two-factor/verify-otp", { code: codigos.at(-1) })).status, 200);
  assert.equal(bloqueos.filas.has(claveDeCodigos(cuenta.id, SECRETO)), false);
});

test("si el correo no sale, pedir el código contesta CODIGO_NO_SALIO", async () => {
  const { pedir, entrar } = await armar("administra", async () => {
    throw new Error("Resend contestó 500");
  });
  await entrar();
  const res = await pedir("/two-factor/send-otp");
  assert.equal(res.status, 503);
  assert.equal(await codigoDe(res), "CODIGO_NO_SALIO");
});

test("sin segundo factor, entrar anota «entro»; un fallo no anota nada", async () => {
  const { cuenta, sucesos, pedir, entrar } = await armar("edita");
  assert.equal((await pedir("/sign-in/email", { email: "ana@ed.test", password: "una-contrasena-mala" })).status, 401);
  assert.deepEqual(sucesos, []);
  assert.equal((await entrar()).status, 200);
  assert.deepEqual(sucesos, [{ tipo: "entro", idDeCuenta: cuenta.id }]);
});

test("quien edita lo prende y lo apaga con su contraseña, y queda anotado", async () => {
  const { db, cuenta, sucesos, pedir, entrar } = await armar("edita");
  await entrar();
  assert.equal((await pedir("/two-factor/enable", { password: CONTRASENA, method: "otp" })).status, 200);
  assert.equal((db.user[0] as { twoFactorEnabled?: boolean }).twoFactorEnabled, true);
  assert.equal((await pedir("/two-factor/disable", { password: CONTRASENA })).status, 200);
  assert.equal((db.user[0] as { twoFactorEnabled?: boolean }).twoFactorEnabled, false);
  assert.deepEqual(
    sucesos.filter((s) => s.tipo !== "entro"),
    [
      { tipo: "activo-el-segundo-factor", idDeCuenta: cuenta.id },
      { tipo: "desactivo-el-segundo-factor", idDeCuenta: cuenta.id },
    ],
  );
  assert.equal(db.twoFactor.length, 0);
});

test("quien administra no lo puede apagar", async () => {
  const { db, codigos, pedir, entrar } = await armar("administra");
  await entrar();
  await pedir("/two-factor/send-otp");
  await pedir("/two-factor/verify-otp", { code: codigos[0] });
  const res = await pedir("/two-factor/disable", { password: CONTRASENA });
  assert.equal(res.status, 403);
  assert.equal(await codigoDe(res), "SEGUNDO_FACTOR_OBLIGATORIO");
  assert.equal((db.user[0] as { twoFactorEnabled?: boolean }).twoFactorEnabled, true);
});

test("una cuenta suspendida no entra: ni con la contraseña, ni con el código si la suspendieron en el medio", async () => {
  const edita = await armar("edita");
  await edita.suspender();
  const res = await edita.entrar();
  assert.equal(res.status, 403);
  assert.equal(await codigoDe(res), "CUENTA_SUSPENDIDA");
  assert.equal(edita.galletas.tiene("session_token"), false);

  const administra = await armar("administra");
  await administra.entrar();
  await administra.pedir("/two-factor/send-otp");
  await administra.suspender();
  const conCodigo = await administra.pedir("/two-factor/verify-otp", { code: administra.codigos[0] });
  assert.equal(conCodigo.status, 403);
  assert.equal(await codigoDe(conCodigo), "CUENTA_SUSPENDIDA");
  assert.equal(administra.galletas.tiene("session_token"), false);
  assert.deepEqual([...edita.sucesos, ...administra.sucesos], []);
});
