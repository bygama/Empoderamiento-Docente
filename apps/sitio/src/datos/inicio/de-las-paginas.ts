import { PAGINAS, SLUGS } from "@/contenido/paginas";
import { base } from "@/datos/cliente";

// Lo que el Inicio lee de la tabla `paginas`: consultas propias, no las del
// editor, para no depender de cómo cambie él. Los nombres salen del registro
// de páginas y van en el orden del menú del sitio.

const enLista = new Intl.ListFormat("es", { type: "conjunction" });

/** Los nombres de esas páginas en el orden del menú; un slug que ya no está en el registro no se nombra. */
function nombresDe(slugs: readonly string[]): string[] {
  const buscadas = new Set(slugs);
  return SLUGS.filter((slug) => buscadas.has(slug)).map((slug) => PAGINAS[slug].nombre);
}

/** «2 páginas con cambios sin publicar» · «Inicio y Qué hacemos», o `null` si no hay ninguna. */
export async function paginasSinPublicar(): Promise<{ titulo: string; detalle: string } | null> {
  const filas = await base.pagina.findMany({ where: { borradorEn: { not: null } }, select: { slug: true } });
  const nombres = nombresDe(filas.map((f) => f.slug));
  if (!nombres.length) return null;
  const cuantas = nombres.length === 1 ? "1 página" : `${nombres.length} páginas`;
  return { titulo: `${cuantas} con cambios sin publicar`, detalle: enLista.format(nombres) };
}

/**
 * «se publicó Inicio», «se publicaron Inicio y Qué hacemos», o `null` si no
 * se publicó nada desde entonces. Cuenta la última publicación de cada
 * página, que es la que guarda la tabla.
 */
export async function paginasPublicadasDesde(desde: Date): Promise<string | null> {
  const filas = await base.pagina.findMany({ where: { publicadoEn: { gt: desde } }, select: { slug: true } });
  const nombres = nombresDe(filas.map((f) => f.slug));
  if (!nombres.length) return null;
  return `${nombres.length === 1 ? "se publicó" : "se publicaron"} ${enLista.format(nombres)}`;
}
