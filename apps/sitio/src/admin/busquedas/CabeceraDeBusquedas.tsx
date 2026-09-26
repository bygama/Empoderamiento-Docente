import { ActualizarAhora } from "@/admin/metricas/ActualizarAhora";
import { actualizarBusquedasAhora } from "@/datos/acciones/actualizar-busquedas";
import { DIAS_DEL_PERIODO, type EstadoDeBusquedas, type ResumenDeBusquedas } from "@/datos/consultas/busquedas";
import { diaLegible } from "./formato";

// Sin `timeZoneName`: Intl no lo admite junto con `dateStyle`/`timeStyle`. El
// «UTC» se agrega a mano, como en el Resumen.
const horaCorta = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" });

function cuandoCorrio(estado: EstadoDeBusquedas): string {
  if (!estado.conectado || !estado.ultima) return "";
  const hora = horaCorta.format(estado.ultima.corridaEn);
  return estado.ultima.ok ? ` Actualizado el ${hora} UTC.` : ` Último intento el ${hora} UTC.`;
}

/** El título de Búsquedas, el período, el aviso de atraso (siempre, en cualquier estado) y «Actualizar ahora». */
export function CabeceraDeBusquedas({ estado, resumen }: { estado: EstadoDeBusquedas; resumen: ResumenDeBusquedas | null }) {
  const periodo = resumen ? `Últimos ${DIAS_DEL_PERIODO} días con datos: del ${diaLegible(resumen.desde)} al ${diaLegible(resumen.hasta)}. ` : "";
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 id="busquedas" className="font-display text-admin-seccion font-bold">
          Cómo nos encuentran en Google
        </h2>
        <p className="max-w-prose text-admin-meta text-gris-texto">
          {periodo}Google manda los datos con 2 o 3 días de atraso, y cuenta los días en hora del Pacífico.{cuandoCorrio(estado)}
        </p>
      </div>
      <ActualizarAhora accion={actualizarBusquedasAhora} />
    </div>
  );
}
