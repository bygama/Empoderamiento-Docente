// Las cuentas de la `Curva` (DESIGN.md §11, «Gráficos»): la escala, los
// trazos del SVG y la frase que la resume para el lector. Puras y sin ED.

export type Punto = { dia: string; valor: number | null };

/** El tope del eje: el primer 1, 2 o 5 × 10ⁿ que alcanza al máximo, así la mitad es un número redondo. */
export function techoDe(maximo: number): number {
  if (maximo <= 0) return 1;
  const base = 10 ** Math.floor(Math.log10(maximo));
  return [1, 2, 5, 10].map((m) => m * base).find((t) => t >= maximo) ?? 10 * base;
}

/** Dónde cae cada punto en un lienzo de 100 × 100: x a lo ancho, y desde arriba. */
export function posicion(i: number, total: number, valor: number, techo: number): { x: number; y: number } {
  return { x: total === 1 ? 50 : (i / (total - 1)) * 100, y: 100 - (valor / techo) * 100 };
}

/**
 * La línea y el área, cortadas donde no hay dato (`null`): antes de la
 * primera copia no se inventa nada. Cada tramo es una `M … L …`; el área
 * baja hasta el piso en las dos puntas del tramo.
 */
export function trazosDe(puntos: readonly Punto[], techo: number): { linea: string; area: string } {
  const tramos: Array<Array<{ x: number; y: number }>> = [];
  let actual: Array<{ x: number; y: number }> = [];
  puntos.forEach((p, i) => {
    if (p.valor === null) {
      if (actual.length) tramos.push(actual);
      actual = [];
    } else actual.push(posicion(i, puntos.length, p.valor, techo));
  });
  if (actual.length) tramos.push(actual);
  const lista = (t: Array<{ x: number; y: number }>) => t.map((q) => `${q.x.toFixed(2)} ${q.y.toFixed(2)}`).join(" L ");
  return {
    linea: tramos.map((t) => `M ${lista(t)}`).join(" "),
    area: tramos.map((t) => `M ${t[0].x.toFixed(2)} 100 L ${lista(t)} L ${t[t.length - 1].x.toFixed(2)} 100 Z`).join(" "),
  };
}

const dia = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: "UTC" });

/** «12 de septiembre», de un día `AAAA-MM-DD`. */
export function diaLargo(d: string): string {
  return dia.format(new Date(`${d}T00:00:00.000Z`));
}

/** «Visitantes por día del 1 al 30 de septiembre: entre 3 y 41, con el pico el 12 de septiembre.» */
export function fraseDeLaCurva(nombre: string, puntos: readonly Punto[]): string {
  const conDato = puntos.filter((p): p is { dia: string; valor: number } => p.valor !== null);
  if (!conDato.length) return `${nombre}: todavía no hay datos.`;
  const pico = conDato.reduce((a, b) => (b.valor > a.valor ? b : a));
  const minimo = Math.min(...conDato.map((p) => p.valor));
  return `${nombre} del ${diaLargo(puntos[0].dia)} al ${diaLargo(puntos[puntos.length - 1].dia)}: entre ${minimo} y ${pico.valor}, con el pico el ${diaLargo(pico.dia)}.`;
}
