import { ENTRADA } from "./clases";

type Props = {
  nombre: string;
  etiqueta: string;
  maximo: number;
  ayuda?: string;
  valor: string;
  alCambiar: (valor: string) => void;
};

// Por encima de esto, una sola línea obliga a scrollear adentro del campo
// para ver lo escrito (la bajada del hero, de 140, se cortaba a la mitad).
const LARGO_EN_DOS_RENGLONES = 80;

/** Una línea con su largo máximo a la vista y un contador (SPEC §2). */
export function TextoCorto({ nombre, etiqueta, maximo, ayuda, valor, alCambiar }: Props) {
  const idCampo = `${nombre}-campo`;
  const idAyuda = `${nombre}-ayuda`;
  const idContador = `${nombre}-contador`;
  // Solo puede pasar con un valor guardado antes de bajar el máximo: el
  // input ya no deja escribir de más (maxLength), esto avisa de un dato
  // viejo, no reemplaza el límite.
  const excedido = valor.length > maximo;
  // Distinto de `excedido`: este se prende también al llegar justo al tope,
  // que es lo normal al escribir (`maxLength` no deja pasarse), no solo con
  // un dato viejo por encima. Pinta el contador y dispara el aviso de abajo.
  const alTope = valor.length >= maximo;
  // A la vista recién desde el 80 % del máximo: antes es ruido. Para el lector
  // de pantalla está siempre, por el `aria-describedby`.
  const cerca = valor.length >= maximo * 0.8;
  const comunes = {
    id: idCampo,
    value: valor,
    maxLength: maximo,
    "aria-describedby": ayuda ? `${idAyuda} ${idContador}` : idContador,
    "aria-invalid": excedido ? true : undefined,
  };
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={idCampo} className="text-admin-meta font-medium">
          {etiqueta}
        </label>
        {/* Fuera del label: así su nombre accesible no cambia en cada tecla, y el contador se anuncia aparte por aria-describedby. */}
        {/* Pasado el tope (un dato viejo) va en rojo, como el borde; al tope, en azul: el naranja es solo para la acción. */}
        <span
          id={idContador}
          className={`text-admin-meta ${cerca ? "" : "sr-only"} ${excedido ? "text-rojo-error" : alTope ? "font-medium text-azul-principal" : "text-gris-texto"}`}
        >
          {valor.length}/{maximo}
        </span>
      </div>
      {/* La ayuda antes del campo: se lee antes de escribir, no después. */}
      {ayuda ? (
        <p id={idAyuda} className="mt-1 text-admin-meta text-gris-texto">
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
      {/* maxLength corta la tecla en silencio: sin esto, quien edita no entiende por qué dejó de escribir (Importante 2 de la revisión). */}
      {/* El span vive siempre en el DOM y solo cambia el texto: si naciera junto con el texto, el lector de pantalla puede no llegar a anunciarlo. */}
      <span className="sr-only" aria-live="polite">
        {alTope ? "Llegaste al máximo de caracteres." : ""}
      </span>
    </div>
  );
}
