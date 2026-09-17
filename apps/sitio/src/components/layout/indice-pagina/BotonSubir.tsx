import { ArrowRight } from "@/components/ui/icons";
import { irArriba } from "@/lib/indice";

/**
 * Mobile: volver arriba. Aparece después de una pantalla y media de scroll
 * (la lista de secciones vive en el menú hamburguesa).
 */
export function BotonSubir({ visible }: { visible: boolean }) {
  return (
    <button
      type="button"
      onClick={irArriba}
      aria-label="Volver arriba"
      tabIndex={visible ? 0 : -1}
      className={`border-azul-principal/15 text-azul-principal fixed right-4 bottom-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border bg-white/85 shadow-[0_10px_30px_-12px_rgb(31_45_77/0.35)] backdrop-blur transition-[opacity,translate] duration-300 lg:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowRight size={18} className="-rotate-90" aria-hidden="true" />
    </button>
  );
}
