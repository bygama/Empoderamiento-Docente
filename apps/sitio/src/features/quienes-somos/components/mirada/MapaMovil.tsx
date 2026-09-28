import type { Perspectiva } from "./constelacion-mirada";

/**
 * «Nuestra mirada» bajo `lg`: la cámara de escritorio no entra en una
 * pantalla vertical, así que el mapa se vuelve una constelación mínima y
 * fija bajo el header —tres nodos unidos por un trazo— que acompaña la
 * lectura: el trazo se dibuja al avanzar y el nodo del principio que se está
 * leyendo se enciende. Tocar un nodo lleva a su principio. Decorativa para
 * lectores de pantalla salvo los botones.
 */
const X = [16, 50, 84];
export function MapaMovil({ perspectivas, onIr }: { perspectivas: readonly Perspectiva[]; onIr: (i: number) => void }) {
  return (
    <div data-mapa-movil className="sticky top-[4.75rem] z-20 -mx-6 bg-white/85 px-6 py-2 backdrop-blur lg:hidden">
      <div className="relative mx-auto h-16 max-w-md">
        <svg aria-hidden="true" viewBox="0 0 100 24" preserveAspectRatio="none" className="text-azul-principal absolute inset-x-0 top-0 h-full w-full overflow-visible">
          <path d={`M${X[0]},12 L${X[1]},12 L${X[2]},12`} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
          <path data-mapa-trazo d={`M${X[0]},12 L${X[1]},12 L${X[2]},12`} fill="none" stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        </svg>
        {perspectivas.map((p, i) => (
          <button
            key={p.id}
            type="button"
            data-mapa-nodo={i}
            onClick={() => onIr(i)}
            aria-label={`Ir a ${p.nombre}`}
            className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
            style={{ left: `${X[i]}%` }}
          >
            <span
              data-mapa-halo
              className="absolute h-7 w-7 rounded-full opacity-0 transition-opacity duration-300 [[data-activo]_&]:opacity-100"
              style={{ backgroundColor: `${p.accent}33` }}
            />
            <span
              data-mapa-punto
              className="relative block h-3 w-3 rounded-full transition-transform duration-300 [[data-activo]_&]:scale-125"
              style={{ backgroundColor: p.accent }}
            />
            <span className="text-azul-principal/70 absolute top-full mt-0.5 font-mono text-[0.62rem] tracking-[0.14em]">{p.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
