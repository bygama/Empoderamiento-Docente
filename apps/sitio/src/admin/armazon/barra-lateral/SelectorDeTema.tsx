"use client";

import { useSyncExternalStore, type ComponentType } from "react";
import { Luna, PanelIzquierdo, Sol, type IconProps } from "@/components/ui/icons";
import { COOKIE_DEL_TEMA, DURACION_DEL_TEMA, temaDe, type Tema } from "../tema";

const OPCIONES: { tema: Tema; nombre: string; Icono: ComponentType<IconProps> }[] = [
  { tema: "claro", nombre: "Claro", Icono: Sol },
  { tema: "mixto", nombre: "Mixto", Icono: PanelIzquierdo },
  { tema: "oscuro", nombre: "Oscuro", Icono: Luna },
];

// La fuente de verdad es el atributo `data-tema` del armazón, que es lo que
// lee globals.css. Los selectores (el de escritorio y el del celular) lo
// miran con `useSyncExternalStore` y se enteran cuando cambia.
const oyentes = new Set<() => void>();

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

function temaEnPantalla(): Tema {
  return temaDe(document.querySelector("[data-tema]")?.getAttribute("data-tema") ?? undefined);
}

/** Cambia en el acto y deja la cookie, para que la próxima carga ya venga con ese tema desde el servidor. */
function elegirTema(tema: Tema) {
  const segura = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${COOKIE_DEL_TEMA}=${tema}; path=/admin; max-age=${DURACION_DEL_TEMA}; samesite=lax${segura}`;
  document.querySelector("[data-tema]")?.setAttribute("data-tema", tema);
  oyentes.forEach((oyente) => oyente());
}

/** Claro, mixto u oscuro, en el menú de la cuenta: las tres opciones a la vista, sin un rótulo delante. */
export function SelectorDeTema({ tema }: { tema: Tema }) {
  const actual = useSyncExternalStore(suscribir, temaEnPantalla, () => tema);
  return (
    <div className="px-1.5 py-1">
      <div role="group" aria-label="Tema" className="grid grid-cols-3 gap-0.5 rounded-lg bg-gris-fondo p-0.5">
        {OPCIONES.map(({ tema: opcion, nombre, Icono }) => (
          <button
            key={opcion}
            type="button"
            aria-pressed={actual === opcion}
            onClick={() => elegirTema(opcion)}
            className="flex h-14 flex-col items-center justify-center gap-1 rounded-md text-admin-meta text-azul-principal/80 transition-colors hover:text-azul-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio aria-pressed:bg-white aria-pressed:font-medium aria-pressed:text-azul-principal aria-pressed:shadow-sm"
          >
            <Icono size={18} className="shrink-0" />
            {nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
