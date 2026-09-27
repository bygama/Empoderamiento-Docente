import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { MINIMOS } from "@/config/metricas";
import type { OrigenDelPeriodo } from "@/datos/consultas/origen";
import type { Periodo } from "@/lib/metricas/periodos";
import { Bloque } from "../Seccion";
import { pocoTrafico } from "../poco-trafico";
import { filasProtegidas, nombreDeDispositivo } from "./filas";

/**
 * Dispositivo, sistema y navegador (SPEC de work/metricas-completas/ §6.2):
 * tres listas cortas, una al lado de la otra desde `lg`, cada una con su
 * nombre. Con poco dato, un solo estado vacío para las tres.
 */
export function Dispositivos({ origen, periodo }: { origen: Pick<OrigenDelPeriodo, "dispositivos" | "sistemas" | "navegadores">; periodo: Periodo }) {
  const listas = [
    { id: "dispositivo", titulo: "Dispositivo", filas: filasProtegidas(origen.dispositivos, nombreDeDispositivo) },
    { id: "sistema", titulo: "Sistema", filas: filasProtegidas(origen.sistemas, (v) => v || "Sin identificar") },
    { id: "navegador", titulo: "Navegador", filas: filasProtegidas(origen.navegadores, (v) => v || "Sin identificar") },
  ];
  const hay = origen.dispositivos.total;
  const vacio = pocoTrafico({ hay, minimo: MINIMOS.lista, periodo, una: "visita", varias: "visitas", para: "para estas listas" });
  return (
    <Bloque id="dispositivos" titulo="Dispositivo, sistema y navegador" explicacion="Con qué entra la gente: sirve para saber si el sitio tiene que verse bien, antes que nada, en el celular.">
      {hay >= MINIMOS.lista ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {listas.map((l) => (
            <div key={l.id} className="space-y-2">
              <h3 id={`origen-${l.id}`} className="text-admin-meta font-medium">
                {l.titulo}
              </h3>
              <Lista>
                {l.filas.map((f) => (
                  <Fila key={f.clave} principal={f.principal} detalle={f.detalle} />
                ))}
              </Lista>
            </div>
          ))}
        </div>
      ) : (
        <EstadoVacio titulo={vacio.titulo} texto={vacio.texto} />
      )}
    </Bloque>
  );
}
