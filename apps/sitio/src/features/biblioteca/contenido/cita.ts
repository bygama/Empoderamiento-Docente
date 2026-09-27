import { linkDelDoi } from "@/lib/metadatos/doi";

// La cita APA 7 de un material, en castellano y en texto plano (SPEC §8.4 de
// `work/biblioteca/`). Es la «generada»: la que va cuando nadie escribió otra.
// Los apellidos son exactos si la fuente los separa (Crossref); si no, se
// deducen del nombre, y una persona puede escribir la cita a mano.

/** Quien firma. `apellidos` y `nombres`, cuando la fuente los da separados. */
export type AutorDeLaCita = { nombre: string; apellidos?: string; nombres?: string };

export type DatosDeLaCita = {
  autores: readonly AutorDeLaCita[];
  /** `AAAA` o `AAAA-MM`; vacía, «s. f.». */
  fecha: string;
  titulo: string;
  fuente: string;
  volumen?: string;
  numero?: string;
  paginas?: string;
  /** Normalizado (`10.1590/abc`); vacío si no tiene. */
  doi: string;
  /** El link completo, si no hay DOI; vacío si no hay uno que sirva afuera del sitio. */
  url: string;
};

// Lo que va pegado al apellido que le sigue: «de la Cruz», «van Dijk».
const PARTICULAS = new Set(["de", "del", "la", "las", "los", "y", "van", "von", "da", "das", "do", "dos", "di", "der", "le"]);

/** Las palabras del nombre, con cada partícula pegada a la palabra que la sigue. */
function grupos(nombre: string): string[] {
  const salida: string[] = [];
  let pendiente = "";
  for (const palabra of nombre.trim().split(/\s+/).filter(Boolean)) {
    if (PARTICULAS.has(palabra.toLowerCase())) pendiente = `${pendiente}${palabra} `;
    else {
      salida.push(`${pendiente}${palabra}`);
      pendiente = "";
    }
  }
  return pendiente ? [...salida, pendiente.trim()] : salida;
}

/**
 * Apellidos y nombres de un nombre entero, cuando la fuente no los separa. Con
 * dos palabras, la última; con tres, las dos últimas, salvo que la última sea
 * un apellido compuesto con guion («Ma. Guadalupe Corona-Galindo»); con cuatro
 * o más, las dos últimas. Puede errar: la cita se puede escribir a mano.
 */
export function partirNombre(nombre: string): { apellidos: string; nombres: string } {
  const g = grupos(nombre);
  if (g.length < 2) return { apellidos: g.join(" "), nombres: "" };
  const cuantos = g.length === 2 || (g.length === 3 && g[2].includes("-")) ? 1 : 2;
  return { apellidos: g.slice(-cuantos).join(" "), nombres: g.slice(0, -cuantos).join(" ") };
}

/** «Luis Manuel» → «L. M.»; «Jean-Paul» → «J.-P.»; «Ma. Guadalupe» → «M. G.». */
export function iniciales(nombres: string): string {
  const inicial = (parte: string) => `${parte.charAt(0).toLocaleUpperCase("es")}.`;
  return nombres
    .split(/\s+/)
    .filter(Boolean)
    .map((palabra) => palabra.split("-").filter(Boolean).map(inicial).join("-"))
    .join(" ");
}

/** «Reyes-Gasperini, D.» */
function autorApa(autor: AutorDeLaCita): string {
  const partes = autor.apellidos ? { apellidos: autor.apellidos, nombres: autor.nombres ?? "" } : partirNombre(autor.nombre);
  const letras = iniciales(partes.nombres);
  return letras ? `${partes.apellidos}, ${letras}` : partes.apellidos;
}

/** La lista de APA 7: «A», «A y B», «A, B y C»; con más de 20, las 19 primeras, «…» y la última. */
function autoresApa(autores: readonly AutorDeLaCita[]): string {
  const todos = autores.filter((a) => a.nombre.trim() || a.apellidos).map(autorApa);
  if (todos.length <= 1) return todos.join("");
  if (todos.length > 20) return `${todos.slice(0, 19).join(", ")}, … ${todos[todos.length - 1]}`;
  return `${todos.slice(0, -1).join(", ")} y ${todos[todos.length - 1]}`;
}

/** Un texto con su punto final, salvo que ya cierre con uno, con «?» o con «!». */
const conPunto = (texto: string) => (/[.?!]$/.test(texto) ? texto : `${texto}.`);

/** La cita APA 7, en castellano: «Apellido, I. y Apellido, I. (2025). Título. Fuente, 28(1), 1–39. https://doi.org/…». */
export function citaApa(d: DatosDeLaCita): string {
  const anio = d.fecha.slice(0, 4);
  const donde = [d.fuente.trim(), d.volumen ? `${d.volumen}${d.numero ? `(${d.numero})` : ""}` : "", d.paginas ?? ""].filter(Boolean).join(", ");
  const link = d.doi ? linkDelDoi(d.doi) : d.url;
  const autores = autoresApa(d.autores);
  return [
    autores ? conPunto(autores) : "",
    anio ? `(${anio}).` : "(s. f.).",
    d.titulo.trim() ? conPunto(d.titulo.trim()) : "",
    donde ? conPunto(donde) : "",
    link,
  ]
    .filter(Boolean)
    .join(" ");
}
