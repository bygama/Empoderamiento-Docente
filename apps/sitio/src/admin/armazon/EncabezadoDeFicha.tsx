import { Encabezado, Insignia, type Tono } from "@ed/kit-admin";
import { Momento } from "./Momento";

/** Lo que el encabezado cuenta de la cosa: quién y cuándo la guardó o la publicó, en ISO. */
export type EstadoEnElEncabezado = { publicadoEn: string | null; publicadoPor: string | null; borradorEn: string | null; borradorPor: string | null };

type Props = {
  volver: { href: string; etiqueta: string };
  titulo: string;
  /** `null` mientras la cosa no se guardó nunca. */
  id: string | null;
  estado: EstadoEnElEncabezado;
  insignia: { tono: Tono; texto: string };
  haySinGuardar: boolean;
  /** Guardar borrador · Vista previa · Publicar: cada ficha pone las suyas. */
  acciones: React.ReactNode;
  aviso: React.ReactNode;
};

/** Quién la tocó por última vez y cuándo, con las fechas en la zona de quien mira. */
function Cuando({ estado, id }: { estado: EstadoEnElEncabezado; id: string | null }) {
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
 * El encabezado fijo de la ficha de una entidad (DESIGN.md §11, «Ficha de una
 * entidad»): «← la lista», el título con su insignia, cuándo y quién, y las
 * acciones. Con cambios sin guardar pasa a azul y lo anuncia. Lo usan la
 * ficha de un material y la de un perfil del Equipo (en masculino: «Guardado»,
 * «Publicado»). No sabe de ED.
 */
export function EncabezadoDeFicha({ volver, titulo, id, estado, insignia, haySinGuardar, acciones, aviso }: Props) {
  return (
    <Encabezado
      fijo
      resaltado={haySinGuardar}
      volver={volver}
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
      acciones={acciones}
      avisos={aviso}
    />
  );
}
