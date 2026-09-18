import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram, Linkedin } from "@/components/ui/icons";
import type { Redes } from "@/config/datos-del-sitio";
import { CTA_LINK } from "@/config/nav";

// Redes a mostrar — mismo criterio que el Footer: el href sale de las redes
// de Ajustes › Datos del sitio y, sin URL, el ícono no se muestra.
const REDES = [
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "facebook", label: "Facebook", Icon: Facebook },
] as const satisfies ReadonlyArray<{
  key: keyof Redes;
  label: string;
  Icon: typeof Instagram;
}>;

/** Pie del menú: acción focal (Contacto), mail real y redes. Ya en
 *  Contacto, el CTA no navegaría: cierra y sube al hero, como el nombre
 *  de la página actual en el menú. */
export function PieMenu({
  pathname,
  correo,
  redes,
  onCerrar,
  onSubirEnPagina,
}: {
  pathname: string;
  correo: string;
  redes: Redes;
  onCerrar: () => void;
  onSubirEnPagina: () => void;
}) {
  const enContacto = pathname === CTA_LINK.href;
  return (
    <div data-mnav-flip className="flex flex-col gap-5 px-8 pt-4 pb-10">
      <Link
        href={CTA_LINK.href}
        onClick={(e) => {
          if (!enContacto) {
            onCerrar();
            return;
          }
          e.preventDefault();
          onSubirEnPagina();
        }}
        className="bg-naranja-accion inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 font-medium text-white transition-opacity hover:opacity-90"
      >
        {CTA_LINK.label}
        <ArrowUpRight size={18} />
      </Link>

      {/* Mail de contacto: centrado, justo debajo del CTA. */}
      <a
        href={`mailto:${correo}`}
        className="text-azul-claro/70 text-center font-mono text-[0.78rem] tracking-wide transition-colors hover:text-white"
      >
        {correo}
      </a>

      {/* Redes sociales — con rótulo y botones circulares (buen target
          táctil). Solo las que tienen URL confirmada; sin ninguna, la
          fila entera no se muestra. */}
      {REDES.some(({ key }) => redes[key]) && (
        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
          <span className="text-azul-claro/70 font-mono text-[0.72rem] font-medium tracking-[0.18em] uppercase">
            Seguinos
          </span>
          <ul className="flex items-center gap-2.5">
            {REDES.map(({ key, label, Icon }) => {
              const url = redes[key];
              if (!url) return null;
              return (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Empoderamiento Docente en ${label}`}
                    className="hover:text-azul-principal inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-white hover:bg-white"
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
