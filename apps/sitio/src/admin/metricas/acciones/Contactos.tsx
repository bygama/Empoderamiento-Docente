import { Cifra } from "@/admin/armazon/Cifra";
import { Fila, Lista } from "@/admin/armazon/Lista";
import type { QueHaceLaGente } from "@/datos/consultas/que-hace-la-gente";
import { parte } from "@/lib/metricas/agregar";
import { NOMBRE_DEL_CANAL } from "@/lib/metricas/canales";
import type { Periodo } from "@/lib/metricas/periodos";
import { Bloque } from "../Seccion";
import { cuantas, periodoAnterior } from "../formato";

/**
 * Los contactos enviados (SPEC de work/metricas-completas/ §6.3): cuántos en
 * el período contra el anterior y, si hubo alguno, por dónde llegó la gente.
 * Son sumas por día: los mensajes, con su contenido, están en Mensajes.
 */
export function Contactos({ contactos, periodo }: { contactos: QueHaceLaGente["contactos"]; periodo: Periodo }) {
  return (
    <Bloque id="contactos" titulo="Contactos enviados" explicacion="Cuántos mensajes se mandaron por el formulario de Contacto. Lo que dicen está en Mensajes.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Cifra etiqueta={`Contactos, últimos ${periodo} días`} valor={contactos.total} variacion={contactos.variacion} periodo={periodoAnterior(periodo)} />
      </div>
      {contactos.total > 0 ? (
        <Lista>
          {contactos.porCanal.map((c) => (
            <Fila key={c.canal} principal={NOMBRE_DEL_CANAL[c.canal]} detalle={`${cuantas(c.cuenta, "contacto", "contactos")} · ${parte(c.cuenta, contactos.total)} %`} />
          ))}
        </Lista>
      ) : null}
    </Bloque>
  );
}
