import { z } from "zod";
import { puede, SIN_PERMISO } from "@ed/auth";
import type { PrismaClient } from "@/../prisma/generado/client";
import { publicadoDeAliado } from "@/datos/consultas/aliados";
import { estaAutorizado, loQueSeAutoriza } from "@/features/aliados/contenido/autorizacion";
import { TOPES } from "@/features/aliados/contenido/modelo";
import { NO_EXISTE, nombreDelAliado } from "./aliados-en-base";
import type { Fallo } from "./choque";

// La marca «Autorizado» de un aliado y su lugar en la tira
// (`work/casos-aliados-fotos/SPEC.md` §5 y §5.1), con el cliente inyectado.
// La marca no va al borrador: es un hecho sobre ED y rige ya. La pone solo
// quien puede `autorizarAliados`: la acción lo chequea, y esto lo vuelve a
// chequear con el rol, así ninguna otra puerta la salta. **Queda atada a lo
// que se autorizó**: guarda el logo, el nombre y el texto del logo (los del
// borrador si se puede publicar; si no, los publicados), y quien autoriza
// manda los que vio, así no autoriza algo que cambió mientras lo miraba.

export const esquemaNota = z
  .string()
  .trim()
  .min(1, "Escribí dónde consta la autorización: la carta, el mail o la carpeta.")
  .max(TOPES.autorizacion, `Como mucho ${TOPES.autorizacion} caracteres.`);

export async function autorizarAliadoEnBase(
  base: PrismaClient,
  { id, autorizado, nota, rol, quien, visto }: { id: string; autorizado: boolean; nota: unknown; rol: unknown; quien: string; visto?: { logo: string; nombre: string; alt: string } },
): Promise<{ ok: true; detalle: string; nombre: string; cambio: boolean } | Fallo> {
  if (!puede(rol, "autorizarAliados")) return { ok: false, detalle: SIN_PERMISO };
  const fila = await base.aliado.findUnique({ where: { id } });
  if (!fila) return NO_EXISTE;
  const nombre = nombreDelAliado(fila);
  if (!autorizado) {
    if (!fila.autorizado) return { ok: true, detalle: "No estaba autorizado.", nombre, cambio: false };
    await base.aliado.update({
      where: { id },
      data: { autorizado: false, autorizadoLogo: null, autorizadoNombre: null, autorizadoAlt: null, autorizadoEn: new Date(), autorizadoPor: quien },
    });
    return { ok: true, detalle: "Se quitó la autorización: el logo ya no está en la tira, aunque siga publicado.", nombre, cambio: true };
  }
  const valida = esquemaNota.safeParse(nota);
  if (!valida.success) return { ok: false, detalle: valida.error.issues[0]?.message ?? "Falta la nota." };
  const publicado = publicadoDeAliado(fila);
  const documento = loQueSeAutoriza(fila.borrador, publicado);
  if (!documento) return { ok: false, detalle: "Todavía no hay qué autorizar: completá el nombre y el logo y guardá el borrador." };
  if (visto && (visto.logo !== documento.logo.src || visto.nombre !== documento.nombre || visto.alt !== documento.logo.alt)) {
    return { ok: false, detalle: "Lo guardado cambió mientras lo mirabas: recargá para ver qué logo, qué nombre y qué texto autorizás." };
  }
  const marca = { autorizado: true, autorizadoLogo: documento.logo.src, autorizadoNombre: documento.nombre, autorizadoAlt: documento.logo.alt };
  // Solo si lo autorizado sigue como se leyó: dos que autorizan a la vez no se pisan sin verse.
  const { count } = await base.aliado.updateMany({
    where: { id, autorizadoLogo: fila.autorizadoLogo, autorizadoNombre: fila.autorizadoNombre, autorizadoAlt: fila.autorizadoAlt },
    data: { ...marca, autorizacion: valida.data, autorizadoEn: new Date(), autorizadoPor: quien },
  });
  if (!count) return { ok: false, detalle: "Otra persona cambió la autorización mientras tanto: recargá para ver cómo quedó." };
  const valePublicado = fila.publicado && loQueSeAutoriza(null, publicado);
  const enLaTira = valePublicado ? estaAutorizado(valePublicado, marca) : false;
  const detalle = enLaTira ? `Autorizado: «${documento.nombre}» está en la tira.` : `Autorizado «${documento.nombre}» con ese logo: ya se puede publicar.`;
  return { ok: true, detalle, nombre: documento.nombre, cambio: !estaAutorizado(documento, fila) };
}

/** Sube o baja un lugar en la tira, cambiándolo con el de al lado. En una punta, no hace nada. */
export async function moverAliadoEnBase(base: PrismaClient, { id, hacia }: { id: string; hacia: "antes" | "despues" }): Promise<{ ok: true; movio: boolean } | Fallo> {
  const filas = await base.aliado.findMany({ orderBy: [{ orden: "asc" }, { creadoEn: "asc" }], select: { id: true, orden: true } });
  const i = filas.findIndex((f) => f.id === id);
  if (i < 0) return NO_EXISTE;
  const j = hacia === "antes" ? i - 1 : i + 1;
  if (j < 0 || j >= filas.length) return { ok: true, movio: false };
  // Se renumera toda la tira en su orden nuevo: así un orden repetido de antes no deja dos en el mismo lugar.
  // `updateMany` y no `update`: si alguien borró un aliado entre la lectura y esto, se saltea en vez de tirar.
  const nuevo = filas.map((f) => f.id);
  [nuevo[i], nuevo[j]] = [nuevo[j], nuevo[i]];
  await base.$transaction(nuevo.map((idDe, k) => base.aliado.updateMany({ where: { id: idDe }, data: { orden: k + 1 } })));
  return { ok: true, movio: true };
}
