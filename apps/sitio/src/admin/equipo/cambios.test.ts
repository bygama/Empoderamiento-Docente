import { test } from "node:test";
import assert from "node:assert/strict";
import type { BorradorDePersona } from "@/features/quienes-somos/contenido/persona";
import { recorridoVacio } from "@/features/quienes-somos/contenido/persona-vacia";
import { cambiosDelPerfil } from "./cambios";

const MATERIAL = "0b6f2a3e-5c1d-4e7a-9f10-2d3c4b5a6e7f";

const publicado: BorradorDePersona = {
  slug: "ana-perez",
  nombre: "Ana Pérez",
  rol: "Facilitadora",
  pais: "México",
  nivel: 4,
  foto: { src: "/equipo/ana.jpg", alt: "Ana Pérez", foco: { x: 0.5, y: 0.2 } },
  sinFoto: false,
  acercamiento: 1.1,
  recorrido: {
    ...recorridoVacio(),
    titular: "Un titular.",
    categorias: [{ clave: "investigacion", etiqueta: "Investigación", color: "azul" }],
    etapas: [
      {
        clave: "produccion",
        categoria: "investigacion",
        volanta: "Producción",
        color: "azul",
        periodo: "",
        composicion: "ramas",
        titulo: "Lo que escribió.",
        texto: "Sus trabajos.",
        cita: "",
        hitos: [],
        ramas: [],
        territorios: [],
        publicaciones: [{ origen: "biblioteca", material: MATERIAL, detalle: "", conceptos: [], destacada: false }],
      },
    ],
  },
};

test("dice qué cambió de la tarjeta y de cada etapa, con las etiquetas del formulario y el título del material", () => {
  const etapa = publicado.recorrido!.etapas[0];
  const ahora: BorradorDePersona = {
    ...publicado,
    rol: "Líder de proyecto",
    nivel: 3,
    recorrido: { ...publicado.recorrido!, etapas: [{ ...etapa, titulo: "Otro título.", publicaciones: [{ ...etapa.publicaciones[0], destacada: true }] }] },
  };
  const cambios = cambiosDelPerfil(publicado, ahora, (id) => (id === MATERIAL ? "Un artículo" : id));
  assert.deepEqual(
    cambios.map((c) => c.donde[0]),
    ["Rol", "Nivel", "Etapa 1 › Título", "Etapa 1 › Publicaciones"],
  );
  assert.deepEqual(cambios[1].despues, { tipo: "texto", texto: "Líderes de área y proyecto" });
  assert.deepEqual(cambios[3].despues, { tipo: "texto", texto: "Un artículo · destacada" });
});

test("igual a lo publicado, no hay cambios; sin recorrido, lo dice", () => {
  assert.deepEqual(cambiosDelPerfil(publicado, publicado), []);
  assert.deepEqual(cambiosDelPerfil(publicado, { ...publicado, recorrido: null })[0].despues, { tipo: "texto", texto: "Solo el perfil básico" });
});
