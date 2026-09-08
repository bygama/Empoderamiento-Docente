import Link from "next/link";
import type { MouseEvent } from "react";
import { ArrowUpRight, ChevronDown } from "@/components/ui/icons";
import { NAV_LINKS, esPaginaActiva } from "@/config/nav";
import type { SeccionPagina } from "@/lib/hooks/useSeccionesPagina";

type Props = {
  /** Ruta actual: marca el ítem activo. */
  pathname: string;
  secciones: SeccionPagina[];
  /** href del ítem con el submenú desplegado, o null. */
  desplegado: string | null;
  onDesplegar: (href: string | null) => void;
  onCerrar: () => void;
  onIrASeccion: (id: string) => void;
  onIrADestino: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

/**
 * Navegación grande apilada (eco del Footer) más el atajo a las secciones de
 * la página actual: sin él hay que recorrer todas las escenas hasta llegar a
 * la que se busca. En desktop ese atajo es la columna de marcas del borde
 * derecho (IndicePagina).
 *
 * Cada página con submenú abre un ACORDEÓN: el chevron lo despliega y el de
 * la página actual arranca abierto (el estado vive en el compositor, que lo
 * resetea al cambiar de ruta). Los destinos del submenú van por `onIrADestino`
 * porque pueden llevar query y hash: en la misma página cortan directo y en
 * otra navegan y aterrizan.
 */
export function NavegacionMenu({
  pathname,
  secciones,
  desplegado,
  onDesplegar,
  onCerrar,
  onIrASeccion,
  onIrADestino,
}: Props) {
  return (
    <nav
      aria-label="Navegación principal"
      className="flex flex-1 flex-col justify-center px-6 sm:px-8"
    >
      <ul>
        {NAV_LINKS.map((link) => {
          const active = esPaginaActiva(pathname, link.href);
          const sub = link.submenu ?? [];
          const abierto = desplegado === link.href;
          return (
            <li key={link.href} data-mnav-item className="border-azul-principal/10 border-b">
              <div className="flex items-center justify-between">
                <Link
                  href={link.href}
                  onClick={onCerrar}
                  aria-current={active ? "page" : undefined}
                  className="group flex flex-1 items-center justify-between py-4"
                >
                  <span
                    className={`font-display text-[clamp(1.6rem,1rem+4vw,2.4rem)] font-bold tracking-[-0.01em] transition-colors ${
                      active
                        ? "text-verde-concepto"
                        : "text-azul-principal group-hover:text-verde-concepto"
                    }`}
                  >
                    {link.label}
                  </span>
                  <ArrowUpRight
                    size={22}
                    className={`shrink-0 transition-[color,opacity,translate] duration-300 ${
                      active
                        ? "text-verde-concepto opacity-100"
                        : "text-azul-principal/40 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                  />
                </Link>
                {sub.length > 0 && (
                  <button
                    type="button"
                    aria-label={`${abierto ? "Ocultar" : "Ver"} secciones de ${link.label}`}
                    aria-expanded={abierto}
                    onClick={() => onDesplegar(abierto ? null : link.href)}
                    className="text-azul-principal/60 hover:text-azul-principal ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform"
                    style={{ transform: abierto ? "rotate(180deg)" : undefined }}
                  >
                    <ChevronDown size={20} />
                  </button>
                )}
              </div>
              {sub.length > 0 && (
                <ul hidden={!abierto} className="flex flex-wrap gap-2 pb-4">
                  {sub.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        scroll={false}
                        onClick={(e) => onIrADestino(e, s.href)}
                        className="border-azul-principal/15 text-azul-principal hover:border-azul-principal inline-flex min-h-10 items-center rounded-full border px-3.5 font-sans text-[0.9rem] font-medium transition-colors"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {secciones.length >= 2 && (
        <div className="mt-8">
          <p className="text-gris-texto font-mono text-[0.68rem] font-medium tracking-[0.2em] uppercase">
            En esta página
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {secciones.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onIrASeccion(s.id)}
                  className="border-azul-principal/15 text-azul-principal hover:border-azul-principal inline-flex min-h-10 items-center rounded-full border px-3.5 font-sans text-[0.9rem] font-medium transition-colors"
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
