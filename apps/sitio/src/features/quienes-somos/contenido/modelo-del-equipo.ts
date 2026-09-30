import type { Tipo } from "@/features/biblioteca/contenido/modelo";

// Lo de una persona del Equipo que no necesita Zod (SPEC §4 y §5 de
// `work/equipo/`): los niveles, las listas cerradas, los topes y el rótulo de
// la tarjeta de una publicación. Aparte de persona.ts (los esquemas) porque lo
// leen también los componentes del navegador —el sitio y el formulario del
// admin— y Zod no tiene que viajar con ellos.

/**
 * Los cuatro niveles de la jerarquía, en el orden del sitio. `lugares` es
 * cuántas personas publicadas entran: el masthead tiene una al centro y dos a
 * los costados; los otros dos son grillas.
 */
export const NIVELES = [
  { nivel: 1, rotulo: "Dirección general", lugares: 1 },
  { nivel: 2, rotulo: "Dirección", lugares: 2 },
  { nivel: 3, rotulo: "Líderes de área y proyecto", lugares: null },
  { nivel: 4, rotulo: "Facilitación y diseño de materiales", lugares: null },
] as const;

export type Nivel = (typeof NIVELES)[number]["nivel"];
export const NUMEROS_DE_NIVEL = [1, 2, 3, 4] as const satisfies readonly Nivel[];

/** «Dirección general»: el rótulo institucional de un nivel. */
export function rotuloDelNivel(nivel: Nivel): string {
  return NIVELES[nivel - 1].rotulo;
}

/** El acento de una etapa o de una categoría: nunca un fondo (DESIGN.md). */
export const COLORES = ["verde", "azul", "naranja"] as const;
export type Color = (typeof COLORES)[number];

/** Cómo se arma una etapa del recorrido; qué usa cada una lo dice el formulario. */
export const COMPOSICIONES = ["editorial", "ficha", "concepto", "hitos", "mapa", "ramas", "sintesis"] as const;
export type Composicion = (typeof COMPOSICIONES)[number];

/** La foto del recorrido: en un marco, recortada sin fondo, o ninguna (una decisión de la persona). */
export const FIGURAS = ["marco", "recorte", "sin"] as const;
export type TipoDeFigura = (typeof FIGURAS)[number];

/** Los largos máximos y las cantidades, del contenido de hoy con aire (el de hoy, entre paréntesis en el SPEC §4.1). */
export const TOPES = {
  nombre: 30,
  rol: 60,
  pais: 30,
  alt: 200,
  nombreCompleto: 50,
  rolCompleto: 90,
  lugar: 50,
  titular: 100,
  // La bajada más larga es la de Paola Balda, con sus palabras: 463.
  intro: 480,
  formacion: 6,
  unaFormacion: 120,
  categorias: 6,
  categoria: 50,
  etapas: 8,
  volanta: 50,
  periodo: 24,
  tituloDeEtapa: 100,
  textoDeEtapa: 650,
  cita: 160,
  hitos: 8,
  tituloDeHito: 130,
  detalleDeHito: 200,
  ramas: 4,
  periodoDeRama: 16,
  lugarDeRama: 60,
  detalleDeRama: 130,
  territorios: 8,
  territorio: 70,
  publicaciones: 10,
  tituloDePublicacion: 200,
  anioDePublicacion: 16,
  detalleDePublicacion: 180,
  conceptos: 8,
  concepto: 30,
  cierreTitulo: 70,
  cierreTexto: 300,
  cierreTextoDos: 200,
} as const;

/** Cuánto se acerca la foto de una tarjeta: 1 es la foto tal cual; menos, dejaría de cubrir la tarjeta. */
export const ACERCAMIENTO = { minimo: 1, maximo: 1.5 } as const;

/** Los cuatro rótulos de la tarjeta de una publicación (SPEC §5.2): el matiz lo dice su detalle. */
export type RotuloDePublicacion = "Artículo" | "Libro" | "Materiales" | "Tesis";

const ROTULO: Record<Tipo, RotuloDePublicacion> = {
  Artículos: "Artículo",
  "Actas de congreso": "Artículo",
  Divulgación: "Artículo",
  Libros: "Libro",
  "Capítulos de libro": "Libro",
  Materiales: "Materiales",
  Tesis: "Tesis",
};

/** El rótulo que lleva en el perfil una publicación de ese tipo de la Biblioteca. */
export function rotuloDePublicacion(tipo: Tipo): RotuloDePublicacion {
  return ROTULO[tipo];
}
