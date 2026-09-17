import type { StageVariant } from "@/features/quienes-somos/data/equipo";

export const cx = (...p: Array<string | false | undefined>) => p.filter(Boolean).join(" ");

/** Ancho del bloque de contenido por variante (clases literales p/ Tailwind). */
export const CONTENT_W: Record<StageVariant | "default", string> = {
  editorial: "max-w-[36rem]",
  ficha: "max-w-[34rem]",
  concepto: "max-w-[34rem]",
  hitos: "max-w-[36rem]",
  mapa: "max-w-[38rem]",
  ramas: "max-w-[40rem]",
  sintesis: "max-w-[36rem]",
  default: "max-w-[36rem]",
};

/* Pose final (sidebar) del bloque de identidad, en px (se anima font-size).
 * `roleMaxW` = ancho de la columna del índice (w-[14.5rem]): el cargo tiene que
 * PLEGARSE ahí. Sin ese límite, un cargo largo —«Líder de Pensamiento
 * Aritmético y Algebraico»— sigue en una sola línea y se mete por encima del
 * contenido de las etapas. En el hero no aplica: ahí el cargo tiene ancho de
 * sobra y va en una línea. */
export const ID_FINAL = { line1: 15, line2: 21, role: 10.5, roleGap: 8, roleMaxW: 232 };
