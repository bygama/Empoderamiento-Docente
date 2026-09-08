import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram, Linkedin } from "@/components/ui/icons";
import { CTA_LINK } from "@/config/nav";
import { siteConfig } from "@/config/site";

// Redes a mostrar — mismo criterio que el Footer: el href sale de
// siteConfig.redes y, sin handle oficial, el ícono no se muestra.
const REDES = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "facebook", label: "Facebook", Icon: Facebook },
] as const satisfies ReadonlyArray<{
  key: keyof typeof siteConfig.redes;
  label: string;
  Icon: typeof Instagram;
}>;

/** Pie del menú: acción focal (Contacto), mail real y redes. */
export function PieMenu({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div data-mnav-cta className="flex flex-col gap-5 px-6 pt-4 pb-10 sm:px-8">
      <Link
        href={CTA_LINK.href}
        onClick={onCerrar}
        className="bg-naranja-accion inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 font-medium text-white transition-opacity hover:opacity-90"
      >
        {CTA_LINK.label}
        <ArrowUpRight size={18} />
      </Link>

      {/* Mail de contacto: centrado, justo debajo del CTA. */}
      <a
        href={`mailto:${siteConfig.contacto.email}`}
        className="text-gris-texto hover:text-azul-principal text-center font-mono text-[0.78rem] tracking-wide transition-colors"
      >
        {siteConfig.contacto.email}
      </a>

      {/* Redes sociales — con rótulo y botones circulares (buen target
          táctil). Solo las que tienen URL confirmada; sin ninguna, la
          fila entera no se muestra. */}
      {REDES.some(({ key }) => siteConfig.redes[key]) && (
        <div className="border-azul-principal/10 flex items-center justify-between gap-4 border-t pt-5">
          <span className="text-gris-texto font-mono text-[0.72rem] font-medium tracking-[0.18em] uppercase">
            Seguinos
          </span>
          <ul className="flex items-center gap-2.5">
            {REDES.map(({ key, label, Icon }) => {
              const url = siteConfig.redes[key];
              if (!url) return null;
              return (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Empoderamiento Docente en ${label}`}
                    className="border-azul-principal/15 text-azul-principal/75 hover:border-azul-principal hover:bg-azul-principal inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors hover:text-white"
                  >
                    <Icon size={20} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
