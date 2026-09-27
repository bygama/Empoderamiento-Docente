import { EstadoVacio, Tabla } from "@ed/kit-admin";
import { MENOS_DE, MINIMOS } from "@/config/metricas";
import type { OrigenDelPeriodo } from "@/datos/consultas/origen";
import type { Periodo } from "@/lib/metricas/periodos";
import { Bloque } from "../Seccion";
import { pocoTrafico } from "../poco-trafico";
import { nombreDePais } from "./filas";

const numero = new Intl.NumberFormat("es-AR");

/** Una celda del cruce: el número, o «menos de 3», que podría señalar a alguien. */
function celda(vistas: number): string {
  if (vistas === 0) return "0";
  return vistas < MENOS_DE ? `menos de ${MENOS_DE}` : numero.format(vistas);
}

/**
 * Qué página mira la gente de cada país (SPEC de work/metricas-completas/
 * §6.2): una `Tabla` con las diez páginas más vistas en las filas y los tres
 * países fijos y el resto en las columnas, en vistas.
 */
export function PaginaPorPais({ cruce, periodo }: { cruce: OrigenDelPeriodo["cruce"]; periodo: Periodo }) {
  const vacio = pocoTrafico({ hay: cruce.vistas, minimo: MINIMOS.cruce, periodo, una: "vista", varias: "vistas", para: "para cruzar páginas y países" });
  const columnas = [{ etiqueta: "Página" }, ...cruce.paises.map((p) => ({ etiqueta: p ? nombreDePais(p) : "Otros países", ancho: "w-28" }))];
  return (
    <Bloque id="pagina-por-pais" titulo="Página por país" explicacion="Las diez páginas más vistas del período y desde dónde las miraron, en vistas.">
      {cruce.vistas >= MINIMOS.cruce ? (
        <Tabla
          leyenda="Vistas de cada página por país"
          columnas={columnas}
          filas={cruce.filas.map((f) => ({
            clave: f.ruta,
            celdas: [
              <span key="pagina" className="break-words">
                {f.nombre ?? f.ruta}
                {f.nombre ? <span className="block text-gris-texto">{f.ruta}</span> : null}
              </span>,
              ...f.vistas.map(celda),
            ],
          }))}
        />
      ) : (
        <EstadoVacio titulo={vacio.titulo} texto={vacio.texto} />
      )}
    </Bloque>
  );
}
