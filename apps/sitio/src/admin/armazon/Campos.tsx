/**
 * Los campos y el botón de las tres pantallas de acceso, y el aviso que usa
 * todo el admin. Los colores están medidos contra WCAG AA (PROGRESS de
 * `work/armazon-del-admin/`): el borde del input con `gris-texto` da 4,83:1
 * sobre blanco (con `azul-claro` daba 1,77:1, por debajo del 3:1 de un
 * control), y el texto del botón es `azul-principal` sobre el naranja
 * (4,54:1; DESIGN.md §7).
 */

/** Los links de las pantallas de acceso («Olvidé mi contraseña», «Volver»), con el foco en `azul-medio` como los campos. */
export const ENLACE_DE_ACCESO =
  "rounded-sm text-azul-medio underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio";

/** La caja de texto de las pantallas de acceso. `CampoContrasena` la reusa. */
export const ENTRADA_DE_ACCESO =
  "w-full rounded-lg border border-gris-texto bg-white px-3 py-2.5 text-azul-principal outline-none transition-colors focus:border-azul-medio focus:ring-2 focus:ring-azul-medio/30 aria-invalid:border-naranja-accion-texto";

export function Campo({
  etiqueta,
  ...props
}: { etiqueta: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-azul-principal">{etiqueta}</span>
      <input {...props} className={`mt-1 ${ENTRADA_DE_ACCESO}`} />
    </label>
  );
}

/**
 * El CTA de cada pantalla de acceso: el único naranja. El hover aclara en vez
 * de oscurecer, porque con el texto azul oscurecer baja el contraste a 3,75:1.
 */
export function Boton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-lg bg-naranja-accion px-6 py-3 font-medium text-azul-principal transition-colors hover:bg-naranja-accion/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

/**
 * Un aviso. `tono` decide si es un error o una confirmación. El error se
 * anuncia en el acto (`role="alert"`); la confirmación, cuando el lector
 * termina lo que dice (`role="status"`). El texto del error es azul y el
 * naranja queda en el borde: `naranja-accion-texto` sobre su fondo daba
 * 4,33:1, por debajo de AA.
 */
export function Aviso({ tono, id, children }: { tono: "error" | "bien"; id?: string; children: React.ReactNode }) {
  return (
    <p
      id={id}
      role={tono === "error" ? "alert" : "status"}
      className={`rounded-lg px-3 py-2 text-sm ${tono === "error" ? "border-l-4 border-naranja-accion bg-naranja-accion/10 text-azul-principal" : "bg-verde-concepto/10 text-verde-concepto-texto"}`}
    >
      {children}
    </p>
  );
}
