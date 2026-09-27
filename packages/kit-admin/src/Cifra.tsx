const numero = new Intl.NumberFormat("es-AR");

// La variación llega en una de cuatro formas («+N %», «−N %», «igual»,
// «sin datos previos»); acá cada una se traduce a
// la frase que se lee debajo del número, contra el período que se compara.
function leyendaDe(variacion: string, periodo: string): string {
  if (variacion.startsWith("+") || variacion.startsWith("−")) return `${variacion} contra ${periodo}`;
  if (variacion === "igual") return `Igual que ${periodo}`;
  return "Sin datos previos";
}

type Props = {
  etiqueta: string;
  /** `null` cuando no hay datos: se dibuja «—», nunca un cero inventado. */
  valor: number | null;
  /**
   * Sin `variacion` no lleva comparación: una posición en un ranking no se
   * compara en porcentaje, porque bajar es mejorar y se leería al revés.
   */
  variacion?: string;
  /** Contra qué se compara: «el período anterior», «la semana anterior». */
  periodo?: string;
  /** Lo que se lee abajo en lugar de la comparación: «No se pudo leer». */
  nota?: string;
};

/**
 * Una cifra con su comparación (DESIGN.md §11, «Cifra»). La comparación va sin color:
 * subir no siempre es mejorar, y el rojo es solo para errores. Sin datos,
 * «—» con «Todavía no hay datos», y el lector oye «Sin datos» en vez de un
 * guion. No sabe de ED.
 */
export function Cifra({ etiqueta, valor, variacion, periodo = "el período anterior", nota }: Props) {
  const pie = nota ?? (valor === null ? "Todavía no hay datos" : variacion ? leyendaDe(variacion, periodo) : null);
  return (
    <div className="rounded-xl border border-azul-claro bg-white p-4">
      <p className="text-admin-meta text-gris-texto">{etiqueta}</p>
      <p className="mt-1 font-display text-admin-titulo font-bold">
        {valor === null ? (
          <>
            <span aria-hidden="true">—</span>
            <span className="sr-only">Sin datos</span>
          </>
        ) : (
          numero.format(valor)
        )}
      </p>
      {pie ? <p className="mt-1 text-admin-meta text-gris-texto">{pie}</p> : null}
    </div>
  );
}
