import { test } from "node:test";
import assert from "node:assert/strict";
import type { Material as Fila } from "@/../prisma/generado/client";
import { filasDeLaLista } from "./lista-de-materiales";

// La lista de la Biblioteca en el admin, sin base: las filas se arman acá.

let orden = 0;
const portada = { src: "/biblioteca/portadas/x.webp", alt: "Portada", foco: { x: 0.5, y: 0.5 } };

function fila(titulo: string, otros: Partial<Fila> = {}): Fila & { autorias: Array<{ nombre: string; persona: string | null }> } {
  orden += 1;
  return {
    id: `id-${titulo}`,
    titulo,
    autores: null,
    descripcion: "Una descripción.",
    tipo: "Artículos",
    tema: "Geometría",
    publico: "Docentes",
    fecha: "2025",
    formato: "PDF",
    paginas: null,
    portada,
    url: "https://ejemplo.org",
    fuente: "RELIME",
    doi: null,
    cita: null,
    destacado: null,
    rotulo: null,
    frase: null,
    detalle: null,
    publicado: true,
    publicadoEn: new Date(),
    publicadoPor: null,
    borrador: null,
    borradorEn: null,
    borradorPor: null,
    creadoEn: new Date(Date.UTC(2026, 0, 1, 0, 0, 0, orden)),
    creadoPor: null,
    chequeoEn: null,
    chequeo: null,
    chequeoDetalle: null,
    autorias: [{ nombre: "Ana Pérez", persona: null }],
    ...otros,
  };
}

const filas = [
  fila("Publicado"),
  fila("Roto", { chequeo: "roto", fecha: "2026" }),
  fila("Con cambios", { borrador: { titulo: "Con cambios, nuevo", tipo: "Libros", fecha: "2024", autorias: [{ nombre: "Beto Díaz" }], descripcion: "" } }),
  fila("Oculto", { publicado: false, portada: null }),
  fila("Nuevo", { publicado: false, publicadoEn: null, titulo: null, borrador: { titulo: "Recién empezado", autorias: [], fecha: "" } }),
];

test("cada fila, como se edita: su estado, su salud y la firma", () => {
  const lista = filasDeLaLista(filas, {});
  const por = (titulo: string) => lista.find((f) => f.titulo === titulo);
  assert.deepEqual(lista.map((f) => f.titulo), ["Recién empezado", "Roto", "Publicado", "Oculto", "Con cambios, nuevo"]);
  assert.deepEqual([por("Publicado")?.estado, por("Roto")?.estado, por("Con cambios, nuevo")?.estado, por("Oculto")?.estado, por("Recién empezado")?.estado], ["publicado", "publicado", "con-cambios", "oculto", "sin-publicar"]);
  assert.deepEqual(por("Roto")?.salud, ["link-roto"]);
  assert.deepEqual(por("Oculto")?.salud, ["sin-portada"]);
  assert.deepEqual(por("Con cambios, nuevo")?.salud, ["sin-portada", "incompletos"]);
  assert.deepEqual([por("Con cambios, nuevo")?.autores, por("Con cambios, nuevo")?.tipo, por("Con cambios, nuevo")?.anio], ["Beto Díaz", "Libros", "2024"]);
});

test("los filtros y la búsqueda sin tildes", () => {
  const titulos = (f: Parameters<typeof filasDeLaLista>[1]) => filasDeLaLista(filas, f).map((x) => x.titulo);
  assert.deepEqual(titulos({ estado: "oculto" }), ["Recién empezado", "Oculto"]);
  assert.deepEqual(titulos({ tipo: "Libros" }), ["Con cambios, nuevo"]);
  assert.deepEqual(titulos({ salud: "link-roto" }), ["Roto"]);
  assert.deepEqual(titulos({ q: "DIAZ" }), ["Con cambios, nuevo"]);
  assert.deepEqual(titulos({ q: "relime", estado: "publicado", salud: "link-roto" }), ["Roto"]);
});
