import Link from "next/link";
import { Boton } from "@/admin/armazon/Boton";
import { Momento } from "@/admin/armazon/Momento";
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
          <Boton variante="secundario" disabled={corriendo || !haySinGuardar} aria-busy={pendiente === "guardar" || undefined} onClick={alGuardar}>
            {pendiente === "guardar" ? "Guardando…" : "Guardar borrador"}
          </Boton>
          <Boton variante="secundario" disabled={corriendo} aria-busy={pendiente === "vista-previa" || undefined} onClick={alVerBorrador}>
            {pendiente === "vista-previa" ? "Abriendo…" : "Vista previa"}
          </Boton>
          {/* El único naranja de la pantalla: es la acción (DESIGN.md, naranja solo CTAs). Texto azul: el blanco da 3,00:1 (DESIGN.md §7). */}
          <Boton
            variante="primario"
            disabled={corriendo || (!estado.borradorEn && !haySinGuardar)}
            aria-busy={pendiente === "publicar" || undefined}
            onClick={alPublicar}
          >
            {pendiente === "publicar" ? "Publicando…" : "Publicar"}
          </Boton>
          {estado.borradorEn ? (
            <Boton variante="destructivo" disabled={corriendo} aria-busy={pendiente === "descartar" || undefined} onClick={alDescartar}>
              {pendiente === "descartar" ? "Descartando…" : "Descartar"}
            </Boton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
