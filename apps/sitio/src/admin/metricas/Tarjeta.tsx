const numero = new Intl.NumberFormat("es-AR");

// variacion() (lib/metricas/periodos.ts) devuelve una de cuatro formas
// («+N %», «−N %», «igual», «sin datos previos»); acá cada una se traduce a
// la frase que se lee debajo del número.
function leyendaDe(variacion: string): string {
  if (variacion.startsWith("+") || variacion.startsWith("−")) return `${variacion} contra el período anterior`;
  if (variacion === "igual") return "Igual que el período anterior";
  return "Sin datos previos";
}

export function Tarjeta({ etiqueta, valor, variacion }: { etiqueta: string; valor: number; variacion: string }) {
  return (
    <div className="rounded-xl border border-azul-claro bg-white p-4">
      <p className="text-sm text-gris-texto">{etiqueta}</p>
      <p className="mt-1 font-[family-name:var(--font-manrope)] text-3xl font-bold">{numero.format(valor)}</p>
      <p className="mt-1 text-xs text-gris-texto">{leyendaDe(variacion)}</p>
    </div>
  );
}
