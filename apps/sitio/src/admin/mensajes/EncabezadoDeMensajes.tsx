import { Aviso } from "@/admin/armazon/Campos";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { Pestanas } from "@/admin/armazon/Pestanas";
import { BANDEJAS, type Bandeja } from "@/config/mensajes";
import { MENSAJES } from "./textos";

/**
 * El encabezado de una bandeja: el módulo en el `h1` y las bandejas que tu
 * rol ve como pestañas, cada una con sus sin leer (DESIGN.md §11, «El
 * número»). Quien ve una sola no lleva pestañas: son «cuando el módulo tiene
 * más de una». `aviso` es la confirmación de lo que se acaba de hacer
 * (volver de «Borrar ahora»).
 */
export function EncabezadoDeMensajes({
  bandejas,
  nuevos,
  aviso,
}: {
  bandejas: readonly Bandeja[];
  nuevos: Partial<Record<Bandeja, number>>;
  aviso?: string;
}) {
  const pestanas =
    bandejas.length > 1 ? (
      <Pestanas
        etiqueta={MENSAJES.nombre}
        pestanas={bandejas.map((b) => ({ href: BANDEJAS[b].href, etiqueta: BANDEJAS[b].nombre, numero: { cuantos: nuevos[b] ?? 0, que: "sin leer" } }))}
      />
    ) : undefined;
  return (
    <Encabezado
      titulo={MENSAJES.nombre}
      detalle={MENSAJES.para}
      avisos={aviso ? <Aviso tono="bien">{aviso}</Aviso> : undefined}
      pestanas={pestanas}
    />
  );
}
