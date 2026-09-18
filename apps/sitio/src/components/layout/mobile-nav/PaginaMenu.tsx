import Link from "next/link";
import type { MouseEvent } from "react";
import { ChevronDown } from "@/components/ui/icons";
import type { NavItem } from "@/config/nav";

// Destino de un submenú: la escala chica del panel, uno por renglón.
const DESTINO =
  "text-azul-claro/85 flex min-h-11 items-center font-sans text-[1.05rem] leading-snug transition-colors hover:text-white";

/** `/que-hacemos` → `mnav-sub-que-hacemos`: el id que une chevron y submenú. */
const idSub = (href: string) => `mnav-sub${href.replaceAll("/", "-")}`;

type Props = {
  link: NavItem;
  /** Es la página donde se está. */
  active: boolean;
  /** Es la página en foco: muestra sus destinos. */
  enFoco: boolean;
  /** Hay otra página en foco: esta no se muestra. */
  oculta: boolean;
  onAlternarFoco: () => void;
  onCerrar: () => void;
  onSubirEnPagina: () => void;
  onIrADestino: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

/**
 * Una página de la lista del menú: su nombre grande (que navega) y, si tiene
 * destinos, el chevron que la pone EN FOCO. En foco sus destinos bajan en
 * vertical, con una línea guía que los cuelga del nombre; las demás páginas
 * salen de la lista (`oculta`). `data-mnav-pagina` es lo que `useAcordeonFlip`
 * usa para saber cuáles se van.
 */
export function PaginaMenu({
  link,
  active,
  enFoco,
  oculta,
  onAlternarFoco,
  onCerrar,
  onSubirEnPagina,
  onIrADestino,
}: Props) {
  const sub = link.submenu ?? [];
  return (
    <li data-mnav-flip data-mnav-pagina={link.href} hidden={oculta}>
      <div className="flex items-center justify-between">
        <Link
          href={link.href}
          onClick={(e) => {
            // Ya estamos acá: el Link no navegaría a ningún lado, así que vale
            // como atajo para volver arriba.
            if (active) e.preventDefault();
            if (active) onSubirEnPagina();
            else onCerrar();
          }}
          aria-current={active ? "page" : undefined}
          className="group flex flex-1 items-center gap-3 py-2.5"
        >
          {/* La página donde se está: una marca verde adelante (verde =
              concepto, DESIGN.md) y el nombre en azul-claro. */}
          {active && <span aria-hidden="true" className="bg-verde-concepto h-0.5 w-5 shrink-0" />}
          <span
            className={`font-display text-[clamp(1.75rem,1.1rem+3.6vw,2.5rem)] leading-tight font-semibold tracking-[-0.02em] transition-colors ${
              active ? "text-azul-claro" : "group-hover:text-azul-claro text-white"
            }`}
          >
            {link.label}
          </span>
        </Link>
        {sub.length > 0 && (
          <button
            type="button"
            aria-label={`${enFoco ? "Ocultar" : "Ver"} secciones de ${link.label}`}
            aria-expanded={enFoco}
            aria-controls={idSub(link.href)}
            onClick={onAlternarFoco}
            className="text-azul-claro/60 ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform hover:text-white"
            style={{ transform: enFoco ? "rotate(180deg)" : undefined }}
          >
            <ChevronDown size={20} />
          </button>
        )}
      </div>
      {sub.length > 0 && (
        <ul
          id={idSub(link.href)}
          data-mnav-sub
          hidden={!enFoco}
          className="mt-1 mb-3 ml-1 border-l border-white/15 pl-5"
        >
          {sub.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                scroll={false}
                onClick={(e) => onIrADestino(e, s.href)}
                className={DESTINO}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
