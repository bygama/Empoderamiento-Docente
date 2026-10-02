import type { HeroInvestigacion } from "@/features/investigacion/contenido/hero";
import { FIGURAS, PUNTOS, VIEWBOX } from "../constelacion";

/**
 * «Por qué investigamos» bajo `lg` cuando la escena del hero no corre
 * (movimiento reducido o pantallas bajas): las cuatro etapas en flujo, cada
 * una con su figura ya formada. Con la escena en marcha (`data-modo="movil"`
 * en la pista del hero, movil/escena.ts) la historia se cuenta sobre la hoja
 * 01, que es decorativa para los lectores de pantalla: esta lista queda
 * entonces solo para ellos.
 */
export function EtapasEnFlujo({ pasos }: { pasos: HeroInvestigacion["pasos"] }) {
  return (
    <div
      role="region"
      aria-label="Por qué investigamos, en cuatro pasos"
      className="bg-azul-principal bg-grain-dark relative text-white lg:hidden [[data-modo=movil]_&]:sr-only"
    >
      <ol className="grid gap-10 px-6 pt-6 pb-16 md:grid-cols-2 md:px-12">
        {FIGURAS.map((f, i) => (
          <li key={f.id}>
            <svg viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} aria-hidden="true" className="h-40 w-auto">
              <g stroke="var(--color-azul-medio)" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round">
                {f.aristas.map(([a, b]) => (
                  <line key={`${a}-${b}`} x1={f.puntos[a][0]} y1={f.puntos[a][1]} x2={f.puntos[b][0]} y2={f.puntos[b][1]} />
                ))}
              </g>
              {f.puntos.map(([x, y], k) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r={PUNTOS[k].r} fill={PUNTOS[k].color} />
              ))}
            </svg>
            <p className="text-azul-claro/60 mt-3 font-mono text-[0.68rem] tracking-[0.2em] uppercase">0{i + 1}</p>
            <h3 className="font-display mt-1 text-[1.4rem] font-extrabold">{pasos[i]?.verbo}</h3>
            <p className="text-azul-claro/85 mt-2 text-[1rem] leading-relaxed">{pasos[i]?.frase}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
