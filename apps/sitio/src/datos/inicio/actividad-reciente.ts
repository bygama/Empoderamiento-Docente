import { tiposQueVe, type TipoDeActividad } from "@/datos/actividad";
import { base } from "@/datos/cliente";

/** Un evento de la actividad listo para mostrar: quién, qué, sobre qué y cuándo (ISO). */
export type EventoReciente = { id: string; tipo: TipoDeActividad; quien: string; sobre: string | null; en: string };

/**
 * Los últimos eventos que ese rol puede ver (`QUIEN_VE`, en
 * `datos/actividad.ts`), el más nuevo primero. Sin ningún tipo visible no
 * consulta: devuelve la lista vacía.
 */
export async function actividadReciente(rol: unknown, cuantos = 8): Promise<EventoReciente[]> {
  const tipos = tiposQueVe(rol);
  if (!tipos.length) return [];
  const filas = await base.actividad.findMany({
    where: { tipo: { in: tipos } },
    orderBy: { en: "desc" },
    take: cuantos,
    select: { id: true, tipo: true, sobre: true, en: true, cuenta: { select: { name: true } } },
  });
  // La columna es texto; el `where` ya la limitó a los tipos visibles, y esto
  // recupera el tipo cerrado sin un `as`.
  return filas.flatMap((f) => {
    const tipo = tipos.find((t) => t === f.tipo);
    return tipo ? [{ id: f.id, tipo, quien: f.cuenta.name, sobre: f.sobre, en: f.en.toISOString() }] : [];
  });
}
