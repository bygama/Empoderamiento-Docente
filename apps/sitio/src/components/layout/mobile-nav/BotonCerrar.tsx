import type { RefObject } from "react";
import { Menu, X } from "@/components/ui/icons";

/**
 * Gemelo del botón hamburguesa. El del Header queda DEBAJO del panel (un
 * `<dialog>` modal vive en el top layer y nada de la página lo supera), así que
 * para que las rayas se vuelvan X «en el mismo botón» hace falta uno adentro
 * del diálogo. Vive en `BarraMenu`, que lo deja calzado sobre el del Header.
 *
 * Misma caja (3rem, `rounded-3xl` = círculo) e ícono que aquel: cuando el filo de la cortina
 * lo cruza se lee el mismo botón cambiando de color. De este lado del filo es
 * un aro sobre la noche en vez de un vidrio claro. La X va superpuesta a las
 * rayas; quién se ve en cada momento lo decide `useMenuAnimado`.
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
      className="focus-visible:outline-azul-claro relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl border border-white/25 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <Menu size={22} data-mnav-rayas />
      <X size={22} data-mnav-equis className="absolute" />
    </button>
  );
}
