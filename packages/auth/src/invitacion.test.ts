import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import type { AlmacenDeBloqueos } from "./bloqueo";
import { configDeAuth } from "./config";
import { hashear } from "./contrasenas";
import { crearEnlaceDeInvitacion } from "./invitacion";
import type { OpcionesDeAuth } from "./opciones";

// El enlace de invitación contra better-auth de verdad, con la config de
// producción (tokens hasheados incluidos): si una versión nueva cambia el
// formato del reset, estos tests son los que se enteran.

// Elegir la contraseña le pregunta a Have I Been Pwned si está filtrada
// (config.ts): acá contesta que ninguna, sin red. Lo prueba
// contrasenas-filtradas.test.ts.
const fetchDeVerdad = globalThis.fetch;
before(() => {
  globalThis.fetch = async () => new Response("0000000000000000000000000000000000A:0");
});
after(() => {
  globalThis.fetch = fetchDeVerdad;
});

const sinBloqueos: AlmacenDeBloqueos = {
  leer: async () => null,
  actualizar: async (_, cambio) => cambio(null),
  borrar: async () => {},
  podar: async () => {},
};

/** Con `opciones`, se reemplaza lo que la app le pasa (por ejemplo, un `borrarEnlaces` que falla). */
async function armar(opciones: Partial<Omit<OpcionesDeAuth, "base">> = {}) {
  const db = { user: [], session: [], account: [], verification: [] as Array<{ value: string }>, twoFactor: [] };
  const avisos: string[] = [];
  const codigos: string[] = [];
  const enSegundoPlano: Promise<unknown>[] = [];
  const auth = betterAuth({
    ...configDeAuth({
      secreto: "un-secreto-de-prueba-que-no-sirve-para-nada-mas",
      urlDelSitio: "http://localhost",
      mandarResetDeContrasena: async () => {},
      avisarCambioDeContrasena: async ({ para }) => void avisos.push(para),
      mandarCodigo: async ({ codigo }) => void codigos.push(codigo),
      segundoPlano: (tarea) => void enSegundoPlano.push(tarea),
      bloqueos: sinBloqueos,
      // Como el de la app (datos/auth.ts): todo lo de la cuenta en `verification`.
      borrarEnlaces: async (idDeCuenta) => {
        for (let i = db.verification.length - 1; i >= 0; i--) if (db.verification[i]?.value === idDeCuenta) db.verification.splice(i, 1);
      },
      registrar: async () => {},
      ...opciones,
    }),
    database: memoryAdapter(db),
    logger: { disabled: true },
    rateLimit: { enabled: false },
  });
  const ctx = await auth.$context;
  // Como nace una invitada: sin credencial, sin contraseña.
  const cuenta = await ctx.internalAdapter.createUser({ email: "juan@ed.test", name: "Juan", emailVerified: false }, { method: "admin" });
  const abrir = (enlace: string) => auth.handler(new Request(enlace, { method: "GET" }));
  const elegir = async (token: string) => {
    const res = await auth.handler(
      new Request("http://localhost/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost" },
        body: JSON.stringify({ token, newPassword: "la-contrasena-que-eligio" }),
      }),
    );
    await Promise.all(enSegundoPlano.splice(0));
    return res;
  };
  /** Un navegador: guarda las cookies que le ponen y las manda de vuelta. */
  const navegador = () => {
    const cookies = new Map<string, string>();
    return async (ruta: string, cuerpo: object) => {
      const res = await auth.handler(
        new Request(`http://localhost/api/auth${ruta}`, {
          method: "POST",
          headers: { "content-type": "application/json", origin: "http://localhost", cookie: [...cookies].map(([n, v]) => `${n}=${v}`).join("; ") },
          body: JSON.stringify(cuerpo),
        }),
      );
      await Promise.all(enSegundoPlano.splice(0));
      for (const c of res.headers.getSetCookie()) {
        const [nombre = "", valor = ""] = (c.split(";")[0] ?? "").split("=");
        if (/max-age=0/i.test(c) || valor === "") cookies.delete(nombre);
        else cookies.set(nombre, valor);
      }
      return res;
    };
  };
  return { auth, ctx, cuenta, abrir, elegir, avisos, codigos, navegador };
}

