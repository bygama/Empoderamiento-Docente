import { Aviso } from "@/admin/armazon/Campos";
import { estadoDeBusquedas, resumenDeBusquedas } from "@/datos/consultas/busquedas";
import { avisoDeCorrida } from "./aviso";
import { CabeceraDeBusquedas } from "./CabeceraDeBusquedas";
import { CuerpoDeBusquedas } from "./CuerpoDeBusquedas";

/**
 * Qué buscó la gente en Google para llegar al sitio (SPEC §4). Lee solo de la
 * base: la copia la hace una tarea del cron diario. `puedeConectar` decide qué
 * ve quien entra sin conexión: los pasos, o que todavía no está conectado.
 */
export async function PanelBusquedas({ puedeConectar }: { puedeConectar: boolean }) {
  const estado = await estadoDeBusquedas();
  const resumen = estado.conectado && estado.hastaDia ? await resumenDeBusquedas(estado.hastaDia) : null;
  const aviso = avisoDeCorrida(estado);

  return (
    <section aria-labelledby="busquedas" className="space-y-6">
      <CabeceraDeBusquedas estado={estado} resumen={resumen} />
      {aviso ? <Aviso tono={aviso.tono}>{aviso.texto}</Aviso> : null}
      <CuerpoDeBusquedas estado={estado} resumen={resumen} puedeConectar={puedeConectar} />
    </section>
  );
}
