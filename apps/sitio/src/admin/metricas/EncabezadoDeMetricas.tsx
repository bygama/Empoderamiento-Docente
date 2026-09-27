import { Encabezado } from "@/admin/armazon/Encabezado";
import { Pestanas } from "@/admin/armazon/Pestanas";
import { METRICAS, PANTALLAS_DE_METRICAS } from "./pantallas";

const PESTANAS = PANTALLAS_DE_METRICAS.map((p) => ({ href: p.href, etiqueta: p.nombre }));

/**
 * El encabezado de las cinco pantallas de Métricas: el módulo en el `h1`, qué
 * es la pantalla en el detalle, sus acciones a la derecha y las cinco
 * pestañas, con la de la pantalla encendida. Resumen es la puerta del módulo y
 * una pestaña más: se enciende solo en `/admin/metricas`, porque gana la
 * pestaña más específica.
 */
export function EncabezadoDeMetricas({ detalle, acciones }: { detalle: string; acciones?: React.ReactNode }) {
  return <Encabezado titulo={METRICAS.nombre} detalle={detalle} acciones={acciones} pestanas={<Pestanas etiqueta={METRICAS.nombre} pestanas={PESTANAS} />} />;
}
