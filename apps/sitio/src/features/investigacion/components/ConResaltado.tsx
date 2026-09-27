import { Fragment } from "react";
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

/**
 * Un título con su parte resaltada entre dobles asteriscos («**Investigamos**
 * para transformar…»), con lo resaltado en el marcador de la marca. Deja el
 * mismo HTML que el `<Highlight>` escrito a mano que reemplaza.
 */
export function ConResaltado({ texto }: { texto: string }) {
  return (
    <>
      {conPosicion(texto).map((f) => (
        <Fragment key={f.desde}>{f.resaltado ? <Highlight>{f.texto}</Highlight> : f.texto}</Fragment>
      ))}
    </>
  );
}
