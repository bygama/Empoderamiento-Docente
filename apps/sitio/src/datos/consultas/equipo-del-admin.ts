import { nombreDe } from "@/datos/acciones/equipo-en-base";
import { base } from "@/datos/cliente";
import { comoDocumento } from "@/lib/contenido/documento";

// Lo que el resto del admin lee del Equipo (SPEC §7 y §10 de `work/equipo/`):
// qué perfiles de la actividad siguen existiendo, para linkearlos, y la
// persona que «Agregar en Biblioteca» trae elegida como autora.

/** La autora que llega de su perfil: su id, el nombre corto (para reconocerla entre los autores) y el completo (para firmar). */
export type PersonaParaAutoria = { id: string; nombre: string; nombreCompleto: string };

export async function personaParaAutoria(id: string): Promise<PersonaParaAutoria | null> {
  const fila = await base.persona.findUnique({ where: { id }, select: { id: true, nombre: true, nombreCompleto: true, borrador: true } });
  if (!fila) return null;
  const delBorrador = comoDocumento(comoDocumento(fila.borrador).recorrido).nombreCompleto;
  const nombre = nombreDe(fila);
  const completo = fila.nombreCompleto ?? (typeof delBorrador === "string" && delBorrador.trim() ? delBorrador.trim() : nombre);
  return { id: fila.id, nombre, nombreCompleto: completo };
}

/** De esos ids, los que siguen siendo un perfil (uno borrado no tiene ficha adonde llevar). */
export async function perfilesQueExisten(ids: readonly string[]): Promise<Set<string>> {
  if (!ids.length) return new Set();
  const filas = await base.persona.findMany({ where: { id: { in: [...ids] } }, select: { id: true } });
  return new Set(filas.map((f) => f.id));
}
