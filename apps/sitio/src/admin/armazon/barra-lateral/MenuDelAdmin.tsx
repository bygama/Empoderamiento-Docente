"use client";

import { usePathname } from "next/navigation";
import { ItemDeNavegacion } from "./ItemDeNavegacion";
import { CONFIGURACION, GRUPOS, primerSegmento, type Modulo } from "./modulos";

// Cliente solo por `usePathname`: el layout no conoce la ruta, y la entrada
// activa sale de ella. Lo que depende de la base (el punto) y del rol llega
// del servidor ya resuelto (BarraLateral).

const DIVISOR = "mx-3 my-3 border-azul-claro/60";

/** El punto de «cambios sin publicar»: se ve y se anuncia. */
function PuntoSinPublicar() {
  return (
    <>
      <span aria-hidden="true" className="ml-auto size-2 shrink-0 rounded-full bg-azul-medio" />
      <span className="sr-only">(cambios sin publicar)</span>
    </>
  );
}

export function MenuDelAdmin({ conConfiguracion, conPunto }: { conConfiguracion: boolean; conPunto: readonly string[] }) {
  const segmento = primerSegmento(usePathname());
  const entrada = (m: Modulo) => (
    <li key={m.clave}>
      <ItemDeNavegacion href={m.href} activo={m.segmentos.includes(segmento)} Icono={m.Icono}>
        {m.nombre}
        {conPunto.includes(m.clave) ? <PuntoSinPublicar /> : null}
      </ItemDeNavegacion>
    </li>
  );
  return (
    // En columna, para que la configuración baje sola hasta el pie con `mt-auto`.
    <nav aria-label="Navegación del admin" className="flex flex-1 flex-col overflow-y-auto px-4 pt-3 pb-3">
      {GRUPOS.map((grupo, i) => (
        <div key={grupo[0]?.clave}>
          {i > 0 ? <hr className={DIVISOR} /> : null}
          <ul className="space-y-1">{grupo.map(entrada)}</ul>
        </div>
      ))}
      {conConfiguracion ? (
        <div className="mt-auto pt-6">
          <ul className="space-y-1">{CONFIGURACION.map(entrada)}</ul>
        </div>
      ) : null}
    </nav>
  );
}
