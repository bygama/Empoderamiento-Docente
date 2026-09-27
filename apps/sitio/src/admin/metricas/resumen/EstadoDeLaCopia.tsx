import { Aviso } from "@ed/kit-admin";
import type { EstadoDeMetricas } from "@/datos/consultas/metricas";

const fechaLarga = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: "UTC" });
// Sin `timeZoneName`: Intl no lo admite junto con `dateStyle`/`timeStyle`
// (tira TypeError). El «UTC» se agrega a mano en el texto.
const horaCorta = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" });

/**
 * Hasta qué día llega la copia de Vercel y cuándo se actualizó, en una línea;
 * y, si la última corrida falló, el aviso con el porqué. Lo leen Resumen y
 * Origen, que muestran la misma copia.
 */
export function EstadoDeLaCopia({ estado }: { estado: EstadoDeMetricas }) {
  const hora = estado.ultima ? horaCorta.format(estado.ultima.corridaEn) : null;
  return (
    <div className="space-y-3">
      <p className="text-admin-meta text-gris-texto">
        {estado.hastaDia
          ? `Datos hasta el ${fechaLarga.format(new Date(`${estado.hastaDia}T00:00:00.000Z`))} (días en hora universal).`
          : "Todavía sin datos."}
        {estado.ultima ? (estado.ultima.ok ? ` Actualizado el ${hora} UTC.` : ` Último intento el ${hora} UTC.`) : ""}
      </p>
      {estado.ultima && !estado.ultima.ok ? <Aviso tono="error">La última actualización falló: {estado.ultima.detalle}</Aviso> : null}
    </div>
  );
}
