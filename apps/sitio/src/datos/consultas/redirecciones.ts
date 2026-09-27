import { puede } from "@ed/auth";
import { base } from "@/datos/cliente";

// Las redirecciones (tabla `redirecciones`, work/ajustes/SPEC.md §5.1): las
// que escribe el sitio solo al cambiar un slug y las que se agregan a mano en
// Ajustes › SEO.

/**
 * Adónde lleva una ruta vieja, o `null`. La pregunta la ruta atrapa-todo del
 * sitio antes de dar un 404, así que **nunca tira**: sin base o si la
 * consulta falla, `null`, y la visita ve el 404 de siempre.
 */
export async function redireccionDe(ruta: string): Promise<string | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    return (await base.redireccion.findUnique({ where: { desde: ruta }, select: { hacia: true } }))?.hacia ?? null;
  } catch (e) {
    console.error("redireccionDe:", e instanceof Error ? e.message : e);
    return null;
  }
}

export type FilaDeRedireccion = { id: string; desde: string; hacia: string; aMano: boolean; creadaEn: Date };

/** Todas, las más nuevas primero, para Ajustes › SEO. Sin `usarAjustes`, ninguna. */
export async function listarRedirecciones(rol: unknown): Promise<FilaDeRedireccion[]> {
  if (!puede(rol, "usarAjustes")) return [];
  return base.redireccion.findMany({ orderBy: [{ creadaEn: "desc" }, { desde: "asc" }], select: { id: true, desde: true, hacia: true, aMano: true, creadaEn: true } });
}
