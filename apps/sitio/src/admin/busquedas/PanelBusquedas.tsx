import { Aviso } from "@/admin/armazon/Campos";
import { estadoDeBusquedas, resumenDeBusquedas } from "@/datos/consultas/busquedas";
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
  // Sin conexión, la última corrida siempre dice eso mismo: el estado vacío ya lo explica.
  const fallo = estado.conectado && estado.ultima && !estado.ultima.ok ? estado.ultima.detalle : null;

  return (
    <section aria-labelledby="busquedas" className="space-y-6">
      <CabeceraDeBusquedas estado={estado} resumen={resumen} />
      {fallo ? <Aviso tono="error">La última actualización falló: {fallo}</Aviso> : null}
      <CuerpoDeBusquedas estado={estado} resumen={resumen} puedeConectar={puedeConectar} />
    </section>
  );
}
