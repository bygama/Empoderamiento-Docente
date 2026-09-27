import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Tabla } from "@/admin/armazon/Tabla";
import { EVENTOS, MINIMOS } from "@/config/metricas";
import type { QueHaceLaGente } from "@/datos/consultas/que-hace-la-gente";
import { NOMBRE_DEL_CANAL } from "@/lib/metricas/canales";
import type { Periodo } from "@/lib/metricas/periodos";
import { Bloque } from "../Seccion";
import { pocoTrafico } from "../poco-trafico";

const numero = new Intl.NumberFormat("es-AR");
const PASOS = ["cv-vio", "cv-empezo", "cv-envio"] as const;

/**
 * El camino del CV (SPEC de work/metricas-completas/ §6.3): cuántas veces se
 * abrió la página, se empezó el formulario y se mandó, por canal. «cv-vio»
 * cuenta cargas, así que se dice en vistas (§3), no en personas. Con el
 * formulario cerrado y sin nada contado, lo dice; con poco, dice cuánto falta.
 */
export function CaminoDelCV({ cv, periodo, abierto }: { cv: QueHaceLaGente["cv"]; periodo: Periodo; abierto: boolean }) {
  const vistas = cv.total["cv-vio"];
  let vacio: { titulo: string; texto: string } | null = null;
  if (!abierto && vistas === 0) {
    vacio = { titulo: "El formulario de CV está cerrado", texto: "Cuando se abra, acá se ve cuántas veces se abre la página, se empieza el formulario y se manda, y por dónde llegó la gente." };
  } else if (vistas < MINIMOS.caminoDelCV) {
    vacio = pocoTrafico({ hay: vistas, minimo: MINIMOS.caminoDelCV, periodo, una: "vista de la página", varias: "vistas de la página", para: "para este camino" });
  }
  return (
    <Bloque id="cv" titulo="El camino del CV" explicacion="Cuántas veces se abrió la página del CV, cuántas se empezó el formulario y cuántas se mandó, según por dónde llegó la gente.">
      {vacio ? (
        <EstadoVacio titulo={vacio.titulo} texto={vacio.texto} />
      ) : (
        <Tabla
          leyenda="El camino del CV por canal"
          columnas={[{ etiqueta: "Canal" }, ...PASOS.map((p) => ({ etiqueta: EVENTOS[p].nombre, ancho: "w-36" }))]}
          filas={[
            ...cv.porCanal.map((c) => ({ clave: c.canal, celdas: [NOMBRE_DEL_CANAL[c.canal], ...PASOS.map((p) => numero.format(c[p]))] })),
            { clave: "total", celdas: [<strong key="total" className="font-medium">Total</strong>, ...PASOS.map((p) => <strong key={p} className="font-medium">{numero.format(cv.total[p])}</strong>)] },
          ]}
        />
      )}
    </Bloque>
  );
}
