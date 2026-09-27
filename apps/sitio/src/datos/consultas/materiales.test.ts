import { test } from "node:test";
import assert from "node:assert/strict";
import { destacadosDe, materialDelSitio } from "@/features/biblioteca/contenido/del-sitio";
import { materialesVisibles, type FilaConAutorias } from "./materiales";

// Qué ve el sitio de cada fila, sin base: las filas se arman acá.

let orden = 0;

/** Una fila publicada, con una autoría, y lo que se le pise. */
function fila(titulo: string, fecha: string, otros: Partial<FilaConAutorias> = {}): FilaConAutorias {
  orden += 1;
  return {
    id: `id-${titulo}`,
    titulo,
    autores: null,
    descripcion: "Una descripción.",
    tipo: "Artículos",
    tema: "Geometría",
    publico: "Docentes",
    fecha,
    formato: "PDF",
    paginas: null,
    portada: null,
    url: "https://ejemplo.org/a",
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
    creadoEn: new Date(Date.UTC(2026, 8, 27, 0, 0, 0, orden)),
    creadoPor: null,
    chequeoEn: null,
    chequeo: null,
    chequeoDetalle: null,
    autorias: [{ materialId: `id-${titulo}`, orden: 0, nombre: "Karla Pacheco López", personaId: null }],
    ...otros,
  };
}

test("solo los publicados, por año y dentro de un año en el orden de carga", () => {
  const filas = [fila("a", "2025"), fila("b", "2026"), fila("oculto", "2026", { publicado: false }), fila("c", "2025-12"), fila("d", "2026-01")];
  assert.deepEqual(
    materialesVisibles(filas, false).map((v) => v.material.titulo),
    ["b", "d", "a", "c"],
  );
});

test("una fila que no pasa no llega; en vista previa, el borrador que se puede publicar", () => {
  const roto = fila("roto", "2026", { tipo: "Novela" });
  const conBorrador = fila("viejo", "2025", { borrador: { ...documentoCompleto("nuevo") } });
  const nunca = fila("nunca", "2025", { publicado: false, publicadoEn: null, borrador: documentoCompleto("en preparación") });
  assert.deepEqual(materialesVisibles([roto, conBorrador, nunca], false).map((v) => v.material.titulo), ["viejo"]);
  assert.deepEqual(materialesVisibles([roto, conBorrador, nunca], true).map((v) => v.material.titulo), ["nuevo", "en preparación"]);
});

test("para el sitio: la firma de las autorías, la fecha que se lee, la portada generada y la cita", () => {
  const [visible] = materialesVisibles([fila("Un título", "2025-12")], false);
  const m = materialDelSitio(visible.material, visible.id);
  assert.equal(m.autores, "Karla Pacheco López");
  assert.equal(m.fecha, "Dic 2025");
  assert.equal(m.anio, 2025);
  assert.equal(m.portada.src, "/biblioteca/portada/id-Un título");
  assert.equal(m.cita, "Pacheco López, K. (2025). Un título. RELIME. https://ejemplo.org/a");
  const conPdf = materialDelSitio({ ...visible.material, url: "/biblioteca/tesis.pdf" }, "x");
  assert.match(conPdf.cita, /https:\/\/empoderamientodocente\.org\/biblioteca\/tesis\.pdf$/);
});

test("los destacados, en su lugar y uno por lugar", () => {
  const conTextos = { rotulo: "R", frase: "F", detalle: "D" };
  const visibles = materialesVisibles(
    [fila("tres", "2025", { destacado: 3, ...conTextos }), fila("uno", "2025", { destacado: 1, ...conTextos }), fila("otro uno", "2024", { destacado: 1, ...conTextos }), fila("nada", "2025")],
    false,
  );
  assert.deepEqual(destacadosDe(visibles).map((d) => d.material.titulo), ["uno", "tres"]);
});

/** Un documento de borrador completo, con ese título. */
function documentoCompleto(titulo: string) {
  return {
    titulo,
    autorias: [{ nombre: "Ana Pérez", persona: null }],
    autores: "",
    descripcion: "",
    tipo: "Libros",
    tema: "Geometría",
    publico: "Docentes",
    fecha: "2026",
    formato: "Web",
    paginas: null,
    portada: null,
    url: "https://ejemplo.org/b",
    fuente: "Editorial",
    doi: "",
    cita: "",
    destacado: null,
    rotulo: "",
    frase: "",
    detalle: "",
  };
}
