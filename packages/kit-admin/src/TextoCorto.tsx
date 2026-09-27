import { ENTRADA } from "./clases";
import { estadoDelLargo, idsQueDescriben, type Recomendado } from "./largo";
import { Contador, PieDelCampo } from "./PieDelCampo";

type Props = {
  nombre: string;
  etiqueta: string;
  maximo: number;
  /** Un largo que conviene no pasar (el de Google): pasado, se avisa debajo, sin frenar. */
  recomendado?: Recomendado;
  ayuda?: string;
  valor: string;
  alCambiar: (valor: string) => void;
  /** Lo que el último guardado dijo de este campo: se muestra debajo, en rojo. */
  error?: string;
};

// Por encima de esto, una sola línea obliga a scrollear adentro del campo
// para ver lo escrito (una bajada de 140 se cortaba a la mitad).
const LARGO_EN_DOS_RENGLONES = 80;

/** Una línea con su largo máximo a la vista y un contador. */
export function TextoCorto({ nombre, etiqueta, maximo, recomendado, ayuda, valor, alCambiar, error }: Props) {
  const idCampo = `${nombre}-campo`;
  const largo = estadoDelLargo(valor.length, maximo, recomendado);
  const comunes = {
    id: idCampo,
    value: valor,
    maxLength: maximo,
    "aria-describedby": idsQueDescriben(nombre, { ayuda, largo, error }),
    "aria-invalid": largo.excedido || error ? true : undefined,
  };
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
      {maximo > LARGO_EN_DOS_RENGLONES ? (
        // Sigue siendo una línea (el esquema rechaza los saltos): se ve en dos
        // renglones que crecen con el texto (`field-sizing`; donde no existe,
        // quedan dos fijos por `rows`), pero Enter no agrega renglón y un
        // salto pegado pasa a espacio. `min-h-17` son los dos renglones con el
        // relleno y el borde de `ENTRADA`.
        <textarea
          {...comunes}
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) e.preventDefault();
          }}
          onChange={(e) => alCambiar(e.target.value.replace(/[\r\n]+/g, " "))}
          className={`mt-1 ${ENTRADA} min-h-17 resize-none field-sizing-content`}
        />
      ) : (
        <input {...comunes} type="text" onChange={(e) => alCambiar(e.target.value)} className={`mt-1 ${ENTRADA}`} />
      )}
      <PieDelCampo nombre={nombre} largo={largo} aviso={recomendado?.aviso} error={error} />
    </div>
  );
}
