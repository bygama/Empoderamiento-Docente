import { Cifra } from "@/admin/armazon/Cifra";
import { MINIMOS } from "@/config/metricas";
import type { MarcaDeLaCurva } from "@/datos/consultas/marcas";
import type { ResumenDelPeriodo } from "@/datos/consultas/resumen";
import { NOMBRE_DEL_CANAL } from "@/lib/metricas/canales";
import type { Periodo } from "@/lib/metricas/periodos";
import { Seccion } from "../Seccion";
import { cuantas, periodoAnterior } from "../formato";
import { pocoTrafico } from "../poco-trafico";
import { CurvaConMarcas } from "./CurvaConMarcas";

/**
 * El Resumen con datos (SPEC de work/metricas-completas/ §6.1): las dos
 * cifras del período, qué quiere decir cada palabra, la curva con sus marcas,
 * los canales y las páginas más vistas. Cada bloque con poco dato lo dice en
 * su lugar.
 */
export function CuerpoDelResumen({ resumen, marcas, periodo, hoy }: { resumen: ResumenDelPeriodo; marcas: readonly MarcaDeLaCurva[]; periodo: Periodo; hoy: string }) {
  const { cifras, canales, visitasDeLosCanales, paginas, vistasDelPeriodo } = resumen;
  const contra = periodoAnterior(periodo);
  const canalesVacio = pocoTrafico({ hay: visitasDeLosCanales, minimo: MINIMOS.lista, periodo, una: "visita", varias: "visitas", para: "para repartirlas por canal" });
  const paginasVacio = pocoTrafico({ hay: vistasDelPeriodo, minimo: MINIMOS.lista, periodo, una: "vista", varias: "vistas", para: "para esta lista" });

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <Cifra etiqueta={`Visitantes, últimos ${periodo} días`} {...cifras.visitantes} periodo={contra} />
          <Cifra etiqueta={`Vistas, últimos ${periodo} días`} {...cifras.vistas} periodo={contra} />
        </div>
        <p className="max-w-prose text-admin-meta text-gris-texto">
          <strong className="font-medium text-azul-principal">Visitantes</strong> son personas distintas en el período;{" "}
          <strong className="font-medium text-azul-principal">visitas</strong>, cada día que alguien entra; y{" "}
          <strong className="font-medium text-azul-principal">vistas</strong>, cada página que se abre.
        </p>
      </div>
      <CurvaConMarcas curva={resumen.curva} diasConDatos={resumen.diasConDatos} marcas={marcas} periodo={periodo} hoy={hoy} />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-6">
        <Seccion
          id="canales"
          titulo="Por dónde llegan"
          explicacion="De dónde vino la gente antes de entrar. Directo es sin un sitio antes: un link guardado, uno escrito a mano o una app que no lo dice."
          filas={visitasDeLosCanales >= MINIMOS.lista ? canales.map((c) => ({ clave: c.canal, principal: NOMBRE_DEL_CANAL[c.canal], detalle: `${cuantas(c.visitas, "visita", "visitas")} · ${c.parte} %` })) : []}
          vacio={canalesVacio}
        />
        <Seccion
          id="paginas"
          titulo="Páginas más vistas"
          explicacion="Las diez páginas que más se abrieron en el período."
          filas={vistasDelPeriodo >= MINIMOS.lista ? paginas.map((p) => ({ clave: p.ruta, principal: p.nombre ?? p.ruta, detalle: `${p.nombre ? `${p.ruta} · ` : ""}${cuantas(p.vistas, "vista", "vistas")}` })) : []}
          vacio={paginasVacio}
        />
      </div>
    </div>
  );
}
