import { Encabezado } from "@/admin/armazon/Encabezado";
import { Pestanas } from "@/admin/armazon/Pestanas";
import { CONTENIDO, PANTALLAS_DE_CONTENIDO } from "./pantallas";

const PESTANAS = PANTALLAS_DE_CONTENIDO.map((p) => ({ href: p.href, etiqueta: p.nombre }));

/**
 * El encabezado de las cinco pantallas de Contenido: el módulo en el `h1`, qué
 * es la pantalla en el detalle y las cinco pestañas, con la de la pantalla
 * encendida. El índice y el editor no lo usan: el índice ya son las cinco, y
 * el editor lo ubican sus migas.
 */
export function EncabezadoDeContenido({ detalle }: { detalle: string }) {
  return <Encabezado titulo={CONTENIDO.nombre} detalle={detalle} pestanas={<Pestanas etiqueta={CONTENIDO.nombre} pestanas={PESTANAS} />} />;
}
