import type { Prisma } from "@/../prisma/generado/client";

// Qué es un uso de una foto y qué declara cada módulo en el registro
// (registro.ts). Aparte del registro para que las entradas lo importen sin
// importar la lista que las junta.

/** Dónde está un uso: en lo que el sitio muestra, solo en algo sin publicar, o en el contenido inicial del código. */
export type Donde = "sitio" | "sin-publicar" | "codigo";

export type Uso = {
  src: string;
  /** En llano: «Inicio › Hero › Tarjeta 3», «Novedad «UNESCO Montevideo…»», «Caso 01 › Lámina». */
  donde: string;
  /** La pantalla del admin que lo edita. */
  enlace: string;
  en: Donde;
  /** El alt con que va ahí: el alt es de cada uso. */
  alt: string;
};

/** Lo que hay que regenerar del sitio después de cambiar una foto: una ruta, o el layout entero (lo que va en el pie). */
export type Regenerar = { ruta: string; layout?: true };

export type UsosDeUnModulo = {
  modulo: string;
  /** Todos los usos del módulo, de todas las fotos. Son decenas de filas: se leen enteras. */
  buscar: (base: Prisma.TransactionClient) => Promise<Uso[]>;
  /** Cambia la URL vieja por la nueva en todo lo que el módulo guarda en la base; dice qué regenerar. */
  reemplazar: (tx: Prisma.TransactionClient, vieja: string, nueva: string) => Promise<Regenerar[]>;
};

/**
 * Suma los usos de otra copia (un borrador) sin repetir los que ya están:
 * un borrador suele ser lo publicado con un cambio, y la misma foto en el
 * mismo lugar ya se contó.
 */
export function sinRepetir(ya: readonly Uso[], nuevos: readonly Uso[]): Uso[] {
  return [...ya, ...nuevos.filter((n) => !ya.some((u) => u.src === n.src && u.donde === n.donde))];
}
