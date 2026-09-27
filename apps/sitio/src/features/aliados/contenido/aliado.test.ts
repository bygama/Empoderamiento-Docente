import { test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import { esquemaAliado, esquemaBorradorDeAliado, type Aliado } from "./aliado";
import { altoDe } from "./modelo";

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

const completo: Aliado = { nombre: "UNESCO", logo: { src: "/aliados/unesco.png", alt: "UNESCO", foco: { x: 0.5, y: 0.5 } }, tamano: "chico", url: "" };

const errores = (r: { error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }) =>
  Object.fromEntries((r.error?.issues ?? []).map((i) => [i.path.join("."), i.message]));

test("un aliado completo se publica; en un borrador puede faltar el logo, al publicar no", () => {
  assert.equal(esquemaAliado.safeParse(completo).success, true);
  const sinLogo = { ...completo, nombre: "", logo: { ...completo.logo, src: "", alt: "" } };
  assert.equal(esquemaBorradorDeAliado.safeParse(sinLogo).success, true);
  assert.equal(errores(esquemaAliado.safeParse(sinLogo))["logo.src"], "Falta el logo.");
});

test("la URL es una dirección https completa, o nada", () => {
  assert.equal(esquemaAliado.safeParse({ ...completo, url: "https://bloomlat.com" }).success, true);
  for (const url of ["bloomlat.com", "http://bloomlat.com", "javascript:alert(1)"]) {
    assert.equal(errores(esquemaBorradorDeAliado.safeParse({ ...completo, url })).url, "Una dirección completa, que empiece con https://.", url);
  }
});

test("el tamaño da las clases de alto de la tira, y uno que no existe va como chico", () => {
  assert.deepEqual(altoDe("grande"), { inicio: "h-12", pie: "h-11" });
  assert.deepEqual(altoDe("enorme"), { inicio: "h-8", pie: "h-7" });
});

test("los cinco de la base están publicados, autorizados con su nota y pasan esquemaAliado", sinBase, async () => {
  const { base } = await import("@/datos/cliente");
  const { publicadoDeAliado } = await import("@/datos/consultas/aliados");
  const filas = await base.aliado.findMany({ where: { creadoPor: null, publicadoPor: null }, orderBy: { orden: "asc" } });
  assert.deepEqual(
    filas.map((f) => f.nombre),
    ["UNESCO", "Techint", "Bloom", "UCSH", "Science Up"],
  );
  for (const fila of filas) {
    assert.equal(esquemaAliado.safeParse(publicadoDeAliado(fila)).success, true, fila.nombre ?? "");
    assert.ok(fila.publicado && fila.autorizado && fila.autorizacion, fila.nombre ?? "");
  }
});
