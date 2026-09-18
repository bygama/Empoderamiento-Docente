import Link from "next/link";
import type { MouseEvent } from "react";
import { ChevronDown } from "@/components/ui/icons";
import { NAV_LINKS, esPaginaActiva } from "@/config/nav";
import type { SeccionPagina } from "@/lib/hooks/useSeccionesPagina";

// Sobre el azul del panel (mismos valores que el Footer sobre su azul).
const ROTULO =
  "text-azul-claro/70 flex items-center gap-3 font-mono text-[0.68rem] font-medium tracking-[0.2em] uppercase";
const CHIP =
  "text-azul-claro inline-flex min-h-10 items-center rounded-full border border-white/20 px-3.5 font-sans text-[0.9rem] font-medium transition-colors hover:border-white hover:text-white";

type Props = {
  /** Ruta actual: marca el ítem activo. */
  pathname: string;
  secciones: SeccionPagina[];
  /** href del ítem con el submenú desplegado, o null. */
  desplegado: string | null;
  onDesplegar: (href: string | null) => void;
  onCerrar: () => void;
  /** Ya estamos en esa página: cierra y sube al principio deslizando. */
  onSubirEnPagina: () => void;
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
  onSubirEnPagina,
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
      className="flex flex-1 flex-col justify-center px-8 py-4"
    >
      {/* Rótulo con hairline, como los del Footer: nombra la lista. */}
      <p className={ROTULO}>
        <span aria-hidden="true" className="bg-verde-concepto h-px w-6" />
        Explorar
      </p>
      <ul className="mt-3">
        {NAV_LINKS.map((link) => {
          const active = esPaginaActiva(pathname, link.href);
          const sub = link.submenu ?? [];
          const abierto = desplegado === link.href;
          return (
            <li key={link.href}>
              <div className="flex items-center justify-between">
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
                    onClick={() => onDesplegar(abierto ? null : link.href)}
                    className="text-azul-claro/60 ml-2 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform hover:text-white"
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
                        className={CHIP}
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
          <p className={ROTULO}>
            <span aria-hidden="true" className="bg-verde-concepto h-px w-6" />
            En esta página
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {secciones.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => onIrASeccion(s.id)} className={CHIP}>
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
