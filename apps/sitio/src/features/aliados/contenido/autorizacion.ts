import { esquemaAliado, type Aliado } from "./aliado";

// Qué ata la marca «Autorizado» de un aliado (AGENTS.md §5.4, ronda de
// arreglos 1 de `work/casos-aliados-fotos/`): el logo y el nombre que vio
// quien autorizó. Con otro logo u otro nombre, la marca no vale: publicar se
// niega y el sitio no lo muestra. Puro: lo usan las acciones, la consulta del
// sitio y la ficha del admin.

/** Lo que guardó la autorización: el `src` del logo y el nombre; nulos sin la marca. */
export type LoAutorizado = { autorizado: boolean; autorizadoLogo: string | null; autorizadoNombre: string | null };

/**
 * Lo que se autoriza al marcar: el borrador si se puede publicar; si no, lo
 * publicado; sin ninguno de los dos, nada (todavía no hay qué autorizar).
 */
export function loQueSeAutoriza(borrador: unknown, publicado: unknown): Aliado | null {
  for (const documento of [borrador, publicado]) {
    if (documento === null || documento === undefined) continue;
    const valido = esquemaAliado.safeParse(documento);
    if (valido.success) return valido.data;
  }
  return null;
}

/** Si la marca vale para ese documento: está puesta, y el logo y el nombre son los que se autorizaron. */
export function estaAutorizado(documento: { nombre: string; logo: { src: string } }, marca: LoAutorizado): boolean {
  return marca.autorizado && documento.logo.src === marca.autorizadoLogo && documento.nombre === marca.autorizadoNombre;
}

/** Por qué no se reemplaza el archivo de una foto que es el logo autorizado de un aliado: cambiaría el logo sin que nadie lo autorice. */
export function noSeReemplazaElLogo(aliado: string): string {
  return `Es el logo autorizado de ${aliado}: subí el nuevo y cambialo desde su ficha, que pide volver a autorizarlo.`;
}

export const CAMBIO_DESDE_LA_AUTORIZACION = "Cambió el logo o el nombre desde que se autorizó: lo vuelve a autorizar quien dirige o administra, mirando el nuevo.";
