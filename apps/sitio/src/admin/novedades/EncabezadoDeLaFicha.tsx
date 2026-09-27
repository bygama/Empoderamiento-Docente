import { Encabezado } from "@/admin/armazon/Encabezado";
import { Insignia, type Tono } from "@/admin/armazon/Insignia";
import { Momento } from "@/admin/armazon/Momento";
import type { EstadoDeLaFicha } from "@/datos/consultas/ficha-de-novedad";
import { AccionesDeLaFicha } from "./AccionesDeLaFicha";
import type { Pendiente } from "./useGuardarNovedad";

type Props = {
  titulo: string;
  /** `null` mientras la novedad no se guardó nunca. */
  id: string | null;
  estado: EstadoDeLaFicha;
  haySinGuardar: boolean;
  pendiente: Pendiente;
  aviso: React.ReactNode;
  alGuardar: () => void;
  alVerBorrador?: () => void;
  alPublicar?: () => void;
};

/** La insignia del estado (SPEC §5.2): lo que pide atención va fuerte, lo estable normal, lo que salió del sitio apagado. */
function insigniaDe({ publicada, publicadaEn, borradorEn }: EstadoDeLaFicha, id: string | null): { tono: Tono; texto: string } {
  if (!id) return { tono: "apagado", texto: "Sin guardar" };
  if (publicada) return borradorEn ? { tono: "fuerte", texto: "Cambios sin publicar" } : { tono: "normal", texto: "Publicada" };
  return publicadaEn ? { tono: "apagado", texto: "Despublicada" } : { tono: "fuerte", texto: "Borrador" };
}

/** Quién la tocó por última vez y cuándo, con las fechas en la zona de quien mira. */
function Cuando({ estado, id }: { estado: EstadoDeLaFicha; id: string | null }) {
  if (!id) return <span>Todavía no se guardó.</span>;
  if (estado.borradorEn) {
    return (
      <span>
        Guardada <Momento iso={estado.borradorEn} relativo />
        {estado.borradorPor ? ` por ${estado.borradorPor}` : ""}.
      </span>
    );
  }
  return estado.publicadaEn ? (
    <span>
      Publicada el <Momento iso={estado.publicadaEn} />
      {estado.publicadaPor ? ` por ${estado.publicadaPor}` : ""}.
    </span>
  ) : null;
}

/**
 * El encabezado fijo de la ficha (DESIGN.md §11, «Encabezado de página»):
 * «← Novedades», el título con su insignia, cuándo y quién, y las acciones
 * —Guardar borrador, Vista previa y Publicar, el único primario—. Con cambios
 * sin guardar pasa a azul, como el del editor de páginas.
 */
export function EncabezadoDeLaFicha({ titulo, id, estado, haySinGuardar, pendiente, aviso, alGuardar, alVerBorrador, alPublicar }: Props) {
  const azul = haySinGuardar;
  const insignia = insigniaDe(estado, id);
  return (
    <Encabezado
      fijo
      resaltado={azul}
      volver={{ href: estado.publicada ? "/admin/novedades" : "/admin/novedades/borradores", etiqueta: "Novedades" }}
      titulo={titulo}
      estado={
        <Insignia tono={insignia.tono} sobreAzul={azul}>
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
      acciones={<AccionesDeLaFicha pendiente={pendiente} azul={azul} alGuardar={alGuardar} alVerBorrador={alVerBorrador} alPublicar={alPublicar} />}
      avisos={aviso}
    />
  );
}
