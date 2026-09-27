import { test } from "node:test";
import assert from "node:assert/strict";
import type { Persona as Fila, Prisma } from "@/../prisma/generado/client";
import type { MaterialDelSitio } from "@/features/biblioteca/contenido/material";
import { personaDelSitio } from "@/features/quienes-somos/contenido/del-sitio";
import type { Etapa, Persona } from "@/features/quienes-somos/contenido/persona";
import { firmadosPorPersona, personasVisibles } from "./equipo";

// Qué ve el sitio del Equipo, sin base: las filas se arman acá.

const FIRMADO = "0b6f2a3e-5c1d-4e7a-9f10-2d3c4b5a6e7f";
const AJENO = "1c7e3b4f-6d2e-4f8b-8a21-3e4d5c6b7a80";

const etapa: Etapa = {
  clave: "produccion",
  categoria: "investigacion",
  volanta: "Escribir",
  color: "azul",
  periodo: "",
  composicion: "ramas",
  titulo: "La producción.",
  texto: "Sus trabajos.",
  cita: "",
  hitos: [],
  ramas: [],
  territorios: [],
  publicaciones: [
    { origen: "biblioteca", material: FIRMADO, detalle: "", conceptos: [], destacada: true },
    { origen: "biblioteca", material: AJENO, detalle: "Con alguien", conceptos: [], destacada: false },
    { origen: "sin-link", titulo: "Un libro sin link", tipo: "Capítulos de libro", anio: "2015 – 2017", detalle: "Capítulo — Otro libro", conceptos: [], destacada: false },
  ],
};

function doc(nombre: string, nivel: 1 | 2 | 3 | 4): Persona {
  return {
    slug: nombre.toLowerCase().replace(/\s+/g, "-"),
    nombre,
    rol: "Facilitadora",
    pais: "México",
    nivel,
    foto: { src: "/equipo/a.jpg", alt: nombre, foco: { x: 0.5, y: 0.2 } },
    sinFoto: false,
    acercamiento: 1.1,
    recorrido: {
      nombreCompleto: `${nombre} Completa`,
      rolCompleto: "Facilitadora y diseñadora",
      lugar: "Mérida",
      origen: "",
      titular: "Un titular.",
      intro: "Una bajada.",
      formacion: [],
      categorias: [{ clave: "investigacion", etiqueta: "Investigación", color: "azul" }],
      figura: { tipo: "marco", foto: { src: "/equipo/a.jpg", alt: `${nombre} Completa`, foco: { x: 0.5, y: 0.2 } }, apaisado: false },
      etapas: [etapa],
      cierre: { titulo: "Cierre.", texto: "Un cierre.", textoDos: "" },
    },
  };
}

/** Una fila publicada con las columnas del documento, y lo que se le pise. */
function fila(d: Persona, orden: number, otros: Partial<Fila> = {}): Fila {
  const r = d.recorrido;
  const json = (v: unknown) => v as Prisma.JsonValue;
  return {
    id: `id-${d.slug}`,
    slug: d.slug,
    nombre: d.nombre,
    rol: d.rol,
    pais: d.pais,
    nivel: d.nivel,
    foto: json(d.foto),
    sinFoto: d.sinFoto,
    acercamiento: d.acercamiento,
    orden,
    nombreCompleto: r?.nombreCompleto ?? null,
    rolCompleto: r?.rolCompleto ?? null,
    lugar: r?.lugar ?? null,
    origen: r?.origen || null,
    titular: r?.titular ?? null,
    intro: r?.intro ?? null,
    formacion: json(r?.formacion ?? null),
    categorias: json(r?.categorias ?? null),
    figura: json(r?.figura ?? null),
    etapas: json(r?.etapas ?? null),
    cierreTitulo: r?.cierre.titulo ?? null,
    cierreTexto: r?.cierre.texto ?? null,
    cierreTexto2: r?.cierre.textoDos || null,
    publicado: true,
    publicadoEn: new Date(),
    publicadoPor: null,
    borrador: null,
    borradorEn: null,
    borradorPor: null,
    creadoEn: new Date(),
    creadoPor: null,
    ...otros,
  };
}

test("solo las publicadas, por nivel y dentro de un nivel por su lugar", () => {
  const filas = [fila(doc("Lucia", 3), 1), fila(doc("Ana", 3), 0), fila(doc("Dora", 1), 0), fila(doc("Oculta", 2), 0, { publicado: false })];
  assert.deepEqual(personasVisibles(filas, false).map((v) => v.persona.nombre), ["Dora", "Ana", "Lucia"]);
});

test("en vista previa, el borrador que se puede publicar; uno a medias no pisa lo publicado", () => {
  const conBorrador = fila(doc("Ana", 3), 0, { borrador: doc("Ana Nueva", 3) });
  const aMedias = fila(doc("Bea", 3), 1, { borrador: { ...doc("Bea", 3), nombre: "" } });
  assert.deepEqual(personasVisibles([conBorrador, aMedias], true).map((v) => v.persona.nombre), ["Ana Nueva", "Bea"]);
  assert.deepEqual(personasVisibles([conBorrador, aMedias], false).map((v) => v.persona.nombre), ["Ana", "Bea"]);
});

test("una publicación sale del material que el sitio muestra y la persona firma; la sin link, tal cual", () => {
  const material = { id: FIRMADO, titulo: "Un artículo", tipo: "Actas de congreso", anio: 2020, url: "https://doi.org/10.1/x", fuente: "CIAEM" } as MaterialDelSitio;
  const firmados = firmadosPorPersona([material], [
    { materialId: FIRMADO, personaId: "id-ana" },
    { materialId: AJENO, personaId: "id-ana" },
  ]).get("id-ana");
  const perfil = personaDelSitio(doc("Ana", 3), firmados ?? new Map()).profile;
  // El AJENO no está entre lo que el sitio muestra: su tarjeta no sale.
  assert.deepEqual(perfil?.stages[0].publications, [
    { year: "2020", kind: "Artículo", title: "Un artículo", meta: "CIAEM", url: "https://doi.org/10.1/x", concepts: undefined, featured: true },
    { year: "2015 – 2017", kind: "Libro", title: "Un libro sin link", meta: "Capítulo — Otro libro", concepts: undefined, featured: undefined },
  ]);
});

test("la tarjeta lleva su foto encuadrada, o ninguna si la persona pidió no publicarla", () => {
  assert.deepEqual(personaDelSitio(doc("Ana", 3), new Map()).foto, { src: "/equipo/a.jpg", alt: "Ana", posicion: "50% 20%" });
  assert.equal(personaDelSitio({ ...doc("Ana", 3), sinFoto: true }, new Map()).foto, null);
});
