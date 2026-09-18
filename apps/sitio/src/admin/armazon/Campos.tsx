/** Los campos y el botón de las tres pantallas de acceso. */

export function Campo({
  etiqueta,
  ...props
}: { etiqueta: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{etiqueta}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border border-azul-claro bg-white px-3 py-2 outline-none focus:border-azul-medio focus:ring-2 focus:ring-azul-claro"
      />
    </label>
  );
}

export function Boton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-lg bg-azul-principal px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Un aviso. `tono` decide si es un error o una confirmación. */
export function Aviso({ tono, children }: { tono: "error" | "bien"; children: React.ReactNode }) {
  return (
    <p
      role="status"
      className={`rounded-lg px-3 py-2 text-sm ${tono === "error" ? "bg-naranja-accion/10 text-naranja-accion-texto" : "bg-verde-concepto/10 text-verde-concepto-texto"}`}
    >
      {children}
    </p>
  );
}
