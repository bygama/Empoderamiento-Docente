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
// la config de producción, **antes** de que better-auth gaste el enlace: con
// el mismo enlace se puede probar otra. Have I Been Pwned se consulta por
// rango (k-anonimato: viajan los primeros 5 caracteres del SHA-1, nunca la
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
afterEach(() => {
  globalThis.fetch = fetchDeVerdad;
});

const sufijo = (contrasena: string) => createHash("sha1").update(contrasena).digest("hex").toUpperCase().slice(5);

type Pedido = { prefijo: string; padding: string | null; conTiempo: boolean };

/**
 * Contesta el rango de HIBP. `filtradas`: los sufijos que aparecen, con cuántas
 * veces (0 es el relleno de `Add-Padding`, que no cuenta). `estado`: como si el
 * servicio fallara. `colgado`: como si no contestara, hasta que el pedido se
 * corte solo.
 */
function conHibp({ filtradas = { [sufijo(FILTRADA)]: 42 }, estado = 200, colgado = false }: { filtradas?: Record<string, number>; estado?: number; colgado?: boolean } = {}) {
  const pedidos: Pedido[] = [];
  globalThis.fetch = async (entrada: string | URL | Request, init?: RequestInit) => {
    const url = entrada instanceof Request ? entrada.url : String(entrada);
    assert.ok(url.startsWith("https://api.pwnedpasswords.com/range/"), `pidió ${url}`);
    const senal = init?.signal ?? null;
    pedidos.push({ prefijo: url.slice(-5), padding: new Headers(init?.headers).get("add-padding"), conTiempo: senal !== null });
    if (colgado) {
      return new Promise<Response>((_, rechazar) => {
        if (!senal) return;
        senal.addEventListener("abort", () => rechazar(senal.reason));
      });
    }
    const cuerpo = [...Object.entries(filtradas), ["0000000000000000000000000000000000A", 0]].map(([s, n]) => `${s}:${n}`).join("\r\n");
    return new Response(estado === 200 ? cuerpo : "", { status: estado });
  };
  return pedidos;
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
  /** Una invitada y el token de su enlace. */
  const invitada = async () => {
    const cuenta = await ctx.internalAdapter.createUser({ email: "juan@ed.test", name: "Juan", emailVerified: false }, { method: "admin" });
    const { enlace } = await crearEnlaceDeInvitacion(auth, { idDeCuenta: cuenta.id, horas: 72, volverA: "/admin/nueva-contrasena" });
    return { cuenta, token: new URL(enlace).pathname.split("/").at(-1) ?? "" };
  };
  return { ctx, pedir, invitada };
}

/** El `code` del cuerpo de una respuesta de error. */
async function codigoDe(res: Response): Promise<unknown> {
  const cuerpo: unknown = await res.json();
  return typeof cuerpo === "object" && cuerpo !== null && "code" in cuerpo ? cuerpo.code : undefined;
}

test("una filtrada se rechaza sin gastar el enlace: con el mismo, una buena entra", async () => {
  const pedidos = conHibp();
  const { ctx, pedir, invitada } = await armar();
  const { cuenta, token } = await invitada();
  const rechazo = await pedir("/reset-password", { token, newPassword: FILTRADA });
  assert.equal(rechazo.status, 400);
  assert.equal(await codigoDe(rechazo), CONTRASENA_FILTRADA);
  assert.equal(await ctx.internalAdapter.findCredentialAccount(cuenta.id), null);
  // Solo viajan los 5 primeros caracteres del hash, con relleno y con tiempo límite.
  assert.deepEqual(pedidos[0], { prefijo: createHash("sha1").update(FILTRADA).digest("hex").toUpperCase().slice(0, 5), padding: "true", conTiempo: true });
  assert.equal((await pedir("/reset-password", { token, newPassword: NUEVA })).status, 200);
  assert.ok((await ctx.internalAdapter.findCredentialAccount(cuenta.id))?.password);
});

test("el relleno (los que aparecen 0 veces) no cuenta como filtrada", async () => {
  conHibp({ filtradas: { [sufijo(NUEVA)]: 0 } });
  const { pedir, invitada } = await armar();
  const { token } = await invitada();
  assert.equal((await pedir("/reset-password", { token, newPassword: NUEVA })).status, 200);
});

test("si HIBP falla, no se guarda, y el mismo enlace sirve cuando vuelve", async () => {
  conHibp({ estado: 503 });
  const { ctx, pedir, invitada } = await armar();
  const { cuenta, token } = await invitada();
  assert.equal((await pedir("/reset-password", { token, newPassword: NUEVA })).status, 503);
  assert.equal(await ctx.internalAdapter.findCredentialAccount(cuenta.id), null);
  conHibp();
  assert.equal((await pedir("/reset-password", { token, newPassword: NUEVA })).status, 200);
});

test("si HIBP no contesta, el pedido se corta a los 3 segundos, no se guarda, y el mismo enlace sirve después", async () => {
  conHibp({ colgado: true });
  const { ctx, pedir, invitada } = await armar();
  const { cuenta, token } = await invitada();
  const antes = Date.now();
  assert.equal((await pedir("/reset-password", { token, newPassword: NUEVA })).status, 503);
  const espero = Date.now() - antes;
  assert.ok(espero >= 2_900 && espero < 6_000, `esperó ${espero} ms`);
  assert.equal(await ctx.internalAdapter.findCredentialAccount(cuenta.id), null);
  conHibp();
  assert.equal((await pedir("/reset-password", { token, newPassword: NUEVA })).status, 200);
});

test("cambiarla desde la cuenta, igual: filtrada o sin HIBP no cambia, y después sí; entrar no consulta HIBP", async () => {
  const { ctx, pedir } = await armar();
  const cuenta = await ctx.internalAdapter.createUser({ email: "ana@ed.test", name: "Ana", emailVerified: true }, { method: "admin" });
  await ctx.internalAdapter.createAccount({ userId: cuenta.id, providerId: "credential", accountId: cuenta.id, password: await hashear(ACTUAL) });
  const pedidos = conHibp();
  const entrada = await pedir("/sign-in/email", { email: "ana@ed.test", password: ACTUAL });
  assert.equal(entrada.status, 200);
  assert.deepEqual(pedidos, [], "entrar no consulta HIBP");
  const cookie = entrada.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
  const cambiar = (nueva: string) => pedir("/change-password", { currentPassword: ACTUAL, newPassword: nueva }, cookie);
  const filtrada = await cambiar(FILTRADA);
  assert.equal(filtrada.status, 400);
  assert.equal(await codigoDe(filtrada), CONTRASENA_FILTRADA);
  conHibp({ estado: 503 });
  assert.equal((await cambiar(NUEVA)).status, 503);
  conHibp();
  assert.equal((await cambiar(NUEVA)).status, 200);
});
