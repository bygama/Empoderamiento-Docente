import { esEstado, type Bandeja, type EstadoDeMensaje } from "@/config/mensajes";
import { seBorraEl } from "@/config/privacidad";
import type { Dato } from "@/lib/formularios/campos";
import { base } from "@/datos/cliente";

// La ficha de un mensaje o de un CV (work/mensajes/SPEC.md §6). Quien la pide
// ya pasó por la guarda de su bandeja.

/** Todo lo que muestra la ficha de un mensaje o de un CV. */
export type FichaDeMensaje = {
  id: string;
  bandeja: Bandeja;
  estado: EstadoDeMensaje;
  recibidoEn: string;
  /** Cuándo lo borra la retención (`config/privacidad.ts`). */
  seBorraEl: string;
  nombre: string;
  correo: string;
  pais: string | null;
  tema: string | null;
  mensaje: string | null;
  datos: Dato[];
  tomadoPor: { id: string; nombre: string } | null;
  /** El peso del CV; null si no tiene archivo. El archivo no sale de acá: lo manda la ruta de descarga. */
  archivoBytes: number | null;
};

/** La ficha de un mensaje de esa bandeja, o `null` si no está (o es de otra bandeja). */
export async function fichaDeMensaje(bandeja: Bandeja, id: string): Promise<FichaDeMensaje | null> {
  const m = await base.mensaje.findFirst({ where: { id, bandeja }, include: { tomadoPor: { select: { id: true, name: true } } } });
  if (!m) return null;
  const estado = esEstado(m.estado) ? m.estado : "nuevo";
  return {
    id: m.id,
    bandeja,
    estado,
    recibidoEn: m.recibidoEn.toISOString(),
    seBorraEl: seBorraEl({ bandeja, estado, recibidoEn: m.recibidoEn, estadoEn: m.estadoEn }).toISOString(),
    nombre: m.nombre,
    correo: m.correo,
    pais: m.pais,
    tema: m.tema,
    mensaje: m.mensaje,
    datos: m.datos as Dato[],
    tomadoPor: m.tomadoPor ? { id: m.tomadoPor.id, nombre: m.tomadoPor.name } : null,
    archivoBytes: m.archivo ? m.archivoBytes : null,
  };
}
