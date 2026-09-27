import { Encabezado, Pestanas } from "@ed/kit-admin";
import { CONTENIDO, PANTALLAS_DE_CONTENIDO } from "./pantallas";

const PESTANAS = PANTALLAS_DE_CONTENIDO.map((p) => ({ href: p.href, etiqueta: p.nombre }));

type Props = {
  detalle: string;
  /** A la derecha, con un solo primario: «Subir foto», «Nuevo aliado». */
  acciones?: React.ReactNode;
  /** Adentro del encabezado, abajo: la confirmación de volver de borrar algo. */
  avisos?: React.ReactNode;
};

/**
 * El encabezado de las cinco pantallas de Contenido: el módulo en el `h1`, qué
 * es la pantalla en el detalle y las cinco pestañas, con la de la pantalla
 * encendida. El índice y el editor no lo usan: el índice ya son las cinco, y
 * el editor lo ubican sus migas.
 */
export function EncabezadoDeContenido({ detalle, acciones, avisos }: Props) {
  return <Encabezado titulo={CONTENIDO.nombre} detalle={detalle} acciones={acciones} avisos={avisos} pestanas={<Pestanas etiqueta={CONTENIDO.nombre} pestanas={PESTANAS} />} />;
}
