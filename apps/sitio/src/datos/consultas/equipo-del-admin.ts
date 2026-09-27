import { base } from "@/datos/cliente";

// Lo que el resto del admin lee del Equipo (SPEC §7 y §10 de `work/equipo/`):
// qué perfiles de la actividad siguen existiendo, para linkearlos.

/** De esos ids, los que siguen siendo un perfil (uno borrado no tiene ficha adonde llevar). */
export async function perfilesQueExisten(ids: readonly string[]): Promise<Set<string>> {
  if (!ids.length) return new Set();
  const filas = await base.persona.findMany({ where: { id: { in: [...ids] } }, select: { id: true } });
  return new Set(filas.map((f) => f.id));
}
