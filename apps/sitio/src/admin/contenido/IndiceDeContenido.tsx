import { Encabezado } from "@/admin/armazon/Encabezado";
import { IndiceDeTarjetas } from "@/admin/armazon/IndiceDeTarjetas";
import { Insignia } from "@/admin/armazon/Insignia";
import { resumenDePaginas } from "@/admin/paginas/resumen";
import type { FilaDeAliado } from "@/datos/consultas/aliados-del-admin";
import type { FilaDeCaso } from "@/datos/consultas/casos-del-admin";
import type { FilaDeLista } from "@/datos/consultas/editor-de-paginas";
import { CONTENIDO, PANTALLAS_DE_CONTENIDO, type PantallaDeContenido } from "./pantallas";
import { resumenDeAliados, resumenDeCasos, resumenDeFotos } from "./resumenes";

type Props = { paginas: FilaDeLista[]; casos: FilaDeCaso[]; aliados: FilaDeAliado[]; fotos: { total: number; sinAlt: number } };

/**
 * `/admin/contenido`: las cinco pantallas del módulo en tarjetas, cada una con
 * su estado real. Equipo todavía está por hacer, y la lane que la construya le
 * pone su estado acá.
 */
export function IndiceDeContenido({ paginas, casos, aliados, fotos }: Props) {
  const estados: Record<PantallaDeContenido["clave"], React.ReactNode> = {
    paginas: resumenDePaginas(paginas),
    casos: resumenDeCasos(casos),
    equipo: <Insignia tono="apagado">Por hacer</Insignia>,
    aliados: resumenDeAliados(aliados),
    fotos: resumenDeFotos(fotos),
  };
  const tarjetas = PANTALLAS_DE_CONTENIDO.map((p) => ({ ...p, estado: estados[p.clave] }));
  return (
    <div className="space-y-8">
      <Encabezado titulo={CONTENIDO.nombre} detalle={CONTENIDO.para} />
      <IndiceDeTarjetas tarjetas={tarjetas} />
    </div>
  );
}
