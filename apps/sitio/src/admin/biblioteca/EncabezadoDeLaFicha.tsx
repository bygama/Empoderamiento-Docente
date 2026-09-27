import { EncabezadoDeFicha } from "@/admin/armazon/EncabezadoDeFicha";
import type { Tono } from "@/admin/armazon/Insignia";
import { AccionesDeLaFicha } from "@/admin/armazon/AccionesDeLaFicha";
import type { EstadoDeLaFicha } from "@/datos/consultas/ficha-de-material";
import type { Pendiente } from "./useGuardarMaterial";

type Props = {
  titulo: string;
  /** `null` mientras el material no se guardó nunca. */
  id: string | null;
  estado: EstadoDeLaFicha;
  haySinGuardar: boolean;
  pendiente: Pendiente;
  aviso: React.ReactNode;
  alGuardar: () => void;
  alVerBorrador: () => void;
  alPublicar: () => void;
};

/** La insignia del estado (SPEC §3.1): lo que pide atención va fuerte, lo estable normal, lo que salió del sitio apagado. */
function insigniaDe({ publicado, publicadoEn, borradorEn }: EstadoDeLaFicha, id: string | null): { tono: Tono; texto: string } {
  if (!id) return { tono: "apagado", texto: "Sin guardar" };
  if (publicado) return borradorEn ? { tono: "fuerte", texto: "Cambios sin publicar" } : { tono: "normal", texto: "Publicado" };
  return publicadoEn ? { tono: "apagado", texto: "Oculto" } : { tono: "fuerte", texto: "Sin publicar" };
}

/**
 * El encabezado fijo de la ficha de un material (DESIGN.md §11, «Ficha de una
 * entidad»): «← Biblioteca», el título con su insignia, cuándo y quién, y
 * Guardar borrador · Vista previa · Publicar, el único primario. El encabezado
 * es el del armazón, el mismo de un perfil del Equipo.
 */
export function EncabezadoDeLaFicha({ titulo, id, estado, haySinGuardar, pendiente, aviso, alGuardar, alVerBorrador, alPublicar }: Props) {
  return (
    <EncabezadoDeFicha
      volver={{ href: "/admin/biblioteca", etiqueta: "Biblioteca" }}
      titulo={titulo}
      id={id}
      estado={estado}
      insignia={insigniaDe(estado, id)}
      haySinGuardar={haySinGuardar}
      acciones={<AccionesDeLaFicha pendiente={pendiente} azul={haySinGuardar} alGuardar={alGuardar} alVerBorrador={alVerBorrador} alPublicar={alPublicar} />}
      aviso={aviso}
    />
  );
}
