"use client";

import { usePathname } from "next/navigation";
import { ChevronDown } from "@/components/ui/icons";
import type { PaginaDelArbol } from "./arbol";
import { ESTILO_ACTIVO, ESTILO_INACTIVO, ItemDeNavegacion } from "./ItemDeNavegacion";

// Cliente solo por `usePathname`: el layout no conoce la ruta, y el ítem
// activo y la página abierta salen de ella. Los datos llegan del servidor ya
// armados (BarraLateral).

/** El punto de «cambios sin publicar»: se ve y se anuncia. */
function PuntoSinPublicar() {
  return (
    <>
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-azul-claro" />
      <span className="sr-only">(cambios sin publicar)</span>
    </>
  );
}

function PaginaConSecciones({ pagina, actual }: { pagina: PaginaDelArbol; actual: boolean }) {
  return (
    <li>
      {/* `<details>` nativo: se abre y se cierra sin JS, y la página de la ruta actual arranca abierta. */}
      <details open={actual} className="group">
        <summary
          aria-current={actual ? "page" : undefined}
          className={`relative flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-admin-meta transition-colors [&::-webkit-details-marker]:hidden ${actual ? ESTILO_ACTIVO : ESTILO_INACTIVO}`}
        >
          <span className="flex-1">{pagina.nombre}</span>
          {pagina.sinPublicar ? <PuntoSinPublicar /> : null}
          <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <ul className="mt-1 ml-4 space-y-1 border-l border-white/15 pl-2">
          {pagina.secciones.map((s) => (
            <li key={s.clave}>
              <ItemDeNavegacion href={`/admin/paginas/${pagina.slug}#seccion-${s.clave}`} activo={false}>
                {s.nombre}
              </ItemDeNavegacion>
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}

/** Una página que todavía no tiene secciones en el registro: atenuada y sin link (su editor daría 404). */
function PaginaSinSecciones({ pagina }: { pagina: PaginaDelArbol }) {
  return (
    <li className="flex items-baseline justify-between gap-2 px-3 py-2 text-admin-meta text-azul-claro/75">
      <span>{pagina.nombre}</span>
      <span className="text-admin-meta">Todavía no se edita</span>
    </li>
  );
}

export function ArbolDelSitio({ arbol }: { arbol: PaginaDelArbol[] }) {
  const ruta = usePathname();
  return (
    <nav aria-label="Navegación del admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {/* «· métricas» lo separa de la página Inicio del sitio, que está más abajo con el mismo nombre. */}
      <ItemDeNavegacion href="/admin" activo={ruta === "/admin"}>
        Inicio <span className="text-admin-meta opacity-80">· métricas</span>
      </ItemDeNavegacion>
      <div>
        <p className="px-3 pb-2 text-admin-meta font-medium tracking-wider text-azul-claro uppercase">Sitio</p>
        <ul className="space-y-1">
          <li>
            <ItemDeNavegacion href="/admin/paginas" activo={ruta === "/admin/paginas"}>
              Todas las páginas
            </ItemDeNavegacion>
          </li>
          {arbol.map((pagina) =>
            pagina.secciones.length > 0 ? (
              <PaginaConSecciones key={pagina.slug} pagina={pagina} actual={ruta.startsWith(`/admin/paginas/${pagina.slug}`)} />
            ) : (
              <PaginaSinSecciones key={pagina.slug} pagina={pagina} />
            ),
          )}
        </ul>
      </div>
    </nav>
  );
}
