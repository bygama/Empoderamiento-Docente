import type { Pagina } from "@/../prisma/generado/client";
import { PAGINAS, SLUGS, type Slug } from "@/contenido/paginas";
import { base } from "@/datos/cliente";
import { describir } from "@/lib/contenido/describir";
import type { Descripcion } from "@/lib/contenido/descripcion";
import { comoDocumento, completarPagina, parteDe, type SeccionRegistrada } from "@/lib/contenido/documento";
import { CLAVE_SEO } from "@/lib/contenido/seo";

// Lo que leen las dos pantallas del admin (SPEC §2): la lista de las siete
// páginas y una página lista para editar. Las fechas viajan como ISO: el
// navegador las muestra en la zona de quien mira.

/** El borrador y la publicación de una página, con quién y cuándo. Un borrador siempre es posterior a la publicación: publicar lo borra. */
export type EstadoDePagina = { borradorEn: string | null; borradorPor: string | null; publicadoEn: string | null; publicadoPor: string | null };

function estadoDe(fila: Pagina | null | undefined): EstadoDePagina {
  return {
    borradorEn: fila?.borradorEn?.toISOString() ?? null,
    borradorPor: fila?.borradorPor ?? null,
    publicadoEn: fila?.publicadoEn?.toISOString() ?? null,
    publicadoPor: fila?.publicadoPor ?? null,
  };
}

/** Las secciones de una página, en su orden. Anotado como Record para que Object.entries no caiga en `any` con la unión de páginas. */
function seccionesDe(slug: Slug): Array<[string, SeccionRegistrada]> {
  const secciones: Record<string, SeccionRegistrada> = PAGINAS[slug].secciones;
  return Object.entries(secciones);
}

/** Las dos pestañas que editan: las secciones y el SEO (SPEC §7 de `work/paginas-inicio/`). */
export type ParteDelEditor = "secciones" | "seo";

/** Qué pestañas de edición tiene una página: una página con solo SEO también se edita. */
export function partesEditables(slug: Slug): Record<ParteDelEditor, boolean> {
  return { secciones: seccionesDe(slug).length > 0, seo: parteDe(PAGINAS[slug], CLAVE_SEO) !== undefined };
}

/** Lo que muestra una pestaña del editor: las secciones, o el SEO solo. */
function partesDeLaPestana(slug: Slug, parte: ParteDelEditor): Array<[string, SeccionRegistrada]> {
  if (parte === "secciones") return seccionesDe(slug);
  const seo = parteDe(PAGINAS[slug], CLAVE_SEO);
  return seo ? [[CLAVE_SEO, seo]] : [];
}

export type FilaDeLista = {
  slug: Slug;
  nombre: string;
  ruta: string;
  estado: EstadoDePagina;
  /** Si tiene secciones o SEO: si no, la lista la muestra atenuada. */
  editable: boolean;
  /** Las secciones, para ir directo a cada una; vacía si no tiene. */
  secciones: Array<{ clave: string; nombre: string }>;
};

export async function listaDePaginas(): Promise<FilaDeLista[]> {
  const filas = await base.pagina.findMany();
  const porSlug = new Map(filas.map((f) => [f.slug, f]));
  return SLUGS.map((slug) => ({
    slug,
    nombre: PAGINAS[slug].nombre,
    ruta: PAGINAS[slug].ruta,
    estado: estadoDe(porSlug.get(slug)),
    editable: Object.values(partesEditables(slug)).some(Boolean),
    secciones: seccionesDe(slug).map(([clave, s]) => ({ clave, nombre: s.nombre })),
  }));
}

export type PaginaParaEditar = {
  slug: Slug;
  nombre: string;
  ruta: string;
  estado: EstadoDePagina;
  secciones: Array<{ clave: string; nombre: string; descripcion: Descripcion; contenido: unknown }>;
};

/** La página con lo que se está editando (el borrador, o lo publicado, o el inicial) y la descripción de cada parte de esa pestaña. */
export async function paginaParaEditar(slug: Slug, parte: ParteDelEditor): Promise<PaginaParaEditar> {
  const pagina = PAGINAS[slug];
  const fila = await base.pagina.findUnique({ where: { slug } });
  const documento = completarPagina(pagina, comoDocumento(fila?.borrador ?? fila?.publicado));
  return {
    slug,
    nombre: pagina.nombre,
    ruta: pagina.ruta,
    estado: estadoDe(fila),
    secciones: partesDeLaPestana(slug, parte).map(([clave, s]) => ({ clave, nombre: s.nombre, descripcion: describir(s.esquema, s.nombre), contenido: documento[clave] })),
  };
}
