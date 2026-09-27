import { test } from "node:test";
import assert from "node:assert/strict";
import type { Aliado as Fila } from "@/../prisma/generado/client";
import { aliadosVisibles } from "./aliados";

// AGENTS.md §5.4: sin la marca `autorizado`, un logo no se publica nunca, y la
// marca vale solo para el logo y el nombre que se autorizaron. La consulta del
// sitio lo garantiza, también en la vista previa.

const logo = (src: string, alt = "Un logo") => ({ src, alt, foco: { x: 0.5, y: 0.5 } });

function fila(parcial: Partial<Fila> & { id: string; orden: number }): Fila {
  return {
    nombre: "Aliado",
    logo: logo(`/aliados/${parcial.id}.png`),
    tamano: "chico",
    url: null,
    publicado: true,
    publicadoEn: new Date(),
    publicadoPor: null,
    borrador: null,
    borradorEn: null,
    borradorPor: null,
    autorizado: true,
    autorizacion: "La carpeta de ED",
    autorizadoLogo: `/aliados/${parcial.id}.png`,
    autorizadoNombre: "Aliado",
    autorizadoEn: new Date(),
    autorizadoPor: null,
    creadoEn: new Date(),
    creadoPor: null,
    ...parcial,
  };
}

const fotos = ["a", "b", "c", "d"].map((id) => ({ url: `/aliados/${id}.png`, ancho: 800, alto: 200, tipo: "image/png" }));

test("un aliado publicado sin la marca no sale nunca, ni en la vista previa con un borrador válido", () => {
  const sinMarca = fila({ id: "b", orden: 1, autorizado: false, borrador: { nombre: "B", logo: logo("/aliados/b.png"), tamano: "grande", url: "" } });
  for (const enVistaPrevia of [false, true]) assert.deepEqual(aliadosVisibles([sinMarca], fotos, enVistaPrevia), [], String(enVistaPrevia));
});

test("salen los publicados y autorizados, en el orden de la tira, con las medidas de su foto", () => {
  const filas = [fila({ id: "b", orden: 2, url: "https://b.org" }), fila({ id: "a", orden: 1 }), fila({ id: "c", orden: 3, publicado: false })];
  assert.deepEqual(aliadosVisibles(filas, fotos, false), [
    { id: "a", src: "/aliados/a.png", alt: "Un logo", ancho: 800, alto: 200, vectorial: false, tamano: "chico", url: null },
    { id: "b", src: "/aliados/b.png", alt: "Un logo", ancho: 800, alto: 200, vectorial: false, tamano: "chico", url: "https://b.org" },
  ]);
});

test("en la vista previa, uno autorizado sin publicar sale con su borrador si se puede publicar", () => {
  const borrador = { nombre: "D", logo: logo("/aliados/d.png", "D"), tamano: "grande", url: "" };
  const nuevo = fila({ id: "d", orden: 4, publicado: false, borrador, autorizadoNombre: "D" });
  assert.deepEqual(aliadosVisibles([nuevo], fotos, false), []);
  assert.deepEqual(aliadosVisibles([nuevo], fotos, true).map((a) => [a.id, a.alt, a.tamano]), [["d", "D", "grande"]]);
  // Un borrador que todavía no se puede publicar no se ve.
  assert.deepEqual(aliadosVisibles([fila({ id: "d", orden: 4, publicado: false, borrador: { ...borrador, nombre: "" }, autorizadoNombre: "D" })], fotos, true), []);
});

test("un logo que no está en Fotos no se dibuja, y un SVG va sin optimizar", () => {
  const svg = { url: "/aliados/t.svg", ancho: 147, alto: 195, tipo: "image/svg+xml" };
  const filas = [fila({ id: "t", orden: 1, logo: logo("/aliados/t.svg"), autorizadoLogo: "/aliados/t.svg" }), fila({ id: "z", orden: 2, logo: logo("/aliados/no-esta.png"), autorizadoLogo: "/aliados/no-esta.png" })];
  assert.deepEqual(
    aliadosVisibles(filas, [svg], false).map((a) => [a.id, a.vectorial]),
    [["t", true]],
  );
});

test("columnas publicadas con otro logo u otro nombre que los autorizados no salen, aunque la marca esté puesta", () => {
  // Escritas directo en la base, sin pasar por publicar: la consulta igual no las muestra.
  const otroLogo = fila({ id: "a", orden: 1, logo: logo("/aliados/b.png") });
  const otroNombre = fila({ id: "c", orden: 2, nombre: "Ministerio de Educación" });
  for (const enVistaPrevia of [false, true]) assert.deepEqual(aliadosVisibles([otroLogo, otroNombre], fotos, enVistaPrevia), [], String(enVistaPrevia));
});

test("la vista previa no muestra un borrador que le cambió el nombre y el logo a uno autorizado", () => {
  // El escenario de la revisión: sobre UNESCO, ya autorizado, un borrador con otro nombre y otra foto.
  const unesco = fila({ id: "a", orden: 1, nombre: "UNESCO", autorizadoNombre: "UNESCO", borrador: { nombre: "Ministerio de Educación", logo: logo("/aliados/b.png"), tamano: "chico", url: "" } });
  assert.deepEqual(aliadosVisibles([unesco], fotos, true), []);
  // Fuera de la vista previa sigue lo publicado, que es lo autorizado.
  assert.deepEqual(aliadosVisibles([unesco], fotos, false).map((a) => a.src), ["/aliados/a.png"]);
});

test("cambiar solo la URL o el tamaño no toca la autorización: el borrador se ve en la vista previa", () => {
  const conOtraUrl = fila({ id: "a", orden: 1, borrador: { nombre: "Aliado", logo: logo("/aliados/a.png"), tamano: "grande", url: "https://a.org" } });
  assert.deepEqual(aliadosVisibles([conOtraUrl], fotos, true).map((a) => [a.tamano, a.url]), [["grande", "https://a.org"]]);
});
