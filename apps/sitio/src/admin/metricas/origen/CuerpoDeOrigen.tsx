import { EstadoVacio } from "@ed/kit-admin";
import { MENOS_DE, MINIMOS, NOMBRE_DE_LA_ZONA } from "@/config/metricas";
import type { OrigenDelPeriodo } from "@/datos/consultas/origen";
import { NOMBRE_DEL_CANAL } from "@/lib/metricas/canales";
import type { Periodo } from "@/lib/metricas/periodos";
import { MejorHora } from "../MejorHora";
import { Bloque, Seccion } from "../Seccion";
import { pocoTrafico } from "../poco-trafico";
import { Dispositivos } from "./Dispositivos";
import { filasProtegidas, nombreDePais, visitasYParte } from "./filas";
import { PaginaPorPais } from "./PaginaPorPais";

/**
 * Origen con datos (SPEC de work/metricas-completas/ §6.2), en el orden de la
 * guía que reemplaza: países, regiones, de dónde llegan, dispositivo, página
 * por país y la mejor hora. Cada bloque con poco dato lo dice en su lugar.
 */
export function CuerpoDeOrigen({ origen, periodo }: { origen: OrigenDelPeriodo; periodo: Periodo }) {
  const { paises, referidos, horas } = origen;
  const totalPaises = paises.fijos.reduce((s, p) => s + p.total, paises.resto.total);
  const poco = (hay: number, minimo: number, para: string) => pocoTrafico({ hay, minimo, periodo, una: "visita", varias: "visitas", para });
  const fijos = paises.fijos.map((p) => ({
    clave: p.valor,
    principal: nombreDePais(p.valor),
    detalle: p.total > 0 && p.total < MENOS_DE ? `menos de ${MENOS_DE} visitas` : visitasYParte(p.total, totalPaises),
  }));

  return (
    <div className="space-y-10">
      <Seccion
        id="paises"
        titulo="Países"
        explicacion="Chile, México y Argentina siempre arriba; después, el resto de más a menos."
        filas={totalPaises >= MINIMOS.lista ? [...fijos, ...filasProtegidas({ ...paises.resto, total: totalPaises }, nombreDePais)] : []}
        vacio={poco(totalPaises, MINIMOS.lista, "para esta lista")}
      />
      <Bloque id="regiones" titulo="Regiones">
        <EstadoVacio
          titulo="Vercel no da provincias, estados ni ciudades"
          texto="Su analítica dice el país y nada más fino. Por eso acá no hay regiones: no se inventan."
        />
      </Bloque>
      <Seccion
        id="referidos"
        titulo="De dónde llegan"
        explicacion="Los sitios y las redes que traen gente, con su canal. Sin Directo, que no es un sitio, ni el propio sitio."
        filas={referidos.total >= MINIMOS.lista ? filasProtegidas(referidos, (v) => v, (v) => NOMBRE_DEL_CANAL[referidos.visibles.find((r) => r.valor === v)?.canal ?? "otros-sitios"]) : []}
        vacio={poco(referidos.total, MINIMOS.lista, "para esta lista")}
      />
      <Dispositivos origen={origen} periodo={periodo} />
      <PaginaPorPais cruce={origen.cruce} periodo={periodo} />
      <Bloque
        id="mejor-hora"
        titulo="Mejor hora para publicar"
        explicacion={`Cuándo entra más gente, sumando las visitas del período por día de la semana y hora, en ${NOMBRE_DE_LA_ZONA}.`}
      >
        {horas.visitas >= MINIMOS.mejorHora ? (
          <MejorHora grilla={horas.grilla} mejores={horas.mejores} />
        ) : (
          <EstadoVacio {...poco(horas.visitas, MINIMOS.mejorHora, "para que la grilla diga algo")} />
        )}
      </Bloque>
    </div>
  );
}
