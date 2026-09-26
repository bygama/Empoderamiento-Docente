import { Boton } from "@/admin/armazon/Boton";
import { Encabezado } from "@/admin/armazon/Encabezado";
import { Insignia } from "@/admin/armazon/Insignia";
import { Pestanas, type Pestana } from "@/admin/armazon/Pestanas";
import { ArrowUpRight } from "@/components/ui/icons";
import type { PaginaParaEditar } from "@/datos/consultas/editor-de-paginas";
import { Cuando } from "./Cuando";
import { insigniaDelEstado } from "./estado";

/** Cuál de las cuatro acciones corre, o ninguna: la que corre muestra su progreso y las demás esperan. */
export type EstadoPendiente = "guardar" | "vista-previa" | "publicar" | "descartar" | null;

type Acciones = {
  /** Las acciones de la pantalla: la que no llega no se muestra (en «Versiones» no hay ninguna). */
  alGuardar?: () => void;
  alVerBorrador?: () => void;
  alPublicar?: () => void;
  alDescartar?: () => void;
};

type Props = Acciones & {
  nombre: string;
  /** Las pantallas de la página (Secciones, SEO…), en la fila de abajo del encabezado. */
  pestanas: readonly Pestana[];
  estado: PaginaParaEditar["estado"];
  haySinGuardar: boolean;
  pendiente: EstadoPendiente;
  /** El aviso de la última acción, ya armado. */
  aviso: React.ReactNode;
};

type PropsDeLosBotones = Omit<Acciones, "alDescartar"> & { pendiente: EstadoPendiente; azul: boolean };

/** Guardar borrador, Vista previa y Publicar, las que haya, con «Publicar» como único primario. */
function Botones({ alGuardar, alVerBorrador, alPublicar, pendiente, azul }: PropsDeLosBotones) {
  const corriendo = pendiente !== null;
  return (
    <>
      {alGuardar ? (
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
      ) : null}
      {alVerBorrador ? (
        <Boton variante="secundario" sobreAzul={azul} disabled={corriendo} aria-busy={pendiente === "vista-previa" || undefined} onClick={alVerBorrador}>
          {pendiente === "vista-previa" ? "Abriendo…" : "Vista previa"}
          <ArrowUpRight size={16} />
          <span className="sr-only">(se abre en otra pestaña)</span>
        </Boton>
      ) : null}
      {/* El único naranja de la pantalla: es la acción (DESIGN.md §1, regla 2). */}
      {alPublicar ? (
        <Boton variante="primario" sobreAzul={azul} disabled={corriendo} aria-busy={pendiente === "publicar" || undefined} onClick={alPublicar}>
          {pendiente === "publicar" ? "Publicando…" : "Publicar"}
        </Boton>
      ) : null}
    </>
  );
}

/**
 * El encabezado fijo de una página en el editor (SPEC §4): la página, su
 * insignia, cuándo y quién, sus pestañas y las acciones de la pantalla.
 * Ningún botón se deshabilita para explicar algo: si no hay nada que guardar
 * o publicar, el editor contesta con un aviso. Mientras una acción corre, las
 * demás esperan.
 */
export function EncabezadoDelEditor({ nombre, pestanas, estado, haySinGuardar, pendiente, aviso, alGuardar, alVerBorrador, alPublicar, alDescartar }: Props) {
  const insignia = insigniaDelEstado(estado);
  // Con cambios sin guardar, todo el encabezado pasa a azul (DESIGN.md §11) y lo de adentro va en su versión «sobre azul».
  const azul = haySinGuardar;
  const hayBotones = Boolean(alGuardar || alVerBorrador || alPublicar);
  return (
    <Encabezado
      fijo
      resaltado={azul}
      migas={[
        { href: "/admin/contenido", etiqueta: "Contenido" },
        { href: "/admin/contenido/paginas", etiqueta: "Páginas" },
      ]}
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
          {estado.borradorEn && alDescartar ? (
            // Margen negativo: el blanco de 40 px no agranda la línea del detalle.
            <Boton variante="destructivo" sobreAzul={azul} className="-my-2.5 -ml-2" disabled={pendiente !== null} aria-busy={pendiente === "descartar" || undefined} onClick={alDescartar}>
              {pendiente === "descartar" ? "Descartando…" : "Descartar borrador"}
            </Boton>
          ) : null}
        </>
      }
      acciones={hayBotones ? <Botones alGuardar={alGuardar} alVerBorrador={alVerBorrador} alPublicar={alPublicar} pendiente={pendiente} azul={azul} /> : undefined}
      avisos={aviso}
      pestanas={<Pestanas etiqueta={`Pantallas de ${nombre}`} pestanas={pestanas} sobreAzul={azul} />}
    />
  );
}
