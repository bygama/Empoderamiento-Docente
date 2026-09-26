import { puede } from "@ed/auth";
import { CLAVES_DE_BANDEJA, capacidadDe, type Bandeja, type EstadoDeMensaje } from "@/config/mensajes";
import type { Dato } from "@/lib/formularios/campos";
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

/** La bandeja con más sin leer de las que ese rol ve; empatadas, la primera. `null` si no ve ninguna. */
export async function bandejaConMasNuevos(rol: unknown): Promise<Bandeja | null> {
  const nuevos = await nuevosPorBandeja(rol);
  return bandejasDe(rol).reduce<Bandeja | null>((mejor, b) => (mejor && (nuevos[mejor] ?? 0) >= (nuevos[b] ?? 0) ? mejor : b), null);
}

/** Lo que muestra una fila de la bandeja. */
export type FilaDeMensaje = {
  id: string;
  nombre: string;
  /** Contacto: las primeras palabras; CV: lo que pidió el formulario (nivel, área). */
  resumen: string;
  pais: string | null;
  recibidoEn: string;
  tomadoPor: string | null;
};

/** Cuántas filas trae una bandeja por estado: con más, se busca. */
export const FILAS_POR_PANTALLA = 50;

const LARGO_DEL_RESUMEN = 80;

function resumenDe(bandeja: string, mensaje: string | null, datos: unknown): string {
  const texto = bandeja === "cv" ? (datos as Dato[]).map((d) => d.valor).join(" · ") : (mensaje ?? "");
  const plano = texto.replace(/\s+/g, " ").trim();
  return plano.length > LARGO_DEL_RESUMEN ? `${plano.slice(0, LARGO_DEL_RESUMEN - 1).trimEnd()}…` : plano;
}

/**
 * Una bandeja en un estado, lo más nuevo primero, y si hay más de las que se
 * muestran. `busqueda` mira el nombre, el correo y el texto, sin distinguir
 * mayúsculas.
 */
export async function listarMensajes({
  bandeja,
  estado,
  busqueda,
}: {
  bandeja: Bandeja;
  estado: EstadoDeMensaje;
  busqueda?: string;
}): Promise<{ filas: FilaDeMensaje[]; hayMas: boolean }> {
  const q = busqueda?.trim();
  const contiene = { contains: q, mode: "insensitive" as const };
  const coincide = q ? { OR: [{ nombre: contiene }, { correo: contiene }, { mensaje: contiene }] } : {};
  const filas = await base.mensaje.findMany({
    where: { bandeja, estado, ...coincide },
    orderBy: { recibidoEn: "desc" },
    take: FILAS_POR_PANTALLA + 1,
    select: { id: true, nombre: true, mensaje: true, datos: true, pais: true, recibidoEn: true, tomadoPor: { select: { name: true } } },
  });
  return {
    hayMas: filas.length > FILAS_POR_PANTALLA,
    filas: filas.slice(0, FILAS_POR_PANTALLA).map((f) => ({
      id: f.id,
      nombre: f.nombre,
      resumen: resumenDe(bandeja, f.mensaje, f.datos),
      pais: f.pais,
      recibidoEn: f.recibidoEn.toISOString(),
      tomadoPor: f.tomadoPor?.name ?? null,
    })),
  };
}
