import { ENTRADA } from "./clases";

type Props = {
  nombre: string;
  etiqueta: string;
  opciones: string[];
  ayuda?: string;
  valor: string;
  alCambiar: (valor: string) => void;
  /** Lo que el último guardado dijo de este campo. */
  error?: string;
};

/** Un enlace interno se elige de la lista cerrada de rutas del sitio (SPEC §2): no hay enlaces libres. */
export function RutaInterna({ nombre, etiqueta, opciones, ayuda, valor, alCambiar, error }: Props) {
  const conocida = opciones.includes(valor);
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
        {/* Si el valor guardado ya no está en la lista, que se vea que falta elegir. */}
        {conocida ? null : <option value="">Elegí una ruta</option>}
        {opciones.map((ruta) => (
          <option key={ruta} value={ruta}>
            {ruta}
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
