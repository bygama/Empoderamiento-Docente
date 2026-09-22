import { useRef, type MouseEvent } from "react";
import { ArrowLeft } from "@/components/ui/icons";
import { HOME_LINK, NAV_LINKS, esPaginaActiva } from "@/config/nav";
import { PaginaMenu } from "./PaginaMenu";
import { useAcordeonFlip } from "./useAcordeonFlip";

// «Volver», sobre el azul del panel (mismos valores que el Footer sobre su azul).
const ROTULO =
  "text-azul-claro/70 flex items-center gap-3 font-mono text-[0.68rem] font-medium tracking-[0.2em] uppercase";

// En el menú mobile «Inicio» SÍ va como ítem, primero (pedido del owner): en
// escritorio el acceso a Inicio es el logo, pero acá la lista es el mapa
// completo del sitio y sin él parece que falta una página.
const PAGINAS = [HOME_LINK, ...NAV_LINKS];

type Props = {
  /** Ruta actual: marca el ítem activo. */
  pathname: string;
  /** href de la página en foco, o null (la lista completa). */
  desplegado: string | null;
  onDesplegar: (href: string | null) => void;
  /** prefers-reduced-motion: el foco entra y sale sin deslizar nada. */
  reduced: boolean;
  onCerrar: () => void;
  /** Ya estamos en esa página: cierra y sube al principio deslizando. */
  onSubirEnPagina: () => void;
  onIrADestino: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
};

/**
 * Navegación grande apilada (eco del Footer): las páginas del sitio y, adentro
 * de cada una, sus destinos con nombre propio (los de `config/nav.ts`).
 *
 * Tocar el chevron de una página la pone EN FOCO: las demás salen de la lista,
 * ella sube al tope y sus destinos bajan en vertical. Es una sola decisión por
 * pantalla —primero qué página, después qué parte— en vez de un acordeón con
 * todo a la vista. Se vuelve con «Volver», que aparece arriba solo en foco, o
 * con el mismo chevron. La lista completa no lleva rótulo: el «Explorar» que
 * tenía no decía nada que la lista no dijera (Gastón, 2026-09-22). El menú abre siempre en la lista completa (el foco lo resetea
 * el compositor): arrancar en foco escondería el resto del sitio. Cómo se
 * mueve todo sin animar alturas, en `useAcordeonFlip`.
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
  const cambiarFoco = useAcordeonFlip(navRef, desplegado, reduced, onDesplegar);
  return (
    <nav
      ref={navRef}
      aria-label="Navegación principal"
      // La lista completa va centrada en el alto; en foco se ancla arriba, para
      // que «Volver» y el nombre caigan siempre en el mismo lugar, tenga la
      // página cuatro destinos u ocho.
      className={`flex flex-1 flex-col px-8 py-4 ${desplegado ? "justify-start" : "justify-center"}`}
    >
      {/* En foco, la salida: con el mismo estilo de rótulo que el Footer. */}
      {desplegado && (
        <button type="button" onClick={() => cambiarFoco(null)} className={`${ROTULO} -my-3 min-h-11 hover:text-white`}>
          <ArrowLeft size={16} />
          Volver
        </button>
      )}
      <ul className={desplegado ? "mt-3" : ""}>
        {PAGINAS.map((link) => (
          <PaginaMenu
            key={link.href}
            link={link}
            active={esPaginaActiva(pathname, link.href)}
            enFoco={desplegado === link.href}
            oculta={desplegado !== null && desplegado !== link.href}
            onAlternarFoco={() => cambiarFoco(desplegado === link.href ? null : link.href)}
            onCerrar={onCerrar}
            onSubirEnPagina={onSubirEnPagina}
            onIrADestino={onIrADestino}
          />
        ))}
      </ul>
    </nav>
  );
}
