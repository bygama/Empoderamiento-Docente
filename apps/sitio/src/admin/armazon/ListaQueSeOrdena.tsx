import { Aviso, Boton } from "@ed/kit-admin";
import type { Hacia } from "./useMoverEnOrden";

// Las dos piezas de una lista que se ordena (DESIGN.md §11, «Lista que se
// ordena») que se ven: los botones de cada fila y lo que se anuncia arriba de
// la lista. El movimiento lo lleva `useMoverEnOrden`.

type PropsDeLosBotones = {
  /** El mismo que se le pasó a `useMoverEnOrden`: arma el id de cada botón. */
  prefijo: string;
  id: string;
  /** Para el lector: «Subir Iván Pérez en su nivel». */
  nombre: string;
  donde: string;
  primero: boolean;
  ultimo: boolean;
  pendiente: boolean;
  alMover: (hacia: Hacia) => void;
};

/** «Subir» y «Bajar» de una fila, terciarios; en una punta, el que no va no está. */
export function BotonesDeOrden({ prefijo, id, nombre, donde, primero, ultimo, pendiente, alMover }: PropsDeLosBotones) {
  return (
    <>
      {primero ? null : (
        <Boton id={`${prefijo}-${id}-subir`} variante="terciario" disabled={pendiente} onClick={() => alMover("antes")} aria-label={`Subir ${nombre} ${donde}`}>
          Subir
        </Boton>
      )}
      {ultimo ? null : (
        <Boton id={`${prefijo}-${id}-bajar`} variante="terciario" disabled={pendiente} onClick={() => alMover("despues")} aria-label={`Bajar ${nombre} ${donde}`}>
          Bajar
        </Boton>
      )}
    </>
  );
}

/** El anuncio de cada paso para el lector de pantalla y, si no salió, el aviso de error. */
export function AvisosDelOrden({ anuncio, aviso }: { anuncio: string; aviso: string | null }) {
  return (
    <>
      <p role="status" className="sr-only">
        {anuncio}
      </p>
      {aviso ? <Aviso tono="error">{aviso}</Aviso> : null}
    </>
  );
}
