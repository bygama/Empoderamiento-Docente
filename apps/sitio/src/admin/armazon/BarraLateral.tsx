import { puede } from "@ed/auth";
import { listaDePaginas } from "@/datos/consultas/editor-de-paginas";
import { ContenidoDeLaBarra, type Usuario } from "./barra-lateral/ContenidoDeLaBarra";
import { MODULOS } from "./barra-lateral/modulos";
import { PanelMovil } from "./barra-lateral/PanelMovil";
import type { Tema } from "./tema";

/**
 * Si alguna página tiene cambios sin publicar. Si la base no contestó, `false`:
 * la sidebar nunca voltea el admin, se dibuja igual sin el punto, y el error
 * queda en el log.
 */
async function hayPaginasSinPublicar(): Promise<boolean> {
  try {
    return (await listaDePaginas()).some((f) => f.estado.borradorEn);
  } catch (e) {
    console.error("BarraLateral: sin el punto de «sin publicar»:", e);
    return false;
  }
}

/**
 * La sidebar del admin: fija a la izquierda desde `lg` y, por debajo, el
 * panel del celular. Los dos muestran el mismo contenido; el que no
 * corresponde al ancho queda con `display: none`, fuera del árbol de
 * accesibilidad. Cada rol ve los módulos de sus capacidades (`modulos.ts`),
 * calculados acá, en el servidor. Esconder no es la seguridad: cada módulo
 * pasa por su guarda y cada acción verifica el permiso aparte. `data-barra`
 * es lo que el tema mixto pinta con el azul de la marca (globals.css).
 */
export async function BarraLateral({ usuario, tema }: { usuario: Usuario; tema: Tema }) {
  const visibles = MODULOS.filter((m) => !m.capacidad || puede(usuario.rol, m.capacidad)).map((m) => m.clave);
  const conPunto = (await hayPaginasSinPublicar()) ? ["contenido"] : [];
  const contenido = <ContenidoDeLaBarra usuario={usuario} tema={tema} visibles={visibles} conPunto={conPunto} />;
  return (
    <>
      <aside data-barra className="fixed inset-y-0 left-0 z-20 hidden w-72 bg-gris-fondo lg:block">{contenido}</aside>
      <PanelMovil>{contenido}</PanelMovil>
    </>
  );
}
