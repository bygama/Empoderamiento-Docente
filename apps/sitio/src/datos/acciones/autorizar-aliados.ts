import { z } from "zod";
import { puede, SIN_PERMISO } from "@ed/auth";
import type { PrismaClient } from "@/../prisma/generado/client";
import { TOPES } from "@/features/aliados/contenido/modelo";
import { NO_EXISTE, nombreDelAliado } from "./aliados-en-base";
import type { Fallo } from "./choque";

// La marca «Autorizado» de un aliado y su lugar en la tira
// (`work/casos-aliados-fotos/SPEC.md` §5 y §5.1), con el cliente inyectado.
// La marca no va al borrador: es un hecho sobre ED y rige ya. La pone solo
// quien puede `autorizarAliados`: la acción lo chequea, y esto lo vuelve a
// chequear con el rol, así ninguna otra puerta la salta.

export const esquemaNota = z
  .string()
  .trim()
  .min(1, "Escribí dónde consta la autorización: la carta, el mail o la carpeta.")
  .max(TOPES.autorizacion, `Como mucho ${TOPES.autorizacion} caracteres.`);

export async function autorizarAliadoEnBase(
  base: PrismaClient,
  { id, autorizado, nota, rol, quien }: { id: string; autorizado: boolean; nota: unknown; rol: unknown; quien: string },
): Promise<{ ok: true; detalle: string; nombre: string; cambio: boolean } | Fallo> {
  if (!puede(rol, "autorizarAliados")) return { ok: false, detalle: SIN_PERMISO };
  const fila = await base.aliado.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  const nombre = nombreDelAliado(fila);
  if (!autorizado) {
    if (!fila.autorizado) return { ok: true, detalle: "No estaba autorizado.", nombre, cambio: false };
    await base.aliado.update({ where: { id }, data: { autorizado: false, autorizadoEn: new Date(), autorizadoPor: quien } });
    return { ok: true, detalle: "Se quitó la autorización: el logo ya no está en la tira, aunque siga publicado.", nombre, cambio: true };
  }
  const valida = esquemaNota.safeParse(nota);
  if (!valida.success) return { ok: false, detalle: valida.error.issues[0]?.message ?? "Falta la nota." };
  await base.aliado.update({ where: { id }, data: { autorizado: true, autorizacion: valida.data, autorizadoEn: new Date(), autorizadoPor: quien } });
  const detalle = fila.publicado ? "Autorizado: el logo vuelve a la tira." : "Autorizado: ya se puede publicar.";
  return { ok: true, detalle, nombre, cambio: !fila.autorizado };
}

/** Sube o baja un lugar en la tira, cambiándolo con el de al lado. En una punta, no hace nada. */
export async function moverAliadoEnBase(base: PrismaClient, { id, hacia }: { id: string; hacia: "antes" | "despues" }): Promise<{ ok: true; movio: boolean } | Fallo> {
  const filas = await base.aliado.findMany({ orderBy: [{ orden: "asc" }, { creadoEn: "asc" }], select: { id: true, orden: true } });
  const i = filas.findIndex((f) => f.id === id);
  if (i < 0) return NO_EXISTE;
  const j = hacia === "antes" ? i - 1 : i + 1;
  if (j < 0 || j >= filas.length) return { ok: true, movio: false };
  // Se renumera toda la tira en su orden nuevo: así un orden repetido de antes no deja dos en el mismo lugar.
  const nuevo = filas.map((f) => f.id);
  [nuevo[i], nuevo[j]] = [nuevo[j], nuevo[i]];
  await base.$transaction(nuevo.map((idDe, k) => base.aliado.update({ where: { id: idDe }, data: { orden: k + 1 } })));
  return { ok: true, movio: true };
}
