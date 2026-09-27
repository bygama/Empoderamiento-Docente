import type { Periodo } from "@/lib/metricas/periodos";

// Cómo se dicen los números en las pantallas de Métricas: con los miles de
// `es-AR` y la palabra en singular o en plural.

const numero = new Intl.NumberFormat("es-AR");

/** «1 visita», «1.234 visitas». */
export function cuantas(n: number, una: string, varias: string): string {
  return `${numero.format(n)} ${n === 1 ? una : varias}`;
}

/** «los 30 días anteriores»: contra qué se compara una cifra de ese período. */
export function periodoAnterior(periodo: Periodo): string {
  return `los ${periodo} días anteriores`;
}
