import type { Perspectiva } from "./constelacion-mirada";
import { RAMAS_MOVIL } from "./geometria-movil";

/**
 * «Nuestra mirada» bajo `lg`: el mapa de la escena fija. Tres nodos que la
 * coreografía (`escena-movil.ts`) mueve en tres tiempos: nacen del título,
 * forman la BARRA de arriba —el principio que se lee va adelante con su
 * nombre, y el trazo hacia el siguiente se llena mientras se lee— y en el
 * cierre bajan a formar la constelación alrededor de la síntesis, con sus
 * radios y sus ramas. Todo se ubica por transform desde la esquina de la
 * escena: acá solo está el markup. Decorativo para lectores de pantalla salvo
 * los botones: tocar un nodo lleva a su principio.
 */
export function MapaMovil({ perspectivas, onIr }: { perspectivas: readonly Perspectiva[]; onIr: (i: number) => void }) {
  return (
    <div data-mapa-movil className="pointer-events-none absolute inset-x-0 top-0 z-20 h-svh">
      {/* La barra: el riel tenue y el trazo que se llena con la lectura. */}
      <span data-mapa-riel aria-hidden="true" className="bg-azul-principal/15 absolute top-0 left-0 block h-px origin-left" />
      <span data-mapa-trazo aria-hidden="true" className="bg-azul-principal/70 absolute top-0 left-0 block h-[1.5px] origin-left rounded-full" />

      {/* El cierre: un radio de cada nodo hacia la síntesis y sus ramas. */}
      {perspectivas.map((p) => (
        <span
          key={p.id}
          data-mapa-radio
          aria-hidden="true"
          className="absolute top-0 left-0 block h-px origin-left"
          style={{ backgroundColor: p.accent }}
        />
      ))}
      {RAMAS_MOVIL.map((r) => (
        <span
          key={`${r.nodo}-${r.angulo}`}
          data-mapa-rama={r.nodo}
          aria-hidden="true"
          className="bg-azul-principal/30 absolute top-0 left-0 block h-px origin-left"
          style={{ width: r.largo }}
        >
          <span
            data-mapa-brote
            className="absolute top-1/2 right-0 block h-1.5 w-1.5 translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: perspectivas[r.nodo]?.accent }}
          />
        </span>
      ))}

      {perspectivas.map((p, i) => (
        <div key={p.id} data-mapa-nodo={i} className="absolute top-0 left-0">
          <button
            type="button"
            onClick={() => onIr(i)}
            aria-label={`Ir a ${p.nombre}`}
            className="pointer-events-auto absolute -top-[22px] -left-[22px] flex h-11 w-11 items-center justify-center"
          >
            <span data-mapa-halo className="absolute h-7 w-7 rounded-full" style={{ backgroundColor: `${p.accent}33` }} />
            <span data-mapa-punto className="relative block h-3 w-3 rounded-full" style={{ backgroundColor: p.accent }} />
          </button>
          {/* El nombre del principio (en escritorio lo dice el nodo del mapa).
              Va DEBAJO de la barra: a su altura el trazo lo cruzaba como un
              tachado. */}
          <span data-mapa-rotulo aria-hidden="true" className="absolute top-4 -left-1.5 block w-[11rem]">
            <span className="text-azul-principal/60 block font-mono text-[0.62rem] tracking-[0.18em]">{p.id}</span>
            <span className="font-display text-azul-principal block text-[0.92rem] leading-[1.15] font-bold">{p.nombre}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
