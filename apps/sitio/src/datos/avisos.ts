import { puede } from "@ed/auth";
import { BANDEJAS, CLAVES_DE_BANDEJA, capacidadDe, type Bandeja } from "@/config/mensajes";
import { mensajeNuevo } from "@/correos/mensaje-nuevo";
import { mandarCorreo } from "@/correos/mandar";
import { urlDelSitio } from "@/lib/url-del-sitio";
import { base } from "./cliente";

/**
 * Quién recibe un correo por cada mensaje nuevo (tabla `avisos`). Hoy hay un
 * aviso por bandeja, con la misma clave; el resumen semanal (lane 11) suma el
 * suyo. **Sin fila, activado**: así viene de fábrica. Ajustes › Avisos (lane
 * 10) lee y escribe con estas mismas funciones.
 */

export type Destinatario = { id: string; nombre: string; correo: string };

/**
 * Las cuentas que reciben el aviso de esa bandeja: las que su rol puede verla
 * (`puede`, nunca el string de un rol) y no lo apagaron.
 */
export async function destinatariosDe(bandeja: Bandeja): Promise<Destinatario[]> {
  const cuentas = await base.user.findMany({
    where: { avisos: { none: { aviso: bandeja, activo: false } } },
    select: { id: true, name: true, email: true, rol: true },
    orderBy: { createdAt: "asc" },
  });
  return cuentas.filter((c) => puede(c.rol, capacidadDe(bandeja))).map((c) => ({ id: c.id, nombre: c.name, correo: c.email }));
}

/** Los avisos de una cuenta: uno por bandeja que su rol ve, con si está activo. */
export async function avisosDe(cuentaId: string, rol: unknown): Promise<Array<{ bandeja: Bandeja; activo: boolean }>> {
  const apagados = await base.aviso.findMany({ where: { cuentaId, activo: false }, select: { aviso: true } });
  return CLAVES_DE_BANDEJA.filter((b) => puede(rol, capacidadDe(b))).map((bandeja) => ({
    bandeja,
    activo: !apagados.some((a) => a.aviso === bandeja),
  }));
}

/** Prende o apaga un aviso de una cuenta. Quien llama ya verificó que es su cuenta y que su rol ve la bandeja. */
export async function guardarAviso(cuentaId: string, bandeja: Bandeja, activo: boolean): Promise<void> {
  await base.aviso.upsert({ where: { cuentaId_aviso: { cuentaId, aviso: bandeja } }, create: { cuentaId, aviso: bandeja, activo }, update: { activo } });
}

/**
 * Avisa por correo que llegó un mensaje, a cada destinatario de su bandeja.
 * Recibe solo el id y la bandeja: no hay cómo meter en el correo algo de
 * quien escribió. Un correo que no sale queda en el log (sin el destinatario)
 * y no frena a los demás.
 */
export async function avisarMensajeNuevo(
  { id, bandeja }: { id: string; bandeja: Bandeja },
  { mandar = mandarCorreo }: { mandar?: typeof mandarCorreo } = {},
): Promise<void> {
  const enlace = `${urlDelSitio()}${BANDEJAS[bandeja].href}/${id}`;
  const destinatarios = await destinatariosDe(bandeja);
  const envios = await Promise.allSettled(
    destinatarios.map((d) => mandar({ para: d.correo, contenido: mensajeNuevo({ bandeja, enlace, nombre: d.nombre }) })),
  );
  const fallidos = envios.filter((e) => e.status === "rejected").length;
  if (fallidos) console.error(`avisarMensajeNuevo: ${fallidos} de ${envios.length} avisos de ${bandeja} no salieron.`);
}
