import { ENTRADA } from "./clases";

/** Una opción: lo que se guarda y lo que se lee. */
export type Opcion = { valor: string; etiqueta: string };

type Props = {
  nombre: string;
  etiqueta: string;
  opciones: readonly Opcion[];
  /** Lo que dice el campo cuando el valor guardado no está en la lista («Elegí una ruta»). */
  sinElegir: string;
  ayuda?: string;
  valor: string;
  alCambiar: (valor: string) => void;
  /** Lo que el último guardado dijo de este campo. */
  error?: string;
};

/**
 * Un valor de una lista cerrada: no hay texto libre. Si el valor guardado ya
 * no está en la lista (la lista cambió), se ve que falta elegir, y se lee
 * `sinElegir`.
 */
export function Seleccion({ nombre, etiqueta, opciones, sinElegir, ayuda, valor, alCambiar, error }: Props) {
  const conocida = opciones.some((o) => o.valor === valor);
  const idCampo = `${nombre}-campo`;
  const idAyuda = `${nombre}-ayuda`;
  const idError = `${nombre}-error`;
  return (
    <div>
      <label htmlFor={idCampo} className="block text-admin-meta font-medium">
        {etiqueta}
      </label>
      {/* La ayuda antes del campo: se lee antes de elegir, no después. */}
      {ayuda ? (
        <p id={idAyuda} className="mt-1 text-admin-meta text-gris-texto">
          {ayuda}
        </p>
      ) : null}
      <select
        id={idCampo}
        value={conocida ? valor : ""}
        aria-describedby={[ayuda ? idAyuda : "", error ? idError : ""].filter(Boolean).join(" ") || undefined}
        aria-invalid={error ? true : undefined}
        onChange={(e) => alCambiar(e.target.value)}
        className={`mt-1 ${ENTRADA}`}
      >
        {conocida ? null : <option value="">{sinElegir}</option>}
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
      {error ? (
        <p id={idError} className="mt-1 text-admin-meta text-rojo-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
