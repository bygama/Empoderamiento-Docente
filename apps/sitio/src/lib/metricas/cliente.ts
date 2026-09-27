import type { Dimension, FilaDiaria, FiltroDePais, Rango } from "./tipos";

// Lo que cumple cada fuente de visitas (Vercel Web Analytics en `vercel.ts`,
// Umami en `umami.ts`): la copia diaria le habla a esta interfaz y no sabe cuál
// tiene del otro lado. Sin dominio de ED.

export class ErrorDeAnaliticas extends Error {
  constructor(
    readonly estado: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorDeAnaliticas";
  }
}

export type ClienteDeAnaliticas = {
  /** Por día (o por hora, en `hora`), con un filtro por país opcional. */
  porDia(rango: Rango, dimension: Dimension, filtro?: FiltroDePais): Promise<FilaDiaria[]>;
  /** Vistas y visitantes únicos del rango entero. */
  ventana(rango: Rango): Promise<{ vistas: number; visitantes: number }>;
};

const CODIGO_DE_PAIS = /^[A-Z]{2}$/;

/**
 * Los países de un filtro, validados: viajan adentro de una consulta, así que
 * no pasa nada que no sea un código ISO de dos letras.
 */
export function paisesDelFiltro(filtro: FiltroDePais): string[] {
  const paises = "pais" in filtro ? [filtro.pais] : [...filtro.fueraDe];
  for (const p of paises) if (!CODIGO_DE_PAIS.test(p)) throw new Error(`«${p}» no es un código de país ISO de dos letras.`);
  return paises;
}
