import Link from "next/link";
import { Numero, type Cuenta } from "./Numero";

export type OpcionDeFiltro = { href: string; etiqueta: string; numero?: Cuenta };

// La activa con borde `azul-principal` y el texto igual (13,63:1 en el claro,
// 13,59:1 en el oscuro); las demás en `gris-texto` (4,83:1 · 7,08:1), que en
// hover pasan a `azul-principal` sobre `azul-claro/30` (11,63:1): ahí
// `gris-texto` daría 4,12:1. Sin relleno en la activa, para que su número
// (una pastilla `azul-principal`) se siga viendo.
const BASE =
  "inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-admin-meta font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio";
const ACTIVA = "border-azul-principal text-azul-principal";
const INACTIVA = "border-transparent text-gris-texto hover:bg-azul-claro/30 hover:text-azul-principal";

/**
 * El filtro de una lista (DESIGN.md §11, «Filtro»): la misma lista, recortada
 * por un valor que va en la URL (`?estado=en-curso`). No son pantallas del
 * módulo, así que no son pestañas: van debajo del encabezado, en píldoras.
 * Son links —se comparten, vuelven con «atrás»— con la activa anunciada por
 * `aria-current`; la activa la dice quien lo usa, porque sale del query y no
 * de la ruta. No sabe de ED.
 */
export function Filtro({ etiqueta, opciones, activa }: { etiqueta: string; opciones: readonly OpcionDeFiltro[]; activa: string }) {
  return (
    <nav aria-label={etiqueta} className="-mx-1 overflow-x-auto px-1 py-1">
      <ul className="flex gap-1">
        {opciones.map((o) => {
          const encendida = o.href === activa;
          return (
            <li key={o.href}>
              <Link href={o.href} aria-current={encendida ? "page" : undefined} className={`${BASE} ${encendida ? ACTIVA : INACTIVA}`}>
                {o.etiqueta}
                {o.numero ? <Numero {...o.numero} /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
