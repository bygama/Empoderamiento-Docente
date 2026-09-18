import Image from "next/image";
import Link from "next/link";
import { HOME_LINK } from "@/config/nav";

/**
 * Barra superior del panel: el logo (→ Inicio). Copia la caja de la píldora del
 * Header —margen de 1rem, borde de 1px, `px-4 py-3`, logo `h-11`— para que el
 * logo caiga EXACTO donde está el de la página: cuando la cortina le pasa por
 * encima parece el mismo logo, no uno nuevo. Si cambia la píldora, cambia acá.
 * El cierre no vive acá: es `BotonCerrar`, por encima de la cortina.
 */
export function BarraMenu({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div className="p-4">
      <div className="flex items-center border border-transparent px-4 py-3">
        <Link
          href={HOME_LINK.href}
          aria-label="Empoderamiento Docente — Inicio"
          onClick={onCerrar}
          className="inline-flex items-center"
        >
          <Image
            src="/brand/logotipo-principal-ed.png"
            alt="Empoderamiento Docente"
            width={425}
            height={467}
            unoptimized
            className="h-11 w-auto"
          />
        </Link>
      </div>
    </div>
  );
}
