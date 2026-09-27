import { Alerta, Check, X } from "./iconos";

type Props = {
  tono: "error" | "bien";
  /** Va en el texto, no en la caja: así un `aria-describedby` que lo apunta lee el mensaje y no el botón de cerrar. */
  id?: string;
  /** Si llega, el aviso lleva una × que lo cierra. */
  alCerrar?: () => void;
  /** Lo que resuelve el aviso, si hay algo que hacer («Recargar»): un botón de texto en el color del aviso. */
  accion?: { etiqueta: string; alHacer: () => void };
  children: React.ReactNode;
};

/**
 * Un aviso: un banner, nunca un toast. `tono` decide si es un error o una
 * confirmación. El error se anuncia en el acto (`role="alert"`) y va en
 * `rojo-error` sobre su tinte al 8 % (5,75:1); la confirmación, cuando el
 * lector termina lo que dice (`role="status"`), en `azul-principal` sobre
 * `azul-claro/30` (11,63:1). Sin verde: al lado del primario, dos colores de
 * acción competirían. El rol va en el texto y la × queda afuera, para que no
 * se anuncie como parte del mensaje; la acción, si la hay, también.
 */
export function Aviso({ tono, id, alCerrar, accion, children }: Props) {
  const error = tono === "error";
  const Icono = error ? Alerta : Check;
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border-l-4 px-3 py-2 text-admin-meta ${error ? "border-rojo-error bg-rojo-error/8 text-rojo-error" : "border-azul-medio bg-azul-claro/30 text-azul-principal"}`}
    >
      <Icono size={20} className="shrink-0" />
      <p id={id} role={error ? "alert" : "status"} className="flex-1">
        {children}
      </p>
      {accion ? (
        // Hereda el color del aviso (5,75:1 en el error, 11,63:1 en la confirmación) y lo marca el subrayado.
        <button
          type="button"
          onClick={accion.alHacer}
          className="-my-1 shrink-0 rounded-sm py-1 font-medium underline underline-offset-2 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio"
        >
          {accion.etiqueta}
        </button>
      ) : null}
      {alCerrar ? (
        <button
          type="button"
          onClick={alCerrar}
          aria-label="Cerrar el aviso"
          className="-my-1 -mr-1 shrink-0 rounded-md p-1.5 transition-colors hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-azul-medio"
        >
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