/** Si la respuesta de entrar pide el código en vez de traer la sesión. */
async function pideCodigo(res: Response): Promise<boolean> {
  const cuerpo: unknown = await res.json();
  return typeof cuerpo === "object" && cuerpo !== null && "twoFactorRedirect" in cuerpo;
}

/** El token de un enlace de invitación. */
const tokenDe = (enlace: string) => new URL(enlace).pathname.split("/").at(-1) ?? "";

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

test("elegir la contraseña con un enlace deja sin efecto los otros de la cuenta y su dispositivo recordado, no los de otra", async () => {
  const { auth, ctx, elegir, codigos, navegador } = await armar();
  const tokenPara = async (idDeCuenta: string) => {
    const { enlace } = await crearEnlaceDeInvitacion(auth, { idDeCuenta, horas: 72, volverA: "/admin/nueva-contrasena" });
    return tokenDe(enlace);
  };
  // Ana tiene contraseña y segundo factor, y recuerda este dispositivo por el flujo de verdad: el código con «Recordar».
  const ana = await ctx.internalAdapter.createUser({ email: "ana@ed.test", name: "Ana", emailVerified: true, twoFactorEnabled: true }, { method: "admin" });
  await ctx.internalAdapter.createAccount({ userId: ana.id, providerId: "credential", accountId: ana.id, password: await hashear("la-contrasena-de-antes-de-ana") });
  const pedir = navegador();
  const entrar = (password: string) => pedir("/sign-in/email", { email: "ana@ed.test", password });
  assert.equal(await pideCodigo(await entrar("la-contrasena-de-antes-de-ana")), true);
  await pedir("/two-factor/send-otp", {});
  assert.equal((await pedir("/two-factor/verify-otp", { code: codigos.at(-1), trustDevice: true })).status, 200);
  assert.equal(await pideCodigo(await entrar("la-contrasena-de-antes-de-ana")), false, "el dispositivo quedó recordado");

  const [uno, otro] = [await tokenPara(ana.id), await tokenPara(ana.id)];
  const ajena = await ctx.internalAdapter.createUser({ email: "eva@ed.test", name: "Eva", emailVerified: false }, { method: "admin" });
  const deLaAjena = await tokenPara(ajena.id);

  assert.equal((await elegir(uno)).status, 200);
  assert.equal((await elegir(otro)).status, 400);
  assert.equal(await pideCodigo(await entrar("la-contrasena-que-eligio")), true, "el dispositivo ya no saltea el código");
  assert.equal((await elegir(deLaAjena)).status, 200);
});

test("si borrar los enlaces o destrabar la cuenta falla, elegir la contraseña igual cierra las sesiones y avisa", async () => {
  const falla = async () => {
    throw new Error("la base no contesta");
  };
  const { auth, ctx, cuenta, elegir, avisos } = await armar({ borrarEnlaces: falla, bloqueos: { ...sinBloqueos, borrar: falla } });
  await ctx.internalAdapter.createSession(cuenta.id);
  const { enlace } = await crearEnlaceDeInvitacion(auth, { idDeCuenta: cuenta.id, horas: 72, volverA: "/admin/nueva-contrasena" });
  assert.equal((await elegir(tokenDe(enlace))).status, 200);
  assert.deepEqual(await ctx.internalAdapter.listSessions(cuenta.id), []);
  assert.deepEqual(avisos, ["juan@ed.test"]);
});

test("vencido, el enlace no sirve", async () => {
  const { auth, cuenta, abrir, elegir } = await armar();
  const { enlace } = await crearEnlaceDeInvitacion(auth, { idDeCuenta: cuenta.id, horas: -1, volverA: "/admin/nueva-contrasena" });
  const destino = new URL((await abrir(enlace)).headers.get("location") ?? "", "http://localhost");
  assert.equal(destino.searchParams.get("error"), "INVALID_TOKEN");
  const token = new URL(enlace).pathname.split("/").at(-1) ?? "";
  assert.equal((await elegir(token)).status, 400);
});
