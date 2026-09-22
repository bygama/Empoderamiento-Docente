import { draftMode } from "next/headers";
import { salirDeVistaPrevia } from "@/datos/acciones/salir-de-vista-previa";
import { RutaActual } from "./RutaActual";

/**
 * «Estás viendo un borrador · Volver al sitio publicado» (SPEC §6). Solo con
 * la cookie de Draft Mode; el resto de las visitas no ve nada. Va abajo y no
 * arriba porque el header es una píldora `fixed top-4` que una franja arriba
 * taparía (DECISIONS, 7). Leer `isEnabled` no vuelve dinámicas las páginas.
 * La acción de salir viene de su propio archivo, sin `datos/auth`: este
 * componente vive en el layout del sitio y no puede arrastrar el cliente de
 * Prisma a cada render de la home.
 *
 * `z-[60]`: por encima de la píldora del header (`Header.tsx`, `z-50`), para
 * que ninguna sección tape el aviso, pero por debajo del panel de
 * `MobileNav.tsx` (`z-[70]`): con el menú del celular abierto, el menú manda
 * y la franja queda tapada a propósito.
 */
export async function FranjaDeBorrador() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <aside
      role="status"
      className="fixed inset-x-0 bottom-0 z-[60] flex flex-wrap items-center justify-center gap-x-3 bg-azul-principal px-4 py-2 font-sans text-sm text-white"
    >
      <span>Estás viendo un borrador</span>
      <span aria-hidden="true">·</span>
      <form action={salirDeVistaPrevia}>
        <RutaActual />
        <button type="submit" className="underline underline-offset-2 hover:opacity-80">
          Volver al sitio publicado
        </button>
      </form>
    </aside>
  );
}
