import type { Autoria } from "@/features/biblioteca/contenido/modelo";

// Vincular a una persona del Equipo con el autor que la nombra, cuando un
// material se agrega desde su perfil (SPEC §7.3 de `work/equipo/`). Se
// compara palabra por palabra, sin mayúsculas ni tildes: cada palabra del
// nombre corto de la persona tiene que estar, entera, entre las del autor
// («Luis Cabrera» ↔ «Luis Manuel Cabrera Chim», «Iván Pérez» ↔ «Ivan Perez»).
// Nunca por subcadena: «Ana» no es «Mariana». Pura: corre en el navegador.

/** Las palabras de un nombre, sin tildes ni mayúsculas: los guiones también separan («Reyes-Gasperini»). */
function palabrasDe(nombre: string): string[] {
  return nombre
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** Si el nombre del autor tiene, enteras, todas las palabras del de la persona. */
export function nombraA(autor: string, persona: string): boolean {
  const delAutor = new Set(palabrasDe(autor));
  const dePersona = palabrasDe(persona);
  return dePersona.length > 0 && dePersona.every((p) => delAutor.has(p));
}

/**
 * Las autorías con la persona vinculada al primer autor que la nombra, y si
 * se pudo. Si ya estaba vinculada, quedan como están; si ninguno la nombra,
 * no se agrega sola: un DOI equivocado sumaría a una autora que no es.
 */
export function vincularPersona(autorias: readonly Autoria[], persona: { id: string; nombre: string }): { autorias: Autoria[]; vinculada: boolean } {
  if (autorias.some((a) => a.persona === persona.id)) return { autorias: [...autorias], vinculada: true };
  const i = autorias.findIndex((a) => a.persona === null && nombraA(a.nombre, persona.nombre));
  if (i === -1) return { autorias: [...autorias], vinculada: false };
  return { autorias: autorias.map((a, j) => (j === i ? { ...a, persona: persona.id } : a)), vinculada: true };
}
