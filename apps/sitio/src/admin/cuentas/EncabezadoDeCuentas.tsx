import { Encabezado, Pestanas } from "@ed/kit-admin";
import { CUENTAS, PESTANAS_DE_CUENTAS } from "./pantallas";

/**
 * El encabezado de Personas y de Actividad: el módulo en el `h1`, qué es la
 * pantalla en el detalle y las dos pestañas, con la de la pantalla
 * encendida (gana la más específica: Personas es `/admin/cuentas`).
 */
export function EncabezadoDeCuentas({ detalle, acciones }: { detalle: string; acciones?: React.ReactNode }) {
  return (
    <Encabezado
      titulo={CUENTAS.nombre}
      detalle={detalle}
      acciones={acciones}
      pestanas={<Pestanas etiqueta={CUENTAS.nombre} pestanas={PESTANAS_DE_CUENTAS} />}
    />
  );
}
