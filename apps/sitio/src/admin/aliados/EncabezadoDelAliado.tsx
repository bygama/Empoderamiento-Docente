import { AccionesDeLaFicha, Encabezado, Insignia } from "@ed/kit-admin";
import { Momento } from "@/admin/armazon/Momento";
import type { EstadoDelAliado } from "@/datos/consultas/aliados-del-admin";
import { insigniaDeLaPublicacion } from "./estado";
import type { PendienteDelAliado } from "./useGuardarAliado";

type Props = {
  titulo: string;
  id: string | null;
  estado: EstadoDelAliado;
  autorizado: boolean;
  haySinGuardar: boolean;
  pendiente: PendienteDelAliado;
  aviso: React.ReactNode;
  alGuardar: () => void;
  alVerBorrador: () => void;
  alPublicar: () => void;
};

/** Quién lo tocó por última vez y cuándo. */
function Cuando({ estado, id }: { estado: EstadoDelAliado; id: string | null }) {
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
  return estado.publicadoPor ? (
    <span>
      Publicado el <Momento iso={estado.publicadoEn} /> por {estado.publicadoPor}.
    </span>
  ) : (
    <span>Llegó con el sitio.</span>
  );
}

/**
 * El encabezado fijo de la ficha de un aliado (DESIGN.md §11, «Ficha de una
 * entidad»): «← Aliados», el nombre con dos insignias —la autorización y la
 * publicación—, cuándo y quién, y Guardar borrador · Vista previa · Publicar.
 */
export function EncabezadoDelAliado({ titulo, id, estado, autorizado, haySinGuardar, pendiente, aviso, alGuardar, alVerBorrador, alPublicar }: Props) {
  const publicacion = id ? insigniaDeLaPublicacion(estado) : { tono: "apagado" as const, texto: "Sin guardar" };
  return (
    <Encabezado
      fijo
      resaltado={haySinGuardar}
      volver={{ href: "/admin/contenido/aliados", etiqueta: "Aliados" }}
      titulo={titulo}
      estado={
        <span className="flex flex-wrap gap-2">
          <Insignia tono={autorizado ? "normal" : "fuerte"} sobreAzul={haySinGuardar}>
            {autorizado ? "Autorizado" : "Sin autorizar"}
          </Insignia>
          <Insignia tono={publicacion.tono} sobreAzul={haySinGuardar}>
            {publicacion.texto}
          </Insignia>
        </span>
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
