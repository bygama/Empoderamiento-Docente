/**
 * Los campos y el botón de las tres pantallas de acceso, y el aviso que usa
 * todo el admin. Los colores están medidos contra WCAG AA (PROGRESS de
 * `work/armazon-del-admin/`): la caja de texto es la `ENTRADA` del admin, y
 * el texto del botón es `azul-principal` sobre el naranja (4,54:1; DESIGN.md
 * §7).
 */

import { Alerta, Check, X } from "@/components/ui/icons";
import { ENTRADA } from "@/admin/campos/clases";
import { claseDeBoton } from "./clases";

/** Los links de las pantallas de acceso («Olvidé mi contraseña», «Volver»), con el foco en `azul-medio` como los campos. */
export const ENLACE_DE_ACCESO =
  "rounded-sm text-azul-medio underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio";

export function Campo({
  etiqueta,
  ...props
}: { etiqueta: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-admin-meta font-medium text-azul-principal">{etiqueta}</span>
      <input {...props} className={`mt-1 ${ENTRADA}`} />
    </label>
  );
}

/**
 * El CTA de cada pantalla de acceso: el único naranja, el primario del admin
 * (`Boton.tsx`) a todo el ancho. Conserva su firma porque los formularios de
 * acceso lo usan tal cual.
 */
export function Boton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`w-full ${claseDeBoton("primario")}`}>
      {children}
    </button>
  );
}

type PropsDeAviso = {
  tono: "error" | "bien";
  /** Va en el texto, no en la caja: así un `aria-describedby` que lo apunta lee el mensaje y no el botón de cerrar. */
  id?: string;
  /** Si llega, el aviso lleva una × que lo cierra. */
  alCerrar?: () => void;
  children: React.ReactNode;
};

/**
 * Un aviso: un banner, nunca un toast (DESIGN.md §11). `tono` decide si es un
 * error o una confirmación. El error se anuncia en el acto (`role="alert"`) y
 * va en `rojo-error` sobre su tinte al 8 % (5,75:1); la confirmación, cuando
 * el lector termina lo que dice (`role="status"`), en `azul-principal` sobre
 * `azul-claro/30` (11,63:1). Sin verde: al lado de «Publicar» rompería la
 * regla 4 de DESIGN.md §1. El rol va en el texto y la × queda afuera, para
 * que no se anuncie como parte del mensaje.
 */
export function Aviso({ tono, id, alCerrar, children }: PropsDeAviso) {
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
