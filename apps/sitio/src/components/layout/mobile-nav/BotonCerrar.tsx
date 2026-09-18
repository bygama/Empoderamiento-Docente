import type { RefObject } from "react";
import { Menu } from "@/components/ui/icons";

/**
 * Gemelo del botón hamburguesa. El de la píldora queda DEBAJO del panel (un
 * `<dialog>` modal vive en el top layer y nada de la página lo supera), así que
 * para que las rayas se vuelvan X «en el mismo botón» hace falta uno adentro
 * del diálogo, por encima de la cortina y calzado sobre el de la píldora.
 *
 * Mismas clases de caja e ícono que aquel: miden lo mismo y en el primer cuadro
 * no se nota el reemplazo. La posición (x/y) y el giro de las rayas los maneja
 * `useMenuAnimado`; acá no se declara ninguno.
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
      className="text-azul-principal hover:bg-azul-principal/5 absolute top-0 left-0 z-10 inline-flex items-center justify-center rounded-xl p-2 transition-colors"
    >
      <Menu size={22} />
    </button>
  );
}
