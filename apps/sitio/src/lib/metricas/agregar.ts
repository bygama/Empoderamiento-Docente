import { CANALES, canalDe, type Canal } from "./canales";
import { sumarDias } from "./periodos";
import type { Dia } from "./tipos";

// Las cuentas que hacen las pantallas de Métricas sobre las filas copiadas:
// sumar por valor, repartir los referidos en canales, armar la curva. Puras y
// sin dominio de ED.

export type FilaCopiada = { valor: string; agrupado: boolean; vistas: number; visitantes: number };

export type Medida = "vistas" | "visitantes";

/**
 * Las filas sumadas por valor, de mayor a menor. «El resto» de la API
 * (`agrupado`) no es un valor: va aparte, en `resto`.
 */
export function sumarPorValor(filas: readonly FilaCopiada[], medida: Medida): { valores: Array<{ valor: string; total: number }>; resto: number } {
  const suma = new Map<string, number>();
  let resto = 0;
  for (const f of filas) {
    if (f.agrupado) resto += f[medida];
    else suma.set(f.valor, (suma.get(f.valor) ?? 0) + f[medida]);
  }
  const valores = [...suma].map(([valor, total]) => ({ valor, total })).sort((a, b) => b.total - a.total || a.valor.localeCompare(b.valor));
  return { valores, resto };
}

/**
 * Las visitas de cada canal, en el orden de `CANALES` y con los cinco aunque
 * sumen cero. «El resto» de la API va a Otros sitios; el propio sitio no es
 * un canal y no suma.
 */
export function visitasPorCanal(referidos: readonly FilaCopiada[], propio?: string): Array<{ canal: Canal; visitas: number }> {
  const suma = new Map<Canal, number>(CANALES.map((c) => [c, 0]));
  for (const f of referidos) {
    const canal = f.agrupado ? "otros-sitios" : canalDe(f.valor, propio);
    if (canal) suma.set(canal, (suma.get(canal) ?? 0) + f.visitantes);
  }
  return CANALES.map((canal) => ({ canal, visitas: suma.get(canal) ?? 0 }));
}

/** Qué parte de `total` es `valor`, en un entero de 0 a 100. */
export function parte(valor: number, total: number): number {
  return total > 0 ? Math.round((valor / total) * 100) : 0;
}

export type PuntoDeLaCurva = { dia: Dia; valor: number | null };

/**
 * Un punto por día del período. Un día que la API no trajo después del primer
 * día copiado es un cero (no entró nadie); uno antes, `null`: todavía no
 * había copia y no se dibuja.
 */
export function curvaDe(porDia: ReadonlyMap<Dia, number>, { desde, hasta, primero }: { desde: Dia; hasta: Dia; primero: Dia | null }): PuntoDeLaCurva[] {
  const puntos: PuntoDeLaCurva[] = [];
  for (let dia = desde; dia <= hasta; dia = sumarDias(dia, 1)) {
    puntos.push({ dia, valor: porDia.get(dia) ?? (primero !== null && dia >= primero ? 0 : null) });
  }
  return puntos;
}
