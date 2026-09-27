import { BANDEJAS, type Bandeja } from "@/config/mensajes";
import { mensajeNuevo } from "@/correos/mensaje-nuevo";
import { mandarCorreo } from "@/correos/mandar";
import { urlDelSitio } from "@/lib/url-del-sitio";
import { destinatariosDe } from "./avisos";

/**
 * Avisa por correo que llegó un mensaje, a cada destinatario de su bandeja
 * (quiénes, en `avisos.ts`). Recibe solo el id y la bandeja: no hay cómo meter
 * en el correo algo de quien escribió. Un correo que no sale queda en el log
 * (sin el destinatario) y no frena a los demás.
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
