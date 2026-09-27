/**
 * Los campos y el botón de las tres pantallas de acceso. Los colores están
 * medidos contra WCAG AA (PROGRESS de `work/armazon-del-admin/`): la caja de
 * texto es la `ENTRADA` del admin, y el texto del botón es `azul-principal`
 * sobre el naranja (4,54:1; DESIGN.md §7).
 */

import { claseDeBoton, ENTRADA } from "@ed/kit-admin";

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
 * (`Boton` del kit) a todo el ancho. Conserva su firma porque los formularios
 * de acceso lo usan tal cual.
 */
export function Boton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`w-full ${claseDeBoton("primario")}`}>
      {children}
    </button>
  );
}
