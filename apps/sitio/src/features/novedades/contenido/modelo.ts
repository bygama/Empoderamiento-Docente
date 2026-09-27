import { desdeTexto } from "@ed/db/slug";
import type { BorradorDeNovedad, SeccionDelCuerpo } from "./novedad";

// Lo de una novedad que no necesita Zod: las categorías, los topes, el orden
// y las anclas del cuerpo. Aparte de novedad.ts (los esquemas) porque lo leen
// también los componentes del navegador —el sitio y el formulario del admin—
// y Zod no tiene que viajar con ellos.

/**
 * Las categorías, en el orden de los filtros del sitio. Cerradas: sumar una es
 * un cambio de código (SPEC §4.2 de `work/novedades-y-kit/`). Son las de hoy;
 * ED todavía no dio otras.
 */
export const CATEGORIAS = [
  { clave: "publicaciones", etiqueta: "Publicaciones" },
  { clave: "eventos", etiqueta: "Eventos" },
  { clave: "convocatorias", etiqueta: "Convocatorias" },
  { clave: "prensa", etiqueta: "Prensa" },
  { clave: "alianzas", etiqueta: "Alianzas" },
] as const;

export type Categoria = (typeof CATEGORIAS)[number]["clave"];

/** «Publicaciones»; la clave misma si no es una de la lista (un dato viejo). */
export function etiquetaDeCategoria(clave: string): string {
  return CATEGORIAS.find((c) => c.clave === clave)?.etiqueta ?? clave;
}

/**
 * Los largos máximos, del contenido de hoy con aire: el título más largo tiene
 * 79 caracteres, la bajada 254 y el texto de una sección 480. Diez secciones
 * como mucho: hoy la nota más larga tiene tres.
 */
export const TOPES = { titulo: 100, bajada: 320, tituloDeSeccion: 80, textoDeSeccion: 2000, secciones: 10, alt: 200 } as const;

/**
 * El orden de las novedades: la más nueva primero. Las fechas van como texto
 * (`2026-08-26`, `2026-07`, `2026`) y se comparan como texto, así una fecha
 * con menos precisión queda después de las más precisas del mismo período:
 * «2025» después de «2025-05» (SPEC §7.2). Para `Array.sort`.
 */
export function compararFechas(a: string, b: string): number {
  if (a === b) return 0;
  return a > b ? -1 : 1;
}

/**
 * Las secciones del cuerpo con su ancla (`#que-estudia`), sacada del título:
 * así corregir un título no deja un link a una sección que no existe, y dos
 * secciones con el mismo título no comparten ancla.
 */
export function anclasDe(cuerpo: readonly SeccionDelCuerpo[]): Array<SeccionDelCuerpo & { ancla: string }> {
  const usadas = new Set<string>();
  return cuerpo.map((seccion) => {
    const base = desdeTexto(seccion.titulo) || "seccion";
    let ancla = base;
    for (let n = 2; usadas.has(ancla); n += 1) ancla = `${base}-${n}`;
    usadas.add(ancla);
    return { ...seccion, ancla };
  });
}

/**
 * Una novedad recién empezada: la fecha de hoy, la primera categoría y lo
 * demás vacío. `hoy` lo da quien llama (`AAAA-MM-DD`): el servidor y el
 * navegador pueden no estar en el mismo día.
 */
export function borradorVacio(hoy: string): BorradorDeNovedad {
  return {
    slug: "",
    titulo: "",
    bajada: "",
    fecha: hoy,
    categoria: CATEGORIAS[0].clave,
    imagen: { src: "", alt: "", foco: { x: 0.5, y: 0.5 } },
    cuerpo: [],
    destacada: false,
    publicacion: null,
    imagenParaRedes: null,
  };
}
