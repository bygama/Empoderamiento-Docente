import { PAGINAS, type Slug } from "@/contenido/paginas";
import { base } from "@/datos/cliente";
import { compararSeccion, type Diferencia } from "@/lib/contenido/comparar";
import { describir } from "@/lib/contenido/describir";
import { comoDocumento, completarPagina, partesDe } from "@/lib/contenido/documento";
import { estadoDe, type EstadoDePagina } from "./editor-de-paginas";

// Lo que leen las pestañas «Qué cambió» y «Versiones» del editor (SPEC §3 y
// §4 de `work/paginas-inicio/`). Las fechas viajan como ISO, como en el editor.

/** La página tal como la muestra el encabezado de una pestaña que no edita. */
export type PaginaEnRevision = { slug: Slug; nombre: string; ruta: string; estado: EstadoDePagina };

/** Las diferencias de una parte del documento (una sección o el SEO), con su nombre. */
export type CambiosDeUnaParte = { clave: string; nombre: string; diferencias: Diferencia[] };

/**
 * El borrador guardado contra lo publicado, parte por parte y campo por
 * campo. Se comparan los documentos completos —con el contenido inicial donde
 * falta una parte—, que es lo que el sitio muestra de verdad: una sección que
 * se edita por primera vez se compara contra el inicial. Sin borrador, no hay
 * diferencias.
 */
export async function cambiosDe(slug: Slug): Promise<{ pagina: PaginaEnRevision; cambios: CambiosDeUnaParte[] }> {
  const registrada = PAGINAS[slug];
  const fila = await base.pagina.findUnique({ where: { slug } });
  const publicado = completarPagina(registrada, comoDocumento(fila?.publicado));
  const borrador = fila?.borrador ? completarPagina(registrada, comoDocumento(fila.borrador)) : publicado;
  const cambios = partesDe(registrada)
    .map(([clave, parte]) => ({ clave, nombre: parte.nombre, diferencias: compararSeccion(describir(parte.esquema, parte.nombre), publicado[clave], borrador[clave]) }))
    .filter((c) => c.diferencias.length > 0);
  return { pagina: { slug, nombre: registrada.nombre, ruta: registrada.ruta, estado: estadoDe(fila) }, cambios };
}
