import { MENOS_DE, PAISES_FIJOS, ZONA_HORARIA, type PaisFijo } from "@/config/metricas";
import { base } from "@/datos/cliente";
import { DIMENSIONES_DEL_CRUCE } from "@/datos/tareas/consultas-de-vercel";
import { sumarPorValor, type FilaCopiada } from "@/lib/metricas/agregar";
import { canalDe, type Canal } from "@/lib/metricas/canales";
import { grillaDeHoras, mejoresFranjas, type Franja } from "@/lib/metricas/mejor-hora";
import { ocultarMenores, type Oculto } from "@/lib/metricas/ocultar";
import { diaISO, fechaUTC, sumarDias, type Periodo } from "@/lib/metricas/periodos";
import type { Dia } from "@/lib/metricas/tipos";
import { nombresDeRutas } from "./nombres-de-rutas";
import { dominioPropio } from "./resumen";

// Lo que lee Métricas › Origen (SPEC de work/metricas-completas/ §6.2). Todo
// lo que podría señalar a alguien pasa por `ocultarMenores`: menos de 3, a
// «Otros». «El resto» que junta la API también va a «Otros».

export type Valor = { valor: string; total: number };
/** Una lista con lo chico ya escondido: `ocultos.total` suma también «el resto» de la API. */
export type ListaProtegida = { visibles: Valor[]; ocultos: Oculto; total: number };

export type OrigenDelPeriodo = {
  paises: { fijos: Array<{ valor: PaisFijo; total: number }>; resto: ListaProtegida };
  referidos: { visibles: Array<Valor & { canal: Canal }>; ocultos: Oculto; total: number };
  dispositivos: ListaProtegida;
  sistemas: ListaProtegida;
  navegadores: ListaProtegida;
  cruce: { vistas: number; paises: ReadonlyArray<PaisFijo | null>; filas: Array<{ ruta: string; nombre: string | null; vistas: number[] }> };
  horas: { visitas: number; grilla: number[][]; mejores: Franja[] };
};

/** Las visitas por valor, con lo chico escondido. */
function protegida(filas: readonly FilaCopiada[]): ListaProtegida {
  const { valores, resto } = sumarPorValor(filas, "visitantes");
  const { visibles, ocultos } = ocultarMenores(valores, MENOS_DE);
  return { visibles, ocultos: { ...ocultos, total: ocultos.total + resto }, total: valores.reduce((s, v) => s + v.total, resto) };
}

const PAGINAS_DEL_CRUCE = 10;

/** El cruce: las páginas más vistas del período, con sus vistas en cada país fijo y en el resto. */
async function cruceDe(filas: ReadonlyArray<FilaCopiada & { dimension: string }>): Promise<OrigenDelPeriodo["cruce"]> {
  const porRuta = new Map<string, number[]>();
  DIMENSIONES_DEL_CRUCE.forEach(({ dimension }, i) => {
    for (const { valor, total } of sumarPorValor(filas.filter((f) => f.dimension === dimension), "vistas").valores) {
      const vistas = porRuta.get(valor) ?? DIMENSIONES_DEL_CRUCE.map(() => 0);
      vistas[i] += total;
      porRuta.set(valor, vistas);
    }
  });
  const suma = (v: number[]) => v.reduce((a, b) => a + b, 0);
  const top = [...porRuta].sort((a, b) => suma(b[1]) - suma(a[1])).slice(0, PAGINAS_DEL_CRUCE);
  const nombres = await nombresDeRutas(top.map(([ruta]) => ruta));
  return {
    vistas: [...porRuta.values()].reduce((s, v) => s + suma(v), 0),
    paises: DIMENSIONES_DEL_CRUCE.map((d) => d.pais),
    filas: top.map(([ruta, vistas]) => ({ ruta, nombre: nombres.get(ruta) ?? null, vistas })),
  };
}

export async function origenDe(periodo: Periodo, hasta: Dia): Promise<OrigenDelPeriodo> {
  const desde = sumarDias(hasta, -(periodo - 1));
  const dimensiones = ["pais", "referido", "dispositivo", "sistema", "navegador", "hora", ...DIMENSIONES_DEL_CRUCE.map((d) => d.dimension)];
  const filas = await base.metricaDiaria.findMany({
    where: { dimension: { in: dimensiones }, fecha: { gte: fechaUTC(desde), lte: fechaUTC(hasta) } },
    select: { fecha: true, dimension: true, valor: true, agrupado: true, vistas: true, visitantes: true },
  });
  const de = (dimension: string) => filas.filter((f) => f.dimension === dimension);
  const paises = protegida(de("pais").filter((f) => !(PAISES_FIJOS as readonly string[]).includes(f.valor)));
  const fijos = PAISES_FIJOS.map((valor) => ({ valor, total: de("pais").reduce((s, f) => s + (f.valor === valor ? f.visitantes : 0), 0) }));
  const propio = dominioPropio();
  // Directo (sin sitio) y el propio sitio no son un lugar de donde vino la gente.
  const referidos = protegida(de("referido").filter((f) => f.agrupado || (f.valor !== "" && canalDe(f.valor, propio) !== null)));
  const grilla = grillaDeHoras(de("hora").map((f) => ({ fecha: diaISO(f.fecha), valor: f.valor, visitantes: f.visitantes })), ZONA_HORARIA);
  return {
    paises: { fijos, resto: paises },
    referidos: { ...referidos, visibles: referidos.visibles.map((v) => ({ ...v, canal: canalDe(v.valor, propio) ?? "otros-sitios" })) },
    dispositivos: protegida(de("dispositivo")),
    sistemas: protegida(de("sistema")),
    navegadores: protegida(de("navegador")),
    cruce: await cruceDe(filas),
    horas: { visitas: grilla.flat().reduce((a, b) => a + b, 0), grilla, mejores: mejoresFranjas(grilla) },
  };
}
