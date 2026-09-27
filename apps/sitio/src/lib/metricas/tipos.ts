// Vocabulario de la copia diaria. Sin dominio de ED: sirve para cualquier
// sitio medido con Web Analytics.
export type Dimension = "total" | "pagina" | "pais" | "referido" | "dispositivo" | "sistema" | "navegador" | "campana" | "hora";

export const DIMENSIONES: readonly Dimension[] = ["total", "pagina", "pais", "referido", "dispositivo", "sistema", "navegador", "campana", "hora"];

/** Un día `YYYY-MM-DD`, siempre UTC, como agrupa la API. */
export type Dia = string;

export type Rango = { desde: Dia; hasta: Dia };

export type FilaDiaria = {
  fecha: Dia;
  dimension: Dimension;
  valor: string; // "" en total y en la fila «el resto»; en `hora`, la hora UTC ("00" a "23")
  agrupado: boolean;
  vistas: number;
  visitantes: number;
};

/**
 * Un filtro por país de la copia: un país, o todos menos unos. Códigos ISO
 * alfa-2. Cada fuente lo traduce a su sintaxis (`cliente.ts`).
 */
export type FiltroDePais = { pais: string } | { fueraDe: readonly string[] };
