// Qué es una foto para los controles del kit: el archivo, su texto
// alternativo y el punto de foco. Sin React: lo importa también quien dibuja
// la foto fuera del admin (`@ed/kit-admin/foto`), sin arrastrar los
// controles.

/** El punto de la foto que tiene que quedar a la vista, en 0..1 de la caja. */
export type Foco = { x: number; y: number };

/** Una foto como la edita `CampoFoto`: de dónde sale, su alt y su foco. */
export type ValorDeFoto = { src: string; alt: string; foco: Foco };

/** `{ x: 0.25, y: 0.5 }` → `"25% 50%"`, lo que `object-position` entiende. */
export function posicionDelFoco(foco: Foco): string {
  return `${Math.round(foco.x * 100)}% ${Math.round(foco.y * 100)}%`;
}
