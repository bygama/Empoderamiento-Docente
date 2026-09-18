import Link from "next/link";
import { useRef, type MouseEvent } from "react";
import { ChevronDown } from "@/components/ui/icons";
import { NAV_LINKS, esPaginaActiva } from "@/config/nav";
import { useAcordeonFlip } from "./useAcordeonFlip";

// Sobre el azul del panel (mismos valores que el Footer sobre su azul).
const ROTULO =
  "text-azul-claro/70 flex items-center gap-3 font-mono text-[0.68rem] font-medium tracking-[0.2em] uppercase";
// Destino de un submenú: la escala chica del panel, en grilla de dos columnas.
const DESTINO =
  "text-azul-claro/80 inline-flex min-h-10 items-center py-1.5 font-sans text-[0.95rem] leading-snug transition-colors hover:text-white";

type Props = {
  /** Ruta actual: marca el ítem activo. */
  pathname: string;
  /** href del ítem con el submenú desplegado, o null. */
  desplegado: string | null;
  onDesplegar: (href: string | null) => void;
  /** prefers-reduced-motion: el acordeón abre y cierra sin deslizar nada. */
  reduced: boolean;
  onCerrar: () => void;
  /** Ya estamos en esa página: cierra y sube al principio deslizando. */
  onSubirEnPagina: () => void;
  onIrADestino: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

/** `/que-hacemos` → `mnav-sub-que-hacemos`: el id que une chevron y submenú. */
const idSub = (href: string) => `mnav-sub${href.replaceAll("/", "-")}`;

/**
 * Navegación grande apilada (eco del Footer): las páginas del sitio y, adentro
 * de cada una, sus destinos con nombre propio (los de `config/nav.ts`).
 *
 * Cada página con submenú abre un ACORDEÓN: el chevron despliega sus destinos
 * en una grilla chica de dos columnas, uno solo a la vez, y las demás páginas
 * se apagan para que se lea cuál está abierta. El de la página actual arranca
 * abierto (el estado vive en el compositor, que lo resetea al cambiar de
 * ruta). Cómo se mueve sin animar alturas, en `useAcordeonFlip`. Los destinos
 * del submenú van por `onIrADestino` porque pueden llevar query y hash: en la misma página cortan directo y en
 * otra navegan y aterrizan.
 */
export function NavegacionMenu({
  pathname,
  onSubirEnPagina,
  desplegado,
  onDesplegar,
  reduced,
  onCerrar,
  onIrADestino,
}: Props) {
  const navRef = useRef<HTMLElement>(null);
  const capturar = useAcordeonFlip(navRef, desplegado, reduced);
  return (
    <nav
      ref={navRef}
      aria-label="Navegación principal"
      className="flex flex-1 flex-col justify-center px-8 py-4"
    >
      {/* Rótulo con hairline, como los del Footer: nombra la lista. */}
      <p data-mnav-flip className={ROTULO}>
        <span aria-hidden="true" className="bg-verde-concepto h-px w-6" />
        Explorar
      </p>
      <ul className="mt-3">
        {NAV_LINKS.map((link) => {
          const active = esPaginaActiva(pathname, link.href);
          const sub = link.submenu ?? [];
          const abierto = desplegado === link.href;
          return (
            <li key={link.href} data-mnav-flip>
              <div
                className={`flex items-center justify-between transition-opacity duration-300 ${
                  desplegado && !abierto ? "opacity-35" : ""
                }`}
              >
                <Link
                  href={link.href}
                  onClick={(e) => {
                    // Ya estamos acá: el Link no navegaría a ningún lado, así
                    // que vale como atajo para volver arriba.
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
                    aria-label={`${abierto ? "Ocultar" : "Ver"} secciones de ${link.label}`}
                    aria-expanded={abierto}
                    aria-controls={idSub(link.href)}
                    onClick={() => {
                      capturar();
                      onDesplegar(abierto ? null : link.href);
                    }}
                    className="text-azul-claro/60 ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform hover:text-white"
                    style={{ transform: abierto ? "rotate(180deg)" : undefined }}
                  >
                    <ChevronDown size={20} />
                  </button>
                )}
              </div>
              {sub.length > 0 && (
                <ul
                  id={idSub(link.href)}
                  data-mnav-sub
                  hidden={!abierto}
                  className="grid grid-cols-2 gap-x-6 pb-3 sm:grid-cols-3"
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
        })}
      </ul>
    </nav>
  );
}
