import { ENTRADA } from "./clases";
import { estadoDelLargo, idsQueDescriben } from "./largo";
import { Contador, PieDelCampo } from "./PieDelCampo";

type Props = {
  nombre: string;
  etiqueta: string;
  maximo: number;
  ayuda?: string;
  valor: string;
  alCambiar: (valor: string) => void;
  /** Lo que el último guardado dijo de este campo: se muestra debajo, en rojo. */
  error?: string;
};

/**
 * Varias líneas, con contador: un texto que se lee en párrafos.
 * Crece con el texto (`field-sizing`) desde unos cuatro renglones
 * (`min-h-28`), así un cuerpo largo se lee entero sin scrollear adentro.
 */
export function Parrafo({ nombre, etiqueta, maximo, ayuda, valor, alCambiar, error }: Props) {
  const idCampo = `${nombre}-campo`;
  const largo = estadoDelLargo(valor.length, maximo);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={idCampo} className="text-admin-meta font-medium">
          {etiqueta}
        </label>
        <Contador nombre={nombre} cuenta={valor.length} largo={largo} />
      </div>
      {/* La ayuda antes del campo: se lee antes de escribir, no después. */}
      {ayuda ? (
        <p id={`${nombre}-ayuda`} className="mt-1 text-admin-meta text-gris-texto">
          {ayuda}
        </p>
      ) : null}
      <textarea
        id={idCampo}
        rows={4}
        value={valor}
        maxLength={maximo}
        aria-describedby={idsQueDescriben(nombre, { ayuda, largo, error })}
        aria-invalid={largo.excedido || error ? true : undefined}
        onChange={(e) => alCambiar(e.target.value)}
        className={`mt-1 ${ENTRADA} min-h-28 field-sizing-content`}
      />
      <PieDelCampo nombre={nombre} largo={largo} error={error} />
    </div>
  );
}
