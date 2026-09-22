import { PAGINAS, SLUGS, type Slug } from "@/contenido/paginas";

// El árbol del sitio que muestra la sidebar: las siete páginas en el orden
// del registro (el del menú público) y, en cada una, sus secciones
// registradas. Sale solo del registro: la sección que se registre aparece
// sola, sin una segunda lista que mantener (SPEC §2 de work/armazon-del-admin).

export type SeccionDelArbol = { clave: string; nombre: string };

export type PaginaDelArbol = {
  slug: Slug;
  nombre: string;
  secciones: SeccionDelArbol[];
  /** `null` cuando no se pudo preguntar a la base: el árbol se dibuja igual, sin el punto. */
  sinPublicar: boolean | null;
};

/** El árbol, marcando con `sinPublicar` las páginas de `conCambios` (o sin marcar nada si es `null`). */
export function arbolDelSitio(conCambios: ReadonlySet<Slug> | null): PaginaDelArbol[] {
  return SLUGS.map((slug) => {
    // Anotado como Record para que Object.entries no caiga en `any` con la unión de páginas (igual que editor-de-paginas.ts).
    const secciones: Record<string, { nombre: string }> = PAGINAS[slug].secciones;
    return {
      slug,
      nombre: PAGINAS[slug].nombre,
      secciones: Object.entries(secciones).map(([clave, s]) => ({ clave, nombre: s.nombre })),
      sinPublicar: conCambios ? conCambios.has(slug) : null,
    };
  });
}
