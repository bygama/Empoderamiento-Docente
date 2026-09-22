import { ENTRADA } from "./clases";

type Props = {
  nombre: string;
  etiqueta: string;
  maximo: number;
  ayuda?: string;
  valor: string;
  alCambiar: (valor: string) => void;
};

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
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={idCampo} className="text-sm font-medium">
          {etiqueta}
        </label>
        {/* Fuera del label: así su nombre accesible no cambia en cada tecla, y el contador se anuncia aparte por aria-describedby. */}
        <span id={idContador} className={`text-xs font-normal ${alTope ? "text-naranja-accion-texto" : "text-gris-texto"}`}>
          {valor.length}/{maximo}
        </span>
      </div>
      <input
        id={idCampo}
        type="text"
        value={valor}
        maxLength={maximo}
        aria-describedby={ayuda ? `${idContador} ${idAyuda}` : idContador}
        aria-invalid={excedido ? true : undefined}
        onChange={(e) => alCambiar(e.target.value)}
        className={ENTRADA}
      />
      {/* maxLength corta la tecla en silencio: sin esto, quien edita no entiende por qué dejó de escribir (Importante 2 de la revisión). */}
      {/* El span vive siempre en el DOM y solo cambia el texto: si naciera junto con el texto, el lector de pantalla puede no llegar a anunciarlo. */}
      <span className="sr-only" aria-live="polite">
        {alTope ? "Llegaste al máximo de caracteres." : ""}
      </span>
      {ayuda ? (
        <p id={idAyuda} className="mt-1 text-xs text-gris-texto">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}
