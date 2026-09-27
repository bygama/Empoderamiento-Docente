import { AccionesDeLaFicha } from "@ed/kit-admin";
import { EncabezadoDeFicha } from "@/admin/armazon/EncabezadoDeFicha";
import type { EstadoDeLaFicha } from "@/datos/consultas/ficha-de-persona";
import { insigniaDelPerfil } from "./estado";
import type { Pendiente } from "./useGuardarPerfil";

type Props = {
  titulo: string;
  /** `null` mientras el perfil no se guardó nunca. */
  id: string | null;
  estado: EstadoDeLaFicha;
  haySinGuardar: boolean;
  pendiente: Pendiente;
  aviso: React.ReactNode;
  alGuardar: () => void;
  alVerBorrador: () => void;
  alPublicar: () => void;
};

/**
 * El encabezado fijo de la ficha de un perfil (DESIGN.md §11, «Ficha de una
 * entidad»): «← Equipo», el nombre con su insignia, cuándo y quién, y Guardar
 * borrador · Vista previa · Publicar, el único primario. El encabezado es el
 * del armazón, el mismo de un material.
 */
export function EncabezadoDelPerfil({ titulo, id, estado, haySinGuardar, pendiente, aviso, alGuardar, alVerBorrador, alPublicar }: Props) {
  return (
    <EncabezadoDeFicha
      volver={{ href: "/admin/contenido/equipo", etiqueta: "Equipo" }}
      titulo={titulo}
      id={id}
      estado={estado}
      insignia={insigniaDelPerfil(estado, id)}
      haySinGuardar={haySinGuardar}
      acciones={<AccionesDeLaFicha pendiente={pendiente} azul={haySinGuardar} alGuardar={alGuardar} alVerBorrador={alVerBorrador} alPublicar={alPublicar} />}
      aviso={aviso}
    />
  );
}
