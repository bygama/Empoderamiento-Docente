import { Fragment } from "react";

/**
 * Un párrafo de la historia, palabra por palabra: en celular cada una se enciende
 * con el scroll de su capítulo (`capitulos-movil.ts`). En escritorio nadie
 * las toca y el párrafo se lee igual que antes.
 */
export function Palabras({ texto }: { texto: string }) {
  // La clave es el lugar de la palabra en el texto: una palabra repetida
  // («de», «y») no puede compartirla con otra.
  const lista = Array.from(texto.matchAll(/\S+/g), (m) => ({ palabra: m[0], desde: m.index }));
  return lista.map(({ palabra, desde }) => (
    <Fragment key={desde}>
      {desde > 0 ? " " : null}
      <span data-palabra>{palabra}</span>
    </Fragment>
  ));
}
