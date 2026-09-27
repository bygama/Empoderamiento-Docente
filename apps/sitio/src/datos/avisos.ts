import { puede } from "@ed/auth";
import { AVISOS, CLAVES_DE_AVISO, type ClaveDeAviso } from "@/config/avisos";
import { BANDEJAS, type Bandeja } from "@/config/mensajes";
import { mensajeNuevo } from "@/correos/mensaje-nuevo";
import { mandarCorreo } from "@/correos/mandar";
import { urlDelSitio } from "@/lib/url-del-sitio";
import { base } from "./cliente";

/**
 * Quién recibe cada aviso por correo (tabla `avisos`), recorriendo el registro
 * de `config/avisos.ts`. **Sin fila, vale `deFabrica`**: los de una bandeja
 * vienen prendidos, el resumen semanal viene apagado. Lo leen y escriben Mi
 * cuenta › Avisos (la cuenta propia) y Ajustes › Avisos (todas), con estas
 * mismas funciones. Recibe una cuenta activa cuyo rol tiene la capacidad del
 * aviso (`puede`, nunca el string de un rol): una suspendida no entra al
 * admin, y no recibe nada.
 */

export type Destinatario = { id: string; nombre: string; correo: string };

/** Si una cuenta recibe el aviso, con sus filas de `avisos`: la suya si la tiene, o lo de fábrica. */
function recibe(aviso: ClaveDeAviso, filas: ReadonlyArray<{ aviso: string; activo: boolean }>): boolean {
  return filas.find((f) => f.aviso === aviso)?.activo ?? AVISOS[aviso].deFabrica;
}

/** Las cuentas que reciben ese aviso: activas, con la capacidad, y con el aviso prendido. */
export async function destinatariosDe(aviso: ClaveDeAviso): Promise<Destinatario[]> {
  // Prendido de fábrica: todas menos las que lo apagaron. Apagado: solo las que lo prendieron.
  const filtro = AVISOS[aviso].deFabrica ? { none: { aviso, activo: false } } : { some: { aviso, activo: true } };
  const cuentas = await base.user.findMany({
    where: { suspendida: false, avisos: filtro },
    select: { id: true, name: true, email: true, rol: true },
    orderBy: { createdAt: "asc" },
  });
  return cuentas.filter((c) => puede(c.rol, AVISOS[aviso].capacidad)).map((c) => ({ id: c.id, nombre: c.name, correo: c.email }));
}

/** Los avisos de una cuenta: uno por aviso del registro que su rol puede recibir, con si está activo. */
export async function avisosDe(cuentaId: string, rol: unknown): Promise<Array<{ aviso: ClaveDeAviso; activo: boolean }>> {
  const filas = await base.aviso.findMany({ where: { cuentaId }, select: { aviso: true, activo: true } });
  return CLAVES_DE_AVISO.filter((a) => puede(rol, AVISOS[a].capacidad)).map((aviso) => ({ aviso, activo: recibe(aviso, filas) }));
}

/** Prende o apaga un aviso de una cuenta. Quien llama ya verificó que puede tocarla y que su rol lo recibe. */
export async function guardarAviso(cuentaId: string, aviso: ClaveDeAviso, activo: boolean): Promise<void> {
  await base.aviso.upsert({ where: { cuentaId_aviso: { cuentaId, aviso } }, create: { cuentaId, aviso, activo }, update: { activo } });
}

export type CuentaConAviso = Destinatario & { activo: boolean };
export type AvisoConCuentas = { aviso: ClaveDeAviso; cuentas: CuentaConAviso[] };

/**
 * Para Ajustes › Avisos: cada aviso del registro con las cuentas que lo pueden
 * recibir y si lo reciben. **Trae nombres y correos**: sin `usarAjustes` no
 * devuelve nada, aunque quien llama ya lo haya chequeado.
 */
export async function avisosDeTodas(rol: unknown): Promise<AvisoConCuentas[]> {
  if (!puede(rol, "usarAjustes")) return [];
  const cuentas = await base.user.findMany({
    where: { suspendida: false },
    select: { id: true, name: true, email: true, rol: true, avisos: { select: { aviso: true, activo: true } } },
    orderBy: { name: "asc" },
  });
  return CLAVES_DE_AVISO.map((aviso) => ({
    aviso,
    cuentas: cuentas
      .filter((c) => puede(c.rol, AVISOS[aviso].capacidad))
      .map((c) => ({ id: c.id, nombre: c.name, correo: c.email, activo: recibe(aviso, c.avisos) })),
  }));
}

/**
 * Deja ese aviso prendido para las cuentas de `cuentaIds` y apagado para las
 * demás que lo pueden recibir; un id que no puede recibirlo no cuenta. Escribe
 * solo las que cambian, y devuelve cuántas lo reciben y cuántas cambiaron.
 * Quien llama ya chequeó `usarAjustes`.
 */
export async function ponerQuienRecibe(aviso: ClaveDeAviso, cuentaIds: readonly string[]): Promise<{ reciben: number; cambiaron: number }> {
  const elegidas = new Set(cuentaIds);
  const pueden = (
    await base.user.findMany({ where: { suspendida: false }, select: { id: true, rol: true, avisos: { where: { aviso }, select: { aviso: true, activo: true } } } })
  ).filter((c) => puede(c.rol, AVISOS[aviso].capacidad));
  // Sin fila, vale lo de fábrica: cambia la que queda distinta de como está.
  const cambian = pueden.filter((c) => recibe(aviso, c.avisos) !== elegidas.has(c.id));
  await base.$transaction(
    cambian.map(({ id }) =>
      base.aviso.upsert({ where: { cuentaId_aviso: { cuentaId: id, aviso } }, create: { cuentaId: id, aviso, activo: elegidas.has(id) }, update: { activo: elegidas.has(id) } }),
    ),
  );
  return { reciben: pueden.filter(({ id }) => elegidas.has(id)).length, cambiaron: cambian.length };
}

/**
 * Avisa por correo que llegó un mensaje, a cada destinatario de su bandeja.
 * Recibe solo el id y la bandeja: no hay cómo meter en el correo algo de
 * quien escribió. Un correo que no sale queda en el log (sin el destinatario)
 * y no frena a los demás.
 */
export async function avisarMensajeNuevo(
  { id, bandeja }: { id: string; bandeja: Bandeja },
  // Lo único que usa de `mandarCorreo` es que mande: su respuesta no le importa.
  { mandar = mandarCorreo }: { mandar?: (correo: Parameters<typeof mandarCorreo>[0]) => Promise<unknown> } = {},
): Promise<void> {
  const enlace = `${urlDelSitio()}${BANDEJAS[bandeja].href}/${id}`;
  const destinatarios = await destinatariosDe(bandeja);
  const envios = await Promise.allSettled(
    destinatarios.map((d) => mandar({ para: d.correo, contenido: mensajeNuevo({ bandeja, enlace, nombre: d.nombre }) })),
  );
  const fallidos = envios.filter((e) => e.status === "rejected").length;
  if (fallidos) console.error(`avisarMensajeNuevo: ${fallidos} de ${envios.length} avisos de ${bandeja} no salieron.`);
}
