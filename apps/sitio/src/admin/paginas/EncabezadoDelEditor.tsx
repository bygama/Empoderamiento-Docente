import { Boton } from "@/admin/armazon/Boton";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { Insignia } from "@/admin/armazon/Insignia";
import { Momento } from "@/admin/armazon/Momento";
import { ArrowUpRight } from "@/components/ui/icons";
import type { PaginaParaEditar } from "@/datos/consultas/editor-de-paginas";
import { insigniaDelEstado } from "./estado";

/** Cuál de las cuatro acciones corre, o ninguna: la que corre muestra su progreso y las demás esperan. */
export type EstadoPendiente = "guardar" | "vista-previa" | "publicar" | "descartar" | null;

type Props = {
  nombre: string;
  estado: PaginaParaEditar["estado"];
  haySinGuardar: boolean;
  pendiente: EstadoPendiente;
  /** El aviso de la última acción, ya armado. */
  aviso: React.ReactNode;
  alGuardar: () => void;
  alVerBorrador: () => void;
  alPublicar: () => void;
  alDescartar: () => void;
};

/** Cuándo y quién, con las fechas en la zona de quien mira. */
function Cuando({ estado }: { estado: PaginaParaEditar["estado"] }) {
  if (estado.borradorEn) {
    return (
      <span>
        Borrador guardado <Momento iso={estado.borradorEn} relativo />
        {estado.borradorPor ? ` por ${estado.borradorPor}` : ""}.
      </span>
    );
  }
  if (estado.publicadoEn) {
    return (
      <span>
        Publicada el <Momento iso={estado.publicadoEn} />
        {estado.publicadoPor ? ` por ${estado.publicadoPor}` : ""}.
      </span>
    );
  }
  return <span>El sitio muestra el contenido inicial del código.</span>;
}

/**
 * El encabezado fijo del editor (SPEC §4): la página, su insignia, cuándo y
 * quién, y las tres acciones con «Publicar» como único primario. Ningún botón
 * se deshabilita para explicar algo: si no hay nada que guardar o publicar,
 * el editor contesta con un aviso. Mientras una acción corre, las demás
 * esperan.
 */
export function EncabezadoDelEditor({ nombre, estado, haySinGuardar, pendiente, aviso, alGuardar, alVerBorrador, alPublicar, alDescartar }: Props) {
  const corriendo = pendiente !== null;
  const insignia = insigniaDelEstado(estado);
  // Con cambios sin guardar, todo el encabezado pasa a azul (DESIGN.md §11) y lo de adentro va en su versión «sobre azul».
  const azul = haySinGuardar;
  return (
    <Encabezado
      fijo
      resaltado={azul}
      migas={[{ href: "/admin/paginas", etiqueta: "Páginas" }]}
      titulo={nombre}
      estado={
        <Insignia tono={insignia.tono} sobreAzul={azul}>
          {insignia.etiqueta}
        </Insignia>
      }
      detalle={
        <>
          {/* Vive siempre en el DOM y solo cambia el texto: así el lector de pantalla anuncia el cambio. Vacío, no ocupa lugar. */}
          <span role="status" className="font-medium text-white empty:sr-only">
            {haySinGuardar ? "Cambios sin guardar." : ""}
          </span>
          <Cuando estado={estado} />
          {estado.borradorEn ? (
            // Margen negativo: el blanco de 40 px no agranda la línea del detalle.
            <Boton variante="destructivo" sobreAzul={azul} className="-my-2.5 -ml-2" disabled={corriendo} aria-busy={pendiente === "descartar" || undefined} onClick={alDescartar}>
              {pendiente === "descartar" ? "Descartando…" : "Descartar borrador"}
            </Boton>
          ) : null}
        </>
      }
      acciones={
        <>
          <Boton variante="secundario" sobreAzul={azul} disabled={corriendo} aria-busy={pendiente === "guardar" || undefined} onClick={alGuardar}>
            {/* En el celular la barra de abajo no tiene lugar para «Guardar borrador»: se ve «Guardar» y el lector lee el nombre entero. */}
            {pendiente === "guardar" ? (
              "Guardando…"
            ) : (
              // Un solo hijo: en el `inline-flex` del botón, dos serían dos piezas separadas por el `gap`.
              <span>
                Guardar<span className="max-lg:sr-only"> borrador</span>
              </span>
            )}
          </Boton>
          <Boton variante="secundario" sobreAzul={azul} disabled={corriendo} aria-busy={pendiente === "vista-previa" || undefined} onClick={alVerBorrador}>
            {pendiente === "vista-previa" ? "Abriendo…" : "Vista previa"}
            <ArrowUpRight size={16} />
            <span className="sr-only">(se abre en otra pestaña)</span>
          </Boton>
          {/* El único naranja de la pantalla: es la acción (DESIGN.md §1, regla 2). */}
          <Boton variante="primario" sobreAzul={azul} disabled={corriendo} aria-busy={pendiente === "publicar" || undefined} onClick={alPublicar}>
            {pendiente === "publicar" ? "Publicando…" : "Publicar"}
          </Boton>
        </>
      }
      avisos={aviso}
    />
  );
}
