import type { RefObject } from "react";
import { Menu } from "@/components/ui/icons";

/**
 * Gemelo del botón hamburguesa. El de la píldora queda DEBAJO del panel (un
 * `<dialog>` modal vive en el top layer y nada de la página lo supera), así que
 * para que las rayas se vuelvan X «en el mismo botón» hace falta uno adentro
 * del diálogo. Vive en `BarraMenu`, que lo deja calzado sobre el de la píldora.
 *
 * Misma caja e ícono que aquel (el aro va por `ring`, que no ocupa lugar):
 * miden lo mismo, y cuando el filo de la cortina lo cruza se leen las mismas
 * rayas cambiando de color. El giro a X lo maneja `useMenuAnimado`.
 */
export function BotonCerrar({
  closeRef,
  onCerrar,
}: {
  closeRef: RefObject<HTMLButtonElement | null>;
  onCerrar: () => void;
}) {
  return (
    <button
      ref={closeRef}
      type="button"
      data-mnav-cerrar
      aria-label="Cerrar menú"
      onClick={onCerrar}
      className="focus-visible:outline-azul-claro inline-flex shrink-0 items-center justify-center rounded-xl p-2 text-white ring-1 ring-white/20 transition-colors ring-inset hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Menu size={22} />
    </button>
  );
}
