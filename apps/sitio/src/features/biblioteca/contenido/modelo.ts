import type { BorradorDeMaterial } from "./material";

// Lo de un material que no necesita Zod: las listas cerradas, los topes, la
// fecha y la firma como las muestra el sitio, y el borrador vacío (SPEC §5 de
// `work/biblioteca/`). Aparte de material.ts (los esquemas) porque lo leen
// también los componentes del navegador —el catálogo y el formulario del
// admin— y Zod no tiene que viajar con ellos.

/** Los tipos, en el orden de los filtros del sitio y del menú. Cerrados: sumar uno es un cambio de código. */
export const TIPOS = ["Artículos", "Capítulos de libro", "Libros", "Tesis", "Actas de congreso", "Divulgación", "Materiales"] as const;
export type Tipo = (typeof TIPOS)[number];

export const TEMAS = [
  "Desarrollo profesional docente",
  "Pensamiento variacional",
  "Pensamiento proporcional",
  "Geometría",
  "Álgebra y lenguaje matemático",
  "Tecnología y modelación",
  "Estadística y probabilidad",
  "Historia y epistemología",
  "Ciudadanía y justicia social",
  "Resolución de problemas",
  "Divulgación científica",
] as const;
export type Tema = (typeof TEMAS)[number];

export const PUBLICOS = ["Docentes", "Formadoras y formadores", "Equipos directivos", "Investigadoras e investigadores"] as const;
export type Publico = (typeof PUBLICOS)[number];

/** «Web» es una página sin archivo: una nota, la ficha de una librería, una colección para descargar. */
export const FORMATOS = ["PDF", "ZIP", "Video", "Web"] as const;
export type Formato = (typeof FORMATOS)[number];

/** Los lugares de «Material destacado»: la coreografía de la sección está pensada para cuatro. */
export const LUGARES_DE_DESTACADO = [1, 2, 3, 4] as const;
export type Lugar = (typeof LUGARES_DE_DESTACADO)[number];

/** Los largos máximos, del contenido de hoy con aire (el título más largo tiene 158, la descripción 373). */
export const TOPES = {
  titulo: 200,
  firma: 200,
  autor: 120,
  autores: 30,
  descripcion: 500,
  fuente: 80,
  url: 500,
  cita: 600,
  rotulo: 20,
  frase: 70,
  detalle: 320,
  paginas: 5000,
  alt: 200,
} as const;

/** Quien firma: el nombre como figura en la publicación y, si es de ED, la clave de su perfil del Equipo. */
export type Autoria = { nombre: string; persona: string | null };

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/** La fecha como la muestra el sitio: «Dic 2025» o «2026». */
export function fechaDelSitio(fecha: string): string {
  const [anio, mes] = fecha.split("-");
  return mes ? `${MESES[Number(mes) - 1]} ${anio}` : anio;
}

/** El año de una fecha (`2025-12` → 2025): el del filtro y el del orden. */
export function anioDe(fecha: string): number {
  return Number(fecha.slice(0, 4));
}

const EN_LISTA = new Intl.ListFormat("es", { type: "conjunction" });

/**
 * Cómo se lee quién firma: la firma escrita, si el material la tiene (las que
 * no son una lista, como «… (editores)»), o los nombres unidos, «A, B y C»,
 * que ya pone «e Iván» (DECISIONS, C).
 */
export function firmaDe({ autores, autorias }: { autores: string | null; autorias: readonly Pick<Autoria, "nombre">[] }): string {
  const escrita = autores?.trim();
  return escrita || EN_LISTA.format(autorias.map((a) => a.nombre.trim()).filter(Boolean));
}

/**
 * La etiqueta de la acción: dice adónde lleva. Un PDF propio se abre acá; lo
 * demás se lee en la revista o la editorial que lo publicó, salvo las páginas
 * sin archivo (una nota, la ficha de una librería), que se «ven».
 */
export function accionDe({ url, formato, fuente }: { url: string; formato: string; fuente: string }): string {
  if (url.startsWith("/")) return "Abrir el PDF";
  return formato === "Web" ? `Ver en ${fuente}` : `Leer en ${fuente}`;
}

/** Un material recién empezado: todo vacío, sin tipo, tema ni público elegidos. */
export function borradorVacio(): BorradorDeMaterial {
  return {
    titulo: "",
    autorias: [],
    autores: "",
    descripcion: "",
    tipo: "",
    tema: "",
    publico: "",
    fecha: "",
    formato: "",
    paginas: null,
    portada: null,
    url: "",
    fuente: "",
    doi: "",
    cita: "",
    destacado: null,
    rotulo: "",
    frase: "",
    detalle: "",
  };
}
