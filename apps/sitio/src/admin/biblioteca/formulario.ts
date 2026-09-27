import type { Fuente } from "@/datos/biblioteca/de-afuera";
import type { BorradorDeMaterial } from "@/features/biblioteca/contenido/material";
import type { Autoria } from "@/features/biblioteca/contenido/modelo";

// Un material como lo edita su formulario, y de vuelta a documento. Dos
// diferencias: cada autoría lleva una clave estable (para mover y quitar sin
// que el contenido salte de lugar) y las páginas van como texto, que es lo
// que se escribe; al guardar vuelven a ser un número. Y de dónde salió cada
// dato cuando vino de afuera (SPEC §8.1 de `work/biblioteca/`).

export { mismoDocumento } from "@/admin/novedades/formulario";

export type AutoriaEnElFormulario = Autoria & { clave: string };
export type MaterialEnElFormulario = Omit<BorradorDeMaterial, "autorias" | "paginas"> & { autorias: AutoriaEnElFormulario[]; paginas: string };

/** Las claves de lo que ya estaba son su posición: así el servidor y el navegador dibujan lo mismo. */
export function aFormulario(documento: BorradorDeMaterial): MaterialEnElFormulario {
  return {
    ...documento,
    autorias: documento.autorias.map((a, i) => ({ ...a, clave: `a${i}` })),
    paginas: documento.paginas === null ? "" : String(documento.paginas),
  };
}

/** El documento que se guarda: las autorías sin su clave y las páginas como número (o nada). */
export function aDocumento({ autorias, paginas, ...resto }: MaterialEnElFormulario): BorradorDeMaterial {
  return { ...resto, autorias: autorias.map(({ nombre, persona }) => ({ nombre, persona })), paginas: paginas.trim() ? Number(paginas) : null };
}

/** Una autoría nueva, vacía. Solo se crea con un clic, en el navegador: su clave puede ser al azar. */
export function autoriaVacia(): AutoriaEnElFormulario {
  return { clave: crypto.randomUUID(), nombre: "", persona: null };
}

/** De qué fuente salió cada dato que vino de afuera (`datos/biblioteca/de-afuera.ts`). */
export type { Fuente };
export type Origen = Partial<Record<keyof MaterialEnElFormulario, Fuente>>;

const DE: Record<Fuente, string> = { crossref: "De Crossref.", openalex: "De OpenAlex.", pagina: "De la página.", redes: "De la vista para redes de la página." };

/**
 * La ayuda de un campo con su origen adelante, mientras el dato siga como
 * vino: «De Crossref. La que da la fuente…». Editarlo borra la marca.
 */
export function conOrigen(ayuda: string | undefined, fuente: Fuente | undefined): string | undefined {
  if (!fuente) return ayuda;
  return ayuda ? `${DE[fuente]} ${ayuda}` : DE[fuente];
}
