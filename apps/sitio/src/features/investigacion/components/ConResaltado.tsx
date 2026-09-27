import { Fragment, type ReactNode } from "react";
import { Highlight } from "@/components/ui/Highlight";
import { fragmentos, type Fragmento } from "@/lib/contenido/resaltado";

/** Cada fragmento con dónde empieza en el texto: esa posición es su clave, única porque ningún fragmento viene vacío. */
function conPosicion(texto: string): Array<Fragmento & { desde: number }> {
  let desde = 0;
  return fragmentos(texto).map((f) => {
    const conSuPosicion = { ...f, desde };
    desde += f.texto.length;
    return conSuPosicion;
  });
}

const marcador = (texto: string) => <Highlight>{texto}</Highlight>;

/**
 * Un texto con su parte resaltada entre dobles asteriscos («**Investigamos**
 * para transformar…»). Lo resaltado va en el marcador de la marca, o como lo
 * dibuje la sección con `resaltar` (el garabato de las preguntas, el
 * subrayado de la lámina). Deja el mismo HTML que el resaltado escrito a mano
 * que reemplaza.
 */
export function ConResaltado({ texto, resaltar = marcador }: { texto: string; resaltar?: (texto: string) => ReactNode }) {
  return (
    <>
      {conPosicion(texto).map((f) => (
        <Fragment key={f.desde}>{f.resaltado ? resaltar(f.texto) : f.texto}</Fragment>
      ))}
    </>
  );
}
