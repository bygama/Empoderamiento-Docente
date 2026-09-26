import { puede } from "@ed/auth";
import { CLAVES_DE_BANDEJA, capacidadDe, type Bandeja } from "@/config/mensajes";
import { base } from "@/datos/cliente";

// Lo que el admin lee de Mensajes (work/mensajes/SPEC.md §6 y §7). Cada
// consulta mira solo las bandejas que el rol puede ver: el número de la
// sidebar y de las pestañas cuenta lo que tu rol ve, y nada más.

/** Las bandejas que ese rol ve, en su orden. */
export function bandejasDe(rol: unknown): Bandeja[] {
  return CLAVES_DE_BANDEJA.filter((b) => puede(rol, capacidadDe(b)));
}

/** Los sin leer (estado Nuevo) de cada bandeja que ese rol ve. Las que no ve no aparecen. */
export async function nuevosPorBandeja(rol: unknown): Promise<Partial<Record<Bandeja, number>>> {
  const suyas = bandejasDe(rol);
  if (!suyas.length) return {};
  const grupos = await base.mensaje.groupBy({ by: ["bandeja"], where: { estado: "nuevo", bandeja: { in: suyas } }, _count: { _all: true } });
  return Object.fromEntries(suyas.map((b) => [b, grupos.find((g) => g.bandeja === b)?._count._all ?? 0]));
}
