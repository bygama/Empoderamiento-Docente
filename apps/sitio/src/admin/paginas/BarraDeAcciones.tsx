import Link from "next/link";
import { Momento } from "@/admin/armazon/Momento";
import { BOTON_SECUNDARIO } from "@/admin/campos/clases";
import type { PaginaParaEditar } from "@/datos/consultas/editor-de-paginas";

/** Cuál de las cuatro acciones corre, o ninguna: cada botón muestra su propio progreso y todos se deshabilitan mientras una corre. */
export type EstadoPendiente = "guardar" | "vista-previa" | "publicar" | "descartar" | null;

type Props = {
  nombre: string;
  ruta: string;
  estado: PaginaParaEditar["estado"];
  haySinGuardar: boolean;
  pendiente: EstadoPendiente;
  alGuardar: () => void;
  alVerBorrador: () => void;
  alPublicar: () => void;
  alDescartar: () => void;
};

/** El estado en llano de la página, con las fechas en la zona de quien mira. */
function EstadoEnLlano({ estado }: { estado: PaginaParaEditar["estado"] }) {
  if (estado.borradorEn) {
    return (
      <>
        Borrador guardado <Momento iso={estado.borradorEn} relativo />
        {estado.borradorPor ? ` por ${estado.borradorPor}` : ""}, sin publicar.
      </>
    );
  }
  if (estado.publicadoEn) {
    return (
      <>
        Publicado el <Momento iso={estado.publicadoEn} />
        {estado.publicadoPor ? ` por ${estado.publicadoPor}` : ""}.
      </>
    );
  }
  return <>Todavía muestra el contenido inicial del código.</>;
}

/** La barra fija de arriba: el estado y las tres acciones (más «Descartar» cuando hay borrador). */
export function BarraDeAcciones({ nombre, ruta, estado, haySinGuardar, pendiente, alGuardar, alVerBorrador, alPublicar, alDescartar }: Props) {
  // Cualquier acción en curso deshabilita las cuatro: no tiene sentido, por ejemplo, publicar mientras se está guardando.
  const corriendo = pendiente !== null;
  return (
    <div className="sticky top-0 z-10 -mx-6 border-b border-azul-claro bg-gris-fondo/95 px-6 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gris-texto">
            <Link href="/admin/paginas" className="hover:underline">
              Páginas
            </Link>{" "}
            › {nombre} · {ruta}
          </p>
          <p className="text-sm">
            <EstadoEnLlano estado={estado} />
            {haySinGuardar ? <span className="font-medium"> Hay cambios sin guardar.</span> : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={corriendo || !haySinGuardar} onClick={alGuardar} className={BOTON_SECUNDARIO}>
            {pendiente === "guardar" ? "Guardando…" : "Guardar borrador"}
          </button>
          <button type="button" disabled={corriendo} onClick={alVerBorrador} className={BOTON_SECUNDARIO}>
            {pendiente === "vista-previa" ? "Abriendo…" : "Vista previa"}
          </button>
          {/* El único naranja de la pantalla: es la acción (DESIGN.md, naranja solo CTAs). */}
          <button
            type="button"
            disabled={corriendo || (!estado.borradorEn && !haySinGuardar)}
            onClick={alPublicar}
            className="rounded-lg bg-naranja-accion px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pendiente === "publicar" ? "Publicando…" : "Publicar"}
          </button>
          {estado.borradorEn ? (
            <button type="button" disabled={corriendo} onClick={alDescartar} className="text-sm text-gris-texto underline-offset-2 hover:underline">
              {pendiente === "descartar" ? "Descartando…" : "Descartar"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
