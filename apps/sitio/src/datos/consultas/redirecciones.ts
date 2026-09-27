import { puede } from "@ed/auth";
import { base } from "@/datos/cliente";
import { leerSinRomper } from "./leer-sin-romper";

// Las redirecciones (tabla `redirecciones`, work/ajustes/SPEC.md §5.1): las
// que escribe el sitio solo al cambiar un slug y las que se agregan a mano en
// Ajustes › SEO.

/**
 * Adónde lleva una ruta vieja, o `null`. La preguntan la ruta atrapa-todo del
 * sitio y la ficha de una novedad antes de dar un 404: sin base o si la
 * consulta falla en una visita, `null`, y se ve el 404 de siempre.
 */
export async function redireccionDe(ruta: string): Promise<string | null> {
  const fila = await leerSinRomper("redireccionDe", () => base.redireccion.findUnique({ where: { desde: ruta }, select: { hacia: true } }), null);
  return fila?.hacia ?? null;
}

export type FilaDeRedireccion = { id: string; desde: string; hacia: string; aMano: boolean; creadaEn: Date };

/** Todas, las más nuevas primero, para Ajustes › SEO. Sin `usarAjustes`, ninguna. */
export async function listarRedirecciones(rol: unknown): Promise<FilaDeRedireccion[]> {
  if (!puede(rol, "usarAjustes")) return [];
  return base.redireccion.findMany({ orderBy: [{ creadaEn: "desc" }, { desde: "asc" }], select: { id: true, desde: true, hacia: true, aMano: true, creadaEn: true } });
}
