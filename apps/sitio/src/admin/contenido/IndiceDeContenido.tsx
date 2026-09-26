import { Encabezado } from "@/admin/armazon/Encabezado";
import { IndiceDeTarjetas } from "@/admin/armazon/IndiceDeTarjetas";
import { Insignia } from "@/admin/armazon/Insignia";
import { resumenDePaginas } from "@/admin/paginas/resumen";
import type { FilaDeLista } from "@/datos/consultas/editor-de-paginas";
import { CONTENIDO, PANTALLAS_DE_CONTENIDO } from "./pantallas";

/**
 * `/admin/contenido`: las cinco pantallas del módulo en tarjetas, cada una con
 * su estado. Páginas cuenta de verdad; las otras cuatro están por hacer, y
 * cada lane que construya una le pone su estado acá.
 */
export function IndiceDeContenido({ paginas }: { paginas: FilaDeLista[] }) {
  const tarjetas = PANTALLAS_DE_CONTENIDO.map((p) => ({
    ...p,
    estado: p.clave === "paginas" ? resumenDePaginas(paginas) : <Insignia tono="apagado">Por hacer</Insignia>,
  }));
  return (
    <div className="space-y-8">
      <Encabezado titulo={CONTENIDO.nombre} detalle={CONTENIDO.para} />
      <IndiceDeTarjetas tarjetas={tarjetas} />
    </div>
  );
}
