import { Encabezado } from "@/admin/armazon/Encabezado";
import { Insignia } from "@/admin/armazon/Insignia";
import { Momento } from "@/admin/armazon/Momento";
import { AccionesDeLaFicha } from "@/admin/novedades/AccionesDeLaFicha";
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

/** Quién lo tocó por última vez y cuándo, con las fechas en la zona de quien mira. */
function Cuando({ estado, id }: { estado: EstadoDeLaFicha; id: string | null }) {
  if (!id) return <span>Todavía no se guardó.</span>;
  if (estado.borradorEn) {
    return (
      <span>
        Guardado <Momento iso={estado.borradorEn} relativo />
        {estado.borradorPor ? ` por ${estado.borradorPor}` : ""}.
      </span>
    );
  }
  if (!estado.publicadoEn) return null;
  return (
    <span>
      Publicado el <Momento iso={estado.publicadoEn} />
      {estado.publicadoPor ? ` por ${estado.publicadoPor}` : " con la carga inicial"}.
    </span>
  );
}

/**
 * El encabezado fijo de la ficha de un perfil (DESIGN.md §11, «Ficha de una
 * entidad»): «← Equipo», el nombre con su insignia, cuándo y quién, y Guardar
 * borrador · Vista previa · Publicar, el único primario. Con cambios sin
 * guardar pasa a azul, como el de una novedad o un material.
 */
export function EncabezadoDelPerfil({ titulo, id, estado, haySinGuardar, pendiente, aviso, alGuardar, alVerBorrador, alPublicar }: Props) {
  const insignia = insigniaDelPerfil(estado, id);
  return (
    <Encabezado
      fijo
      resaltado={haySinGuardar}
      volver={{ href: "/admin/contenido/equipo", etiqueta: "Equipo" }}
      titulo={titulo}
      estado={
        <Insignia tono={insignia.tono} sobreAzul={haySinGuardar}>
          {insignia.texto}
        </Insignia>
      }
      detalle={
        <>
          {/* Vive siempre en el DOM y solo cambia el texto: así el lector de pantalla anuncia el cambio. */}
          <span role="status" className="font-medium text-white empty:sr-only">
            {haySinGuardar ? "Cambios sin guardar." : ""}
          </span>
          <Cuando estado={estado} id={id} />
        </>
      }
      acciones={<AccionesDeLaFicha pendiente={pendiente} azul={haySinGuardar} alGuardar={alGuardar} alVerBorrador={alVerBorrador} alPublicar={alPublicar} />}
      avisos={aviso}
    />
  );
}
