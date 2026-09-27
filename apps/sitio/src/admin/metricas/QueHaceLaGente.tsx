import { cvAbierto } from "@/config/cv";
import { queHaceLaGente } from "@/datos/consultas/que-hace-la-gente";
import type { Periodo } from "@/lib/metricas/periodos";
import { CaminoDelCV } from "./acciones/CaminoDelCV";
import { Contactos } from "./acciones/Contactos";
import { cuantas } from "./formato";
import { Seccion } from "./Seccion";
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
        <Seccion
          id="materiales"
          titulo="Materiales más consultados"
          explicacion="Los diez materiales de la Biblioteca que más se abrieron en el período, desde la Biblioteca o desde el Inicio."
          filas={datos.materiales.map((m) => ({ clave: m.id, principal: m.titulo, detalle: cuantas(m.consultas, "consulta", "consultas") }))}
          vacio={{ titulo: `Nadie abrió un material en estos ${periodo} días`, texto: "Se cuenta cada vez que alguien toca el link de un material, sin saber quién." }}
        />
      </div>
    </div>
  );
}
