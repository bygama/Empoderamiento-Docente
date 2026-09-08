import Link from "next/link";
import { ArrowUpRight } from "@/components/ui/icons";
import { NAV_LINKS } from "@/config/nav";
import type { SeccionPagina } from "@/lib/hooks/useSeccionesPagina";

type Props = {
  /** Ruta actual: marca el ítem activo. */
  pathname: string;
  secciones: SeccionPagina[];
  onCerrar: () => void;
  onIrASeccion: (id: string) => void;
};

/**
 * Navegación grande apilada (eco del Footer) más el atajo a las secciones de
 * la página actual: sin él hay que recorrer todas las escenas hasta llegar a
 * la que se busca. En desktop ese atajo es la columna de marcas del borde
 * derecho (IndicePagina).
 */
export function NavegacionMenu({ pathname, secciones, onCerrar, onIrASeccion }: Props) {
  return (
    <nav
      aria-label="Navegación principal"
      className="flex flex-1 flex-col justify-center px-6 sm:px-8"
    >
      <ul>
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href} data-mnav-item>
              <Link
                href={link.href}
                onClick={onCerrar}
                aria-current={active ? "page" : undefined}
                className="group border-azul-principal/10 flex items-center justify-between border-b py-4"
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
                  className={`shrink-0 transition-[color,opacity,transform] duration-300 ${
                    active
                      ? "text-verde-concepto opacity-100"
                      : "text-azul-principal/40 -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  }`}
                />
              </Link>
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
