import { test } from "node:test";
import assert from "node:assert/strict";
import type { Novedad as Fila } from "@/../prisma/generado/client";
import { novedadesVisibles } from "./novedades";

// Qué ve el sitio de cada fila, sin base: las filas se arman acá.

const imagen = { src: "/fotos/formadora-explica.webp", alt: "Una formadora explica", foco: { x: 0.5, y: 0.5 } };

function contenido(slug: string, fecha: string, titulo = `Título de ${slug}`) {
  return { slug, titulo, bajada: "Una bajada.", fecha, categoria: "publicaciones", imagen, cuerpo: [], destacada: false, publicacion: null, imagenParaRedes: null };
}

/** Una fila publicada con ese contenido, y lo que se le pise. */
function fila(slug: string, fecha: string, otros: Partial<Fila> = {}): Fila {
  return {
    id: `id-${slug}`,
    ...contenido(slug, fecha),
    cuerpo: null,
    publicada: true,
    publicadaEn: new Date(),
    publicadaPor: null,
    borrador: null,
    borradorEn: null,
    borradorPor: null,
    creadaEn: new Date(),
    creadaPor: null,
    ...otros,
  };
}

test("fuera de la vista previa, solo las publicadas, de la más nueva a la más vieja", () => {
  const filas = [fila("vieja", "2025"), fila("oculta", "2026-09", { publicada: false }), fila("nueva", "2026-08-26"), fila("mes", "2025-05")];
  assert.deepEqual(
    novedadesVisibles(filas, false).map((n) => n.slug),
    ["nueva", "mes", "vieja"],
  );
});

test("una fila que no pasa el esquema no llega al sitio", () => {
  const rota = fila("rota", "2026", { imagen: null });
  assert.deepEqual(novedadesVisibles([rota, fila("sana", "2026")], false).map((n) => n.slug), ["sana"]);
});

test("en la vista previa, cada una como quedaría al publicarla", () => {
  const filas = [
    // Publicada con un borrador que se puede publicar: se ve el borrador.
    fila("con-cambios", "2026-03", { borrador: contenido("con-cambios", "2026-03", "Título nuevo") }),
    // Publicada con un borrador a medias: se ve como está publicada.
    fila("a-medias", "2026-02", { borrador: { ...contenido("a-medias", "2026-02"), titulo: "" } }),
    // Nunca publicada, con un borrador completo: se ve.
    fila("nueva", "2026-01", { publicada: false, slug: null, titulo: null, borrador: contenido("nueva", "2026-01") }),
    // Despublicada y sin borrador: no se ve.
    fila("despublicada", "2025", { publicada: false }),
  ];
  const vistas = novedadesVisibles(filas, true);
  assert.deepEqual(
    vistas.map((n) => [n.slug, n.titulo]),
    [
      ["con-cambios", "Título nuevo"],
      ["a-medias", "Título de a-medias"],
      ["nueva", "Título de nueva"],
    ],
  );
});

test("el cuerpo llega con el ancla de cada sección", () => {
  const conCuerpo = fila("nota", "2026", { cuerpo: [{ titulo: "Qué estudia", parrafos: ["Un párrafo."] }] });
  const [nota] = novedadesVisibles([conCuerpo], false);
  assert.deepEqual(nota.cuerpo, [{ titulo: "Qué estudia", parrafos: ["Un párrafo."], ancla: "que-estudia" }]);
});
