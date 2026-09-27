"use client";

import { useRef, useState, useTransition } from "react";
import { Aviso } from "./Aviso";
import type { Cambio } from "./cambio";
import { claseDeBoton, ENTRADA } from "./clases";
import type { ValorDeFoto } from "./foto";
import { ElegirYaSubida, type ElegirFoto, type FotoElegible } from "./campo-foto/ElegirYaSubida";
import { MiniaturaConFoco } from "./campo-foto/MiniaturaConFoco";
import { SubidaDeArchivo, type SubirFoto } from "./campo-foto/SubidaDeArchivo";

export type { ElegirFoto, FotoElegible, SubirFoto };

type Props = {
  nombre: string;
  etiqueta: string;
  ayuda?: string;
  valor: ValorDeFoto;
  alCambiar: (valor: Cambio<ValorDeFoto>) => void;
  subir: SubirFoto;
  /**
   * El tope de bytes de quien guarda. Se chequea acá, antes de mandar, porque
   * el servidor corta un cuerpo demasiado grande antes de entrar a la acción,
   * y ese corte no lo contesta nadie en llano.
   */
  maximoBytes: number;
  /** Las fotos ya subidas, para elegir una en vez de subir otra. Sin esto, el campo solo sube. */
  elegir?: ElegirFoto;
  /** Si la foto se recorta en su lugar y hay que elegir qué queda a la vista. Un logo o una lámina, que van enteros, no. */
  conFoco?: boolean;
  /** Lo que el último guardado dijo de esta foto (casi siempre, del alt). */
  error?: string;
};

/**
 * Una foto del contenido: la miniatura (con el punto de foco, si la foto se
 * recorta), el texto alternativo (obligatorio), la subida de un archivo nuevo
 * y, si la app la ofrece, elegir una ya subida. Las piezas están en
 * `campo-foto/`.
 */
export function CampoFoto({ nombre, etiqueta, ayuda, valor, alCambiar, subir, maximoBytes, elegir, conFoco = true, error }: Props) {
  const [aviso, setAviso] = useState<string | null>(null);
  const [fotos, setFotos] = useState<readonly FotoElegible[] | null>(null);
  const [pendiente, empezar] = useTransition();
  const refElegir = useRef<HTMLButtonElement>(null);
  const idError = `${nombre}-error`;

  // Se piden al abrir, en el gesto: son las de ese momento, con las recién subidas.
  const abrir = (traer: ElegirFoto) =>
    empezar(async () => {
      try {
        setFotos(await traer());
        setAviso(null);
      } catch {
        setAviso("No se pudieron traer las fotos. Fijate la conexión y probá de nuevo.");
      }
    });

  const cerrar = () => {
    setFotos(null);
    // Vuelve a lo que abrió el panel, así el teclado no queda en el vacío.
    refElegir.current?.focus();
  };

  // Elegida, el alt del campo queda si ya tenía uno (es de este lugar); si no, toma el de la foto. Foco al centro: es otra imagen.
  const alElegir = (foto: FotoElegible) => {
    alCambiar((actual: ValorDeFoto) => ({ ...actual, src: foto.src, alt: actual.alt.trim() ? actual.alt : foto.alt, foco: { x: 0.5, y: 0.5 } }));
    cerrar();
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-admin-meta font-medium">{etiqueta}</p>
        {ayuda ? <p className="mt-1 text-admin-meta text-gris-texto">{ayuda}</p> : null}
      </div>
      {valor.src ? (
        <MiniaturaConFoco valor={valor} alCambiar={alCambiar} pendiente={pendiente} conFoco={conFoco} />
      ) : (
        <p className="text-admin-meta text-gris-texto">Sin foto todavía.</p>
      )}
      <label className="block">
        <span className="text-admin-meta font-medium">Texto alternativo (obligatorio)</span>
        {/* `-campo`: el editor lleva el foco acá cuando la foto no pasa. */}
        <input
          id={`${nombre}-campo`}
          type="text"
          value={valor.alt}
          maxLength={200}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? idError : undefined}
          disabled={pendiente}
          onChange={(e) => {
            const alt = e.target.value;
            // Updater, no un valor plano: si esto corre después de que algo
            // asíncrono resuelva pero antes de que React confirme, un valor
            // plano pisaría lo que se haya tocado en otro campo mientras tanto.
            alCambiar((actual: ValorDeFoto) => ({ ...actual, alt }));
          }}
          className={`mt-1 ${ENTRADA}`}
        />
      </label>
      {error ? (
        <p id={idError} className="text-admin-meta text-rojo-error">
          {error}
        </p>
      ) : null}
      <SubidaDeArchivo nombre={nombre} valor={valor} alCambiar={alCambiar} subir={subir} maximoBytes={maximoBytes} pendiente={pendiente} empezar={empezar} avisar={setAviso}>
        {elegir ? (
          // Un botón nativo con las clases del kit: lleva la ref, para volver acá al cerrar el panel.
          <button
            ref={refElegir}
            type="button"
            disabled={pendiente}
            aria-expanded={fotos !== null}
            aria-controls={`${nombre}-ya-subidas`}
            onClick={() => (fotos ? cerrar() : abrir(elegir))}
            className={claseDeBoton("secundario")}
          >
            Elegir una ya subida…
          </button>
        ) : null}
      </SubidaDeArchivo>
      {fotos ? <ElegirYaSubida id={`${nombre}-ya-subidas`} nombre={nombre} fotos={fotos} actual={valor.src} alElegir={alElegir} alCerrar={cerrar} /> : null}
      {aviso ? <Aviso tono="error">{aviso}</Aviso> : null}
    </div>
  );
}
