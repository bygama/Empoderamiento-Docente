import { test } from "node:test";
import assert from "node:assert/strict";
import { DestinoNoPermitido, lookupProtegido, urlPermitida, type Resolver } from "./destino";

/** El código con que se rechaza un destino, o «bien». */
function motivo(texto: string): string {
  try {
    urlPermitida(texto);
    return "bien";
  } catch (e) {
    return e instanceof DestinoNoPermitido ? e.codigo : "otro";
  }
}

test("solo https, en el puerto de siempre, sin credenciales y sin IP interna escrita", () => {
  assert.equal(motivo("https://revistas.ucr.ac.cr/articulo/1"), "bien");
  assert.equal(motivo("https://revistas.ucr.ac.cr:443/articulo/1"), "bien");
  assert.equal(motivo("https://8.8.8.8/"), "bien");
  assert.equal(motivo("http://revistas.ucr.ac.cr/"), "url");
  assert.equal(motivo("file:///etc/passwd"), "url");
  assert.equal(motivo("https://revistas.ucr.ac.cr:8443/"), "url");
  assert.equal(motivo("https://usuario:clave@revistas.ucr.ac.cr/"), "url");
  assert.equal(motivo("no es un link"), "url");
  assert.equal(motivo("https://169.254.169.254/latest/meta-data/"), "ip");
  assert.equal(motivo("https://[::1]/"), "ip");
  assert.equal(motivo("https://[::ffff:127.0.0.1]/"), "ip");
  assert.equal(motivo("https://0x7f000001/"), "ip");
});

/** Lo que contesta el `lookup` para ese host, con un resolvedor inventado. */
function buscar(resolver: Resolver, host: string, all: boolean): Promise<{ error: Error | null; direccion: unknown }> {
  return new Promise((listo) => {
    const cb = (error: Error | null, direccion: unknown) => listo({ error, direccion });
    lookupProtegido(resolver)(host, { all }, cb as never);
  });
}

test("el lookup conecta solo a direcciones chequeadas, y una sola interna frena todo", async () => {
  const dns: Record<string, string[]> = { publico: ["104.18.12.33", "2606:4700::6810:84e5"], mezclado: ["104.18.12.33", "10.0.0.5"], interno: ["169.254.169.254"] };
  const resolver: Resolver = async (host) => {
    if (!dns[host]) throw new Error("ENOTFOUND");
    return dns[host].map((address) => ({ address, family: address.includes(":") ? 6 : 4 }));
  };
  assert.deepEqual(await buscar(resolver, "publico", false), { error: null, direccion: "104.18.12.33" });
  assert.equal(((await buscar(resolver, "publico", true)).direccion as unknown[]).length, 2);
  for (const host of ["mezclado", "interno"]) {
    const { error } = await buscar(resolver, host, false);
    assert.ok(error instanceof DestinoNoPermitido && error.codigo === "ip", host);
  }
  const noExiste = (await buscar(resolver, "no-existe", true)).error;
  assert.ok(noExiste instanceof DestinoNoPermitido && noExiste.codigo === "dns");
});
