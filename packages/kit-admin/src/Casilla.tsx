type Props = {
  nombre: string;
  etiqueta: string;
  /** Lo que pasa si se marca, en una frase: se lee antes de marcar. */
  ayuda?: React.ReactNode;
  valor: boolean;
  alCambiar: (valor: boolean) => void;
  /** Lo que el último guardado dijo de este campo. */
  error?: string;
};

/**
 * Sí o no, con su etiqueta al lado y la ayuda debajo. La casilla es la del
 * navegador con el tilde en `azul-principal` (`accent-*`); la etiqueta entera
 * la marca, así el blanco es de 40 px de alto aunque la casilla mida 16.
 */
export function Casilla({ nombre, etiqueta, ayuda, valor, alCambiar, error }: Props) {
  const idAyuda = `${nombre}-ayuda`;
  const idError = `${nombre}-error`;
  return (
    <div>
      <label className="flex min-h-10 cursor-pointer items-center gap-2 text-admin-meta font-medium">
        <input
          id={`${nombre}-campo`}
          type="checkbox"
          checked={valor}
          aria-describedby={[ayuda ? idAyuda : "", error ? idError : ""].filter(Boolean).join(" ") || undefined}
          aria-invalid={error ? true : undefined}
          onChange={(e) => alCambiar(e.target.checked)}
          className="size-4 shrink-0 accent-azul-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio"
        />
        {etiqueta}
      </label>
      {ayuda ? (
        <p id={idAyuda} className="text-admin-meta text-gris-texto">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={idError} className="mt-1 text-admin-meta text-rojo-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
