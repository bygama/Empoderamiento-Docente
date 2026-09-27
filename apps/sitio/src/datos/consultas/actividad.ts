import type { Prisma } from "@/../prisma/generado/client";
import { puede } from "@ed/auth";
import { esTipoDeActividad, tiposQueVe, type TipoDeActividad } from "@/datos/actividad";
import { base } from "@/datos/cliente";

/**
 * La actividad del admin para leerla: Cuentas › Actividad (SPEC de
 * work/cuentas §4.4). Paginada en la base, porque la tabla guarda 12 meses.
 * Recibe tipos y no módulos: qué tipos son de qué módulo lo decide la
 * pantalla. **Recibe primero el rol de quien mira**: sin `usarCuentas` no lee
 * nada, y de los tipos pedidos se queda con los que ese rol ve (`QUIEN_VE`).
 * La guarda del layout no alcanza: la página viaja en el payload igual.
 */

export const POR_PAGINA = 50;

export type FiltrosDeActividad = {
  /** Los que pide la pantalla (un módulo, o todos); vacío es nada. */
  tipos: readonly TipoDeActividad[];
  /** El id de una cuenta. */
  persona?: string;
  /** Solo los últimos tantos días: un rango relativo, que no depende de la zona de quien mira. */
  dias?: number;
  /** Se busca, sin distinguir mayúsculas, en el `sobre` y en el nombre de quien lo hizo. */
  texto?: string;
  pagina: number;
};

export type FilaDeActividad = {
  id: string;
  tipo: TipoDeActividad;
  quien: string;
  quienId: string;
  sobre: string | null;
  sobreId: string | null;
  /** ISO. */
  en: string;
};

export type PaginaDeActividad = { filas: FilaDeActividad[]; total: number; pagina: number; paginas: number };

const NADA: PaginaDeActividad = { filas: [], total: 0, pagina: 1, paginas: 1 };

export async function listarActividad(rolDeQuienMira: unknown, { tipos: pedidos, persona, dias, texto, pagina }: FiltrosDeActividad): Promise<PaginaDeActividad> {
  if (!puede(rolDeQuienMira, "usarCuentas")) return NADA;
  const visibles = new Set(tiposQueVe(rolDeQuienMira));
  const tipos = pedidos.filter((t) => visibles.has(t));
  if (!tipos.length) return NADA;
  const desde = dias ? new Date(Date.now() - dias * 24 * 60 * 60 * 1000) : undefined;
  const where: Prisma.ActividadWhereInput = {
    tipo: { in: [...tipos] },
    ...(persona ? { cuentaId: persona } : {}),
    ...(desde ? { en: { gte: desde } } : {}),
    ...(texto
      ? { OR: [{ sobre: { contains: texto, mode: "insensitive" } }, { cuenta: { name: { contains: texto, mode: "insensitive" } } }] }
      : {}),
  };
  const total = await base.actividad.count({ where });
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  // Una página que ya no existe (se podó, o la URL es vieja) muestra la última.
  const esta = Math.min(Math.max(1, Math.trunc(pagina)), paginas);
  const filas = await base.actividad.findMany({
    where,
    orderBy: [{ en: "desc" }, { id: "desc" }],
    skip: (esta - 1) * POR_PAGINA,
    take: POR_PAGINA,
    select: { id: true, tipo: true, sobre: true, sobreId: true, en: true, cuenta: { select: { id: true, name: true } } },
  });
  return {
    filas: filas.flatMap((f) =>
      esTipoDeActividad(f.tipo)
        ? [{ id: f.id, tipo: f.tipo, quien: f.cuenta.name, quienId: f.cuenta.id, sobre: f.sobre, sobreId: f.sobreId, en: f.en.toISOString() }]
        : [],
    ),
    total,
    pagina: esta,
    paginas,
  };
}
