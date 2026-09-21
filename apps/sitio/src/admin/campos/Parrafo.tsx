import type { Descripcion } from "@/lib/contenido/descripcion";
import { ENTRADA } from "./clases";

type Props = {
  nombre: string;
  descripcion: Extract<Descripcion, { tipo: "parrafo" }>;
  valor: string;
  alCambiar: (valor: string) => void;
};

/** Varias líneas, con contador. El hero no lo usa; existe porque `parrafo()` existe y el dibujante cubre todos los tipos. */
export function Parrafo({ nombre, descripcion, valor, alCambiar }: Props) {
  const idCampo = `${nombre}-campo`;
  const idAyuda = `${nombre}-ayuda`;
  const idContador = `${nombre}-contador`;
  // Solo puede pasar con un valor guardado antes de bajar el máximo: el
  // textarea ya no deja escribir de más (maxLength), esto avisa de un dato
  // viejo, no reemplaza el límite.
  const excedido = valor.length > descripcion.maximo;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={idCampo} className="text-sm font-medium">
          {descripcion.etiqueta}
        </label>
        {/* Fuera del label: así su nombre accesible no cambia en cada tecla, y el contador se anuncia aparte por aria-describedby. */}
        <span id={idContador} className={`text-xs font-normal ${excedido ? "text-naranja-accion-texto" : "text-gris-texto"}`}>
          {valor.length}/{descripcion.maximo}
        </span>
      </div>
      <textarea
        id={idCampo}
        rows={4}
        value={valor}
        maxLength={descripcion.maximo}
        aria-describedby={descripcion.ayuda ? `${idContador} ${idAyuda}` : idContador}
        aria-invalid={excedido ? true : undefined}
        onChange={(e) => alCambiar(e.target.value)}
        className={ENTRADA}
      />
      {descripcion.ayuda ? (
        <p id={idAyuda} className="mt-1 text-xs text-gris-texto">
          {descripcion.ayuda}
        </p>
      ) : null}
    </div>
  );
}
