import type { Slug } from "@/contenido/paginas";
import { listaDePaginas } from "@/datos/consultas/editor-de-paginas";
import { arbolDelSitio } from "./barra-lateral/arbol";
import { ContenidoDeLaBarra, type Usuario } from "./barra-lateral/ContenidoDeLaBarra";
import { PanelMovil } from "./barra-lateral/PanelMovil";

/**
 * Las páginas con cambios sin publicar, o `null` si la base no contestó. La
 * sidebar nunca voltea el admin: sin respuesta se dibuja igual, sin los
 * puntos, y el error queda en el log.
 */
async function paginasConCambios(): Promise<Set<Slug> | null> {
  try {
    const filas = await listaDePaginas();
    return new Set(filas.filter((f) => f.sinPublicar).map((f) => f.slug));
  } catch (e) {
    console.error("BarraLateral: sin los puntos de «sin publicar»:", e);
    return null;
  }
}

/**
 * La sidebar del admin (SPEC §2 de work/armazon-del-admin): fija a la
 * izquierda desde `lg` y, por debajo, el panel del celular. Los dos muestran
 * el mismo contenido; el que no corresponde al ancho queda con `display: none`,
 * fuera del árbol de accesibilidad.
 */
export async function BarraLateral({ usuario }: { usuario: Usuario }) {
  const arbol = arbolDelSitio(await paginasConCambios());
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 bg-azul-principal lg:block">
        <ContenidoDeLaBarra usuario={usuario} arbol={arbol} />
      </aside>
      <PanelMovil>
        <ContenidoDeLaBarra usuario={usuario} arbol={arbol} />
      </PanelMovil>
    </>
  );
}
