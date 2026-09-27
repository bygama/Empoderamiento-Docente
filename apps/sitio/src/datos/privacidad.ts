import { cache } from "react";
import { puede } from "@ed/auth";
import { PLAZOS_INICIALES, vencidos, type Plazo, type PlazosDeGuarda, type Tramo } from "@/config/privacidad";
import { base } from "./cliente";

// Los plazos de retención de la base (`plazos_de_retencion`, work/ajustes/SPEC.md
// §4): cada plazo con su historial. La política —cómo se cuentan— vive en
// `config/privacidad.ts`, sin base.

type Fila = { que: string; valor: number; desde: Date };

/** Desde siempre: lo que rige si una bandeja no tiene historial. */
const SIEMPRE = new Date(0);

/** Las filas, del más viejo al más nuevo, con la forma de la política. Un valor que no es un entero positivo no rige. */
export function armarPlazos(filas: readonly Fila[]): PlazosDeGuarda {
  const de = (que: string): Tramo[] =>
    filas
      .filter((f) => f.que === que && Number.isInteger(f.valor) && f.valor >= 1)
      .sort((a, b) => a.desde.getTime() - b.desde.getTime())
      .map(({ desde, valor }) => ({ desde, valor }));
  const conHistorial = (que: "cv" | "contacto") => {
    const tramos = de(que);
    return tramos.length ? tramos : [{ desde: SIEMPRE, valor: PLAZOS_INICIALES[que] }];
  };
  return { cv: conHistorial("cv"), contacto: conHistorial("contacto"), spam: de("spam").at(-1)?.valor ?? PLAZOS_INICIALES.spam };
}

const consultarFilas = () => base.plazoDeRetencion.findMany({ select: { que: true, valor: true, desde: true } });

/**
 * Los plazos, **sin respaldo**: si la base no contesta, tira. Lo usan las
 * tareas que borran y Ajustes: borrar con un plazo supuesto borraría antes de
 * lo prometido, o guardaría de más.
 */
export async function plazosDeLaBase(): Promise<PlazosDeGuarda> {
  return armarPlazos(await consultarFilas());
}

/**
 * Los plazos para lo que se muestra (las líneas de privacidad de los
 * formularios, la ficha, el Inicio), con las reglas de `datosDelSitio`: sin
 * DATABASE_URL o si la consulta tira en una visita, los de antes; durante
 * `next build`, con base configurada, el error. `consultar` se inyecta para
 * probarlo sin base.
 */
export async function leerPlazos(consultar: () => Promise<Fila[]> = consultarFilas): Promise<PlazosDeGuarda> {
  if (!process.env.DATABASE_URL) return armarPlazos([]);
  try {
    return armarPlazos(await consultar());
  } catch (e) {
    if (process.env.NEXT_PHASE === "phase-production-build") throw e;
    console.error("plazosDeGuarda:", e instanceof Error ? e.message : e);
    return armarPlazos([]);
  }
}

/** Los plazos para mostrar, una vez por pedido (`cache` de React). */
export const plazosDeGuarda = cache(() => leerPlazos());

/**
 * Lo que llegó y ya pasó su plazo, como condición de `mensajes`: la usan la
 * tarea que borra y el pendiente del Inicio, así cuentan lo mismo.
 */
export const llegoVencido = (tramos: readonly Tramo[], hoy: Date) => ({
  OR: vencidos(tramos, hoy).map(({ desde, antesDe }) => ({ recibidoEn: { gte: desde, lt: antesDe } })),
});

export type PlazoParaEditar = { valor: number; /** null: rige desde siempre. */ desde: Date | null; puestoPor: string | null };

/** Lo que rige de cada plazo, con desde cuándo y quién lo puso: Ajustes › Privacidad. Sin `usarAjustes`, `null`. */
export async function plazosParaEditar(rol: unknown): Promise<Record<Plazo, PlazoParaEditar> | null> {
  if (!puede(rol, "usarAjustes")) return null;
  const filas = await base.plazoDeRetencion.findMany({ orderBy: { desde: "desc" } });
  const de = (que: Plazo): PlazoParaEditar => {
    const fila = filas.find((f) => f.que === que && Number.isInteger(f.valor) && f.valor >= 1);
    if (!fila) return { valor: PLAZOS_INICIALES[que], desde: null, puestoPor: null };
    return { valor: fila.valor, desde: fila.desde.getTime() === SIEMPRE.getTime() ? null : fila.desde, puestoPor: fila.puestoPor };
  };
  return { cv: de("cv"), contacto: de("contacto"), spam: de("spam") };
}
