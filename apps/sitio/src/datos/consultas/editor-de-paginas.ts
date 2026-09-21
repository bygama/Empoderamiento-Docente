import { PAGINAS, SLUGS, type Slug } from "@/contenido/paginas";
import { base } from "@/datos/cliente";
import { describir } from "@/lib/contenido/describir";
import type { Descripcion } from "@/lib/contenido/descripcion";
import { comoDocumento, completarPagina, type SeccionRegistrada } from "@/lib/contenido/documento";

// Lo que leen las dos pantallas del admin (SPEC §2): la lista de las siete
// páginas y una página lista para editar. Las fechas viajan como ISO: el
// navegador las muestra en la zona de quien mira.

export type FilaDeLista = {
  slug: Slug;
  nombre: string;
  ruta: string;
  editable: boolean;
  sinPublicar: boolean;
  publicadoEn: string | null;
  publicadoPor: string | null;
};

export async function listaDePaginas(): Promise<FilaDeLista[]> {
  const filas = await base.pagina.findMany();
  const porSlug = new Map(filas.map((f) => [f.slug, f]));
  return SLUGS.map((slug) => {
    const pagina = PAGINAS[slug];
    const fila = porSlug.get(slug);
    return {
      slug,
      nombre: pagina.nombre,
      ruta: pagina.ruta,
      editable: Object.keys(pagina.secciones).length > 0,
      sinPublicar: Boolean(fila?.borradorEn),
      publicadoEn: fila?.publicadoEn?.toISOString() ?? null,
      publicadoPor: fila?.publicadoPor ?? null,
    };
  });
}

export type PaginaParaEditar = {
  slug: Slug;
  nombre: string;
  ruta: string;
  estado: { borradorEn: string | null; borradorPor: string | null; publicadoEn: string | null; publicadoPor: string | null };
  secciones: Array<{ clave: string; nombre: string; descripcion: Descripcion; contenido: unknown }>;
};

/** La página con lo que se está editando (el borrador, o lo publicado, o el inicial) y la descripción de cada sección. */
export async function paginaParaEditar(slug: Slug): Promise<PaginaParaEditar> {
  const pagina = PAGINAS[slug];
  const fila = await base.pagina.findUnique({ where: { slug } });
  const documento = completarPagina(pagina, comoDocumento(fila?.borrador ?? fila?.publicado));
  // Anotado como Record para que Object.entries no caiga en `any` con la unión de páginas.
  const secciones: Record<string, SeccionRegistrada> = pagina.secciones;
  return {
    slug,
    nombre: pagina.nombre,
    ruta: pagina.ruta,
    estado: {
      borradorEn: fila?.borradorEn?.toISOString() ?? null,
      borradorPor: fila?.borradorPor ?? null,
      publicadoEn: fila?.publicadoEn?.toISOString() ?? null,
      publicadoPor: fila?.publicadoPor ?? null,
    },
    secciones: Object.entries(secciones).map(([clave, s]) => ({ clave, nombre: s.nombre, descripcion: describir(s.esquema, s.nombre), contenido: documento[clave] })),
  };
}
