import { AccionesDeLaFicha } from "@/admin/armazon/AccionesDeLaFicha";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { Insignia } from "@/admin/armazon/Insignia";
import { Momento } from "@/admin/armazon/Momento";
import type { EstadoDelCaso } from "@/datos/consultas/casos-del-admin";

type Props = {
  titulo: string;
  estado: EstadoDelCaso;
  haySinGuardar: boolean;
  pendiente: string | null;
  aviso: React.ReactNode;
  alGuardar: () => void;
  alVerBorrador: () => void;
  alPublicar: () => void;
};

/** Quién lo tocó por última vez y cuándo, con las fechas en la zona de quien mira. La carga inicial no tiene quién. */
function Cuando({ estado }: { estado: EstadoDelCaso }) {
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
 * El encabezado fijo de la ficha de un caso (DESIGN.md §11, «Ficha de una
 * entidad»): «← Casos», «Caso 01» con su insignia (un caso siempre está en el
 * sitio: la insignia dice si tiene cambios sin publicar), cuándo y quién, y
 * Guardar borrador · Vista previa · Publicar. Con cambios sin guardar, navy.
 */
export function EncabezadoDelCaso({ titulo, estado, haySinGuardar, pendiente, aviso, alGuardar, alVerBorrador, alPublicar }: Props) {
  const conCambios = Boolean(estado.borradorEn);
  return (
    <Encabezado
      fijo
      resaltado={haySinGuardar}
      volver={{ href: "/admin/contenido/casos", etiqueta: "Casos" }}
      titulo={titulo}
      estado={
        <Insignia tono={conCambios ? "fuerte" : "normal"} sobreAzul={haySinGuardar}>
          {conCambios ? "Cambios sin publicar" : "Publicado"}
        </Insignia>
      }
      detalle={
        <>
          {/* Vive siempre en el DOM y solo cambia el texto: así el lector de pantalla anuncia el cambio. */}
          <span role="status" className="font-medium text-white empty:sr-only">
            {haySinGuardar ? "Cambios sin guardar." : ""}
          </span>
          <Cuando estado={estado} />
        </>
      }
      acciones={<AccionesDeLaFicha pendiente={pendiente} azul={haySinGuardar} alGuardar={alGuardar} alVerBorrador={alVerBorrador} alPublicar={alPublicar} />}
      avisos={aviso}
    />
  );
}
