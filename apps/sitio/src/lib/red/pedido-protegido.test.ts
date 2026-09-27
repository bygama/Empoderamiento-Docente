import { test } from "node:test";
import assert from "node:assert/strict";
import type { Resolver } from "./destino";
import { pedirProtegido, type Abrir, type Respuesta } from "./pedido-protegido";

// El pedido protegido sin red: el resolvedor y el pedido se inyectan. El
// pedido de mentira pasa por el `lookup` que le da `pedirProtegido`, como
// hace el de verdad antes de conectar.

const DNS: Record<string, string> = { "revista.org": "104.18.12.33", "otra.org": "200.45.1.1", "interno.org": "10.0.0.5" };
const resolver: Resolver = async (host) => {
  if (!DNS[host]) throw new Error("ENOTFOUND");
  return [{ address: DNS[host], family: 4 }];
};

type Guion = Record<string, { estado: number; location?: string; tipo?: string; partes?: string[] }>;

/** Un pedido de mentira que contesta según la URL, después de resolver el host con el `lookup` protegido. */
function abrirCon(guion: Guion, vistas: string[] = []): Abrir {
  return async (url, { lookup }) => {
    await new Promise<void>((listo, fallo) => lookup(url.hostname, {}, (e) => (e ? fallo(e) : listo())));
    vistas.push(url.toString());
    const g = guion[url.toString()] ?? { estado: 404 };
    const respuesta: Respuesta = {
      estado: g.estado,
      cabeceras: { location: g.location, "content-type": g.tipo ?? "text/html; charset=utf-8" },
      cuerpo: (async function* () {
        for (const p of g.partes ?? []) yield Buffer.from(p);
      })(),
      cortar: () => {},
    };
    return respuesta;
  };
}

const comun = { agente: "prueba", resolver, leerCuerpo: true };

test("lee la página, siguiendo una redirección a otro sitio público", async () => {
  const vistas: string[] = [];
  const guion: Guion = {
    "https://revista.org/a": { estado: 301, location: "https://otra.org/b" },
    "https://otra.org/b": { estado: 200, partes: ["<title>Hola</title>"] },
  };
  const r = await pedirProtegido("https://revista.org/a", { ...comun, abrir: abrirCon(guion, vistas) });
  assert.deepEqual(r, { ok: true, estado: 200, url: "https://otra.org/b", tipo: "text/html; charset=utf-8", cuerpo: "<title>Hola</title>", truncado: false });
  assert.deepEqual(vistas, ["https://revista.org/a", "https://otra.org/b"]);
});

test("cada redirección se vuelve a chequear: a http, a una IP interna o a un host que resuelve a una", async () => {
  for (const [location, motivo] of [
    ["http://otra.org/b", "url"],
    ["https://169.254.169.254/latest/meta-data/", "ip"],
    ["https://interno.org/admin", "ip"],
  ] as const) {
    const vistas: string[] = [];
    const r = await pedirProtegido("https://revista.org/a", { ...comun, abrir: abrirCon({ "https://revista.org/a": { estado: 302, location } }, vistas) });
    assert.equal(r.ok ? "ok" : r.motivo, motivo, location);
    assert.deepEqual(vistas, ["https://revista.org/a"], `no se pidió ${location}`);
  }
});

test("un host que resuelve a una IP interna no se pide, y uno que no existe lo dice", async () => {
  const interno = await pedirProtegido("https://interno.org/", { ...comun, abrir: abrirCon({}) });
  assert.equal(!interno.ok && interno.motivo, "ip");
  const noExiste = await pedirProtegido("https://no-existe.org/", { ...comun, abrir: abrirCon({}) });
  assert.equal(!noExiste.ok && noExiste.motivo, "dns");
});

test("demasiadas vueltas, el tope de bytes y el de tiempo", async () => {
  const circulo: Guion = { "https://revista.org/a": { estado: 302, location: "/b" }, "https://revista.org/b": { estado: 302, location: "/a" } };
  const vueltas = await pedirProtegido("https://revista.org/a", { ...comun, abrir: abrirCon(circulo) });
  assert.equal(!vueltas.ok && vueltas.motivo, "redirecciones");

  const grande = await pedirProtegido("https://revista.org/a", { ...comun, maximoBytes: 10, abrir: abrirCon({ "https://revista.org/a": { estado: 200, partes: ["123456", "7890ABCDEF"] } }) });
  assert.deepEqual(grande.ok && [grande.cuerpo, grande.truncado], ["1234567890", true]);

  const colgado: Abrir = (_url, { senal }) => new Promise((_listo, fallo) => senal.addEventListener("abort", () => fallo(new Error("abortado"))));
  const lento = await pedirProtegido("https://revista.org/a", { ...comun, limiteMs: 50, abrir: colgado });
  assert.deepEqual(!lento.ok && [lento.motivo, lento.detalle], ["tiempo", "No contestó en 0 segundos."]);
});
