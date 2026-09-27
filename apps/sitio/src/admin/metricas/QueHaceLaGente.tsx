import { cvAbierto } from "@/config/cv";
import { queHaceLaGente } from "@/datos/consultas/que-hace-la-gente";
import type { Periodo } from "@/lib/metricas/periodos";
import { CaminoDelCV } from "./acciones/CaminoDelCV";
import { Contactos } from "./acciones/Contactos";
import { SelectorDePeriodo } from "./SelectorDePeriodo";

/**
 * Métricas › Qué hace la gente (SPEC de work/metricas-completas/ §6.3): lo que
 * cuenta el sitio mismo, sumas por día y nada de la persona. El período
 * termina hoy: los contadores cuentan en el momento, sin copia de por medio.
 */
export async function QueHaceLaGente({ periodo }: { periodo: Periodo }) {
  const datos = await queHaceLaGente(periodo);
  return (
    <div className="space-y-6">
      <SelectorDePeriodo ruta="/admin/metricas/acciones" periodo={periodo} />
      <p className="max-w-prose text-admin-meta text-gris-texto">
        Lo cuenta el sitio mismo, hasta hoy: solo sumas por día, sin cookies, sin IP y sin saber quién.
      </p>
      <div className="space-y-10">
        <CaminoDelCV cv={datos.cv} periodo={periodo} abierto={cvAbierto()} />
        <Contactos contactos={datos.contactos} periodo={periodo} />
      </div>
    </div>
  );
}
