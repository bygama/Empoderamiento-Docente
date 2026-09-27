"use client";

import { usePathname } from "next/navigation";
import type { Cuenta } from "@ed/kit-admin";
import { ItemDeNavegacion } from "./ItemDeNavegacion";
import { CONFIGURACION, GRUPOS, primerSegmento, type Modulo } from "./modulos";

// Cliente solo por `usePathname`: el layout no conoce la ruta, y la entrada
// activa sale de ella. Lo que depende de la base (el punto, los números) y
// del rol llega del servidor ya resuelto (BarraLateral).

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

export function MenuDelAdmin({
  visibles,
  conPunto,
  numeros,
}: {
  visibles: readonly string[];
  conPunto: readonly string[];
  /** Por clave de módulo, cuántos esperan (Mensajes: los sin leer). */
  numeros: Readonly<Record<string, Cuenta>>;
}) {
  const segmento = primerSegmento(usePathname());
  const suyos = new Set(visibles);
  const deSuRol = (modulos: readonly Modulo[]) => modulos.filter((m) => suyos.has(m.clave));
  // Un grupo sin nada que su rol pueda usar no se dibuja, ni su divisor.
  const grupos = GRUPOS.map(deSuRol).filter((g) => g.length > 0);
  const configuracion = deSuRol(CONFIGURACION);
  const entrada = (m: Modulo) => (
    <li key={m.clave}>
      <ItemDeNavegacion href={m.href} activo={m.segmentos.includes(segmento)} Icono={m.Icono} numero={numeros[m.clave]}>
        {m.nombre}
        {conPunto.includes(m.clave) ? <PuntoSinPublicar /> : null}
      </ItemDeNavegacion>
    </li>
  );
  return (
    // En columna, para que la configuración baje sola hasta el pie con `mt-auto`.
    <nav aria-label="Navegación del admin" className="flex flex-1 flex-col overflow-y-auto px-4 pt-3 pb-3">
      {grupos.map((grupo, i) => (
        <div key={grupo[0]?.clave}>
          {i > 0 ? <hr className={DIVISOR} /> : null}
          <ul className="space-y-1">{grupo.map(entrada)}</ul>
        </div>
      ))}
      {configuracion.length > 0 ? (
        <div className="mt-auto pt-6">
          <ul className="space-y-1">{configuracion.map(entrada)}</ul>
        </div>
      ) : null}
    </nav>
  );
}
