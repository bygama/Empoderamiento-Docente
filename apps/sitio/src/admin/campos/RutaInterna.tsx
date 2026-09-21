import type { Descripcion } from "@/lib/contenido/descripcion";
import { ENTRADA } from "./clases";

type Props = {
  nombre: string;
  descripcion: Extract<Descripcion, { tipo: "rutaInterna" }>;
  valor: string;
  alCambiar: (valor: string) => void;
};

/** Un enlace interno se elige de la lista cerrada de rutas del sitio (SPEC §2): no hay enlaces libres. */
export function RutaInterna({ nombre, descripcion, valor, alCambiar }: Props) {
  const conocida = descripcion.opciones.includes(valor);
  const idCampo = `${nombre}-campo`;
  const idAyuda = `${nombre}-ayuda`;
  return (
    <div>
      <label htmlFor={idCampo} className="block text-sm font-medium">
        {descripcion.etiqueta}
      </label>
      <select
        id={idCampo}
        value={conocida ? valor : ""}
        aria-describedby={descripcion.ayuda ? idAyuda : undefined}
        onChange={(e) => alCambiar(e.target.value)}
        className={ENTRADA}
      >
        {/* Si el valor guardado ya no está en la lista, que se vea que falta elegir. */}
        {conocida ? null : <option value="">Elegí una ruta</option>}
        {descripcion.opciones.map((ruta) => (
          <option key={ruta} value={ruta}>
            {ruta}
          </option>
        ))}
      </select>
      {descripcion.ayuda ? (
        <p id={idAyuda} className="mt-1 text-xs text-gris-texto">
          {descripcion.ayuda}
        </p>
      ) : null}
    </div>
  );
}
