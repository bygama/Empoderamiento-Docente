import { Filtro } from "@/admin/armazon/Filtro";
import { PERIODOS, type Periodo } from "@/lib/metricas/periodos";

/**
 * El período de una pantalla de Métricas (7, 30 o 90 días): el `Filtro` del
 * armazón, porque es la misma pantalla recortada por un valor de la URL
 * (`?periodo=7`). Sin el valor, 30, y su link no lo lleva.
 */
export function SelectorDePeriodo({ ruta, periodo }: { ruta: string; periodo: Periodo }) {
  const opciones = PERIODOS.map((p) => ({ href: p === 30 ? ruta : `${ruta}?periodo=${p}`, etiqueta: `${p} días` }));
  return <Filtro etiqueta="Período de las métricas" opciones={opciones} activa={opciones[PERIODOS.indexOf(periodo)].href} />;
}
