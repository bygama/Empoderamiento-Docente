"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Numero, type Cuenta } from "./Numero";
import { pestanaActiva } from "./ruta";

/** Con `numero`, cuántos esperan en esa pantalla (DESIGN.md §11, «El número»). */
export type Pestana = { href: string; etiqueta: string; numero?: Cuenta };

// La activa en `azul-principal` con una barra de 2 px abajo (13,63:1 en el
// claro, 13,59:1 en el oscuro); las demás en `gris-texto` (4,83:1 y 7,08:1).
// El foco va por dentro (`-outline-offset-2`): afuera lo cortaría el scroll
// horizontal del celular.
const BASE =
  "relative flex h-11 items-center gap-2 whitespace-nowrap rounded-md px-3 text-admin-meta font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2";
const ACTIVA = "text-azul-principal after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-azul-principal focus-visible:outline-azul-medio";
const INACTIVA = "text-gris-texto hover:text-azul-principal focus-visible:outline-azul-medio";
// Sobre `azul-principal` (el encabezado del editor con cambios sin guardar):
// la activa en blanco con su barra (13,63:1; 13,59:1 en el oscuro), las demás
// en `azul-claro` (7,68:1; 7,95:1) y el foco en `azul-claro`, porque el
// `azul-medio` ahí da 2,67:1.
const ACTIVA_SOBRE_AZUL = "text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-white focus-visible:outline-azul-claro";
const INACTIVA_SOBRE_AZUL = "text-azul-claro hover:text-white focus-visible:outline-azul-claro";

/**
 * Las pantallas de un módulo, debajo de su encabezado (DESIGN.md §11). Son
 * links que navegan, no el patrón ARIA de tabs: un `nav` y una lista, con la
 * activa anunciada por `aria-current`. La activa sale de la ruta —la más
 * específica de las que la contienen (`pestanaActiva`)—, así un layout puede
 * ponerlas sin que cada página diga cuál es, y las de una página del editor
 * (`/productos/3` y `/productos/3/seo`) no se encienden de a dos. Cliente solo por
 * `usePathname`.
 */
export function Pestanas({ etiqueta, pestanas, sobreAzul = false }: { etiqueta: string; pestanas: readonly Pestana[]; sobreAzul?: boolean }) {
  const [activaClase, inactivaClase] = sobreAzul ? [ACTIVA_SOBRE_AZUL, INACTIVA_SOBRE_AZUL] : [ACTIVA, INACTIVA];
  const activa = pestanaActiva(
    usePathname(),
    pestanas.map((p) => p.href),
  );
  return (
    // El `-mx-3` alinea el texto de la primera con el título de arriba.
    <nav aria-label={etiqueta} className="-mx-3 overflow-x-auto">
      <ul className="flex gap-1">
        {pestanas.map((p) => {
          const encendida = p.href === activa;
          return (
            <li key={p.href}>
              <Link href={p.href} aria-current={encendida ? "page" : undefined} className={`${BASE} ${encendida ? activaClase : inactivaClase}`}>
                {p.etiqueta}
                {p.numero ? <Numero {...p.numero} /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
