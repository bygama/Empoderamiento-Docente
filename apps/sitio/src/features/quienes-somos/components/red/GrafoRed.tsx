import type { Dispatch, SetStateAction } from "react";
import { CX, CY, PAISES, R, SPECS, curve, pct, type SpecKey } from "./red-datos";

/**
 * El grafo ORGÁNICO: conexiones curvas, nodos que derivan (`[data-drift]`) y
 * hotspots invisibles sobre cada especialidad. La coreografía lo dibuja por
 * data-attributes; `setArea` alimenta el highlight y el dock.
 */
export function GrafoRed({ setArea }: { setArea: Dispatch<SetStateAction<SpecKey | null>> }) {
  return (
    <div
      data-red-graph
      className="relative mx-auto mt-8 w-full max-w-5xl md:mt-10"
      onMouseLeave={() => setArea(null)}
    >
      <svg viewBox="0 0 1200 700" className="h-auto w-full" role="img" aria-label="Red de especialidades y países de ED">
        {/* Conexiones curvas centro → especialidades */}
        {SPECS.map((s, i) => (
          <path
            key={`spoke-${s.key}`}
            data-net-line
            data-kind="spoke"
            data-link-key={s.key}
            d={curve(CX, CY, s.x, s.y, (i % 2 === 0 ? 1 : -1) * (16 + (i % 3) * 8))}
            fill="none"
            stroke="rgba(74,111,165,0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
        {/* Malla suave entre especialidades vecinas */}
        {SPECS.map((s, i) => {
          const nx = SPECS[(i + 1) % SPECS.length];
          return (
            <path
              key={`ring-${s.key}`}
              data-net-line
              data-kind="ring"
              d={curve(s.x, s.y, nx.x, nx.y, (i % 2 === 0 ? -1 : 1) * (20 + (i % 2) * 10))}
              fill="none"
              stroke="rgba(74,111,165,0.13)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          );
        })}
        {/* Conexiones curvas centro → países */}
        {PAISES.map((p, i) => (
          <path
            key={`pais-${p.label}`}
            data-net-line
            data-kind="pais"
            d={curve(CX, CY, p.x, p.y, (i % 2 === 0 ? -1 : 1) * (22 + (i % 3) * 9))}
            fill="none"
            stroke="rgba(31,154,120,0.25)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        ))}

        {/* Nodos de especialidad (grupo con DERIVA — solo translate) */}
        {SPECS.map((s) => (
          <g key={`node-${s.key}`} data-drift>
            <circle data-spec-halo={s.key} cx={s.x} cy={s.y} r={R.specHalo} fill="rgba(31,154,120,0.1)" />
            <circle data-spec-dot={s.key} cx={s.x} cy={s.y} r={R.specDot} fill="#1f9a78" />
            <text
              data-spec-text={s.key}
              x={s.x}
              y={s.y + (s.y >= CY ? 50 : -34)}
              textAnchor="middle"
              fill="#1f2d4d"
              className="font-sans"
              style={{ fontSize: "17px", fontWeight: 600 }}
            >
              {s.label}
            </text>
          </g>
        ))}

        {/* Nodos de país (con deriva propia) */}
        {PAISES.map((p) => (
          <g key={`nodep-${p.label}`} data-drift>
            <circle data-pais-halo cx={p.x} cy={p.y} r={R.paisHalo} fill="rgba(74,111,165,0.13)" />
            <circle data-pais-dot cx={p.x} cy={p.y} r={R.paisDot} fill="#4a6fa5" />
            <text
              data-pais-text
              x={p.x}
              y={p.y >= 620 ? p.y + 34 : p.y - 24}
              textAnchor="middle"
              className="fill-gris-texto font-mono"
              style={{ fontSize: "13px", letterSpacing: "0.1em" }}
            >
              {p.label.toUpperCase()}
            </text>
          </g>
        ))}

        {/* Nodo central ED (respira también) */}
        <g data-drift>
          <circle data-ed-circle cx={CX} cy={CY} r={R.edHalo} fill="rgba(31,154,120,0.1)" />
          <circle data-ed-circle cx={CX} cy={CY} r={R.edDot} fill="#1f9a78" />
          <text
            data-ed-text
            x={CX}
            y={CY + 9}
            textAnchor="middle"
            className="fill-white font-display"
            style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "0.02em" }}
          >
            ED
          </text>
        </g>
      </svg>

      {/* Hotspots (hover/clic) — invisibles, sobre cada nodo */}
      {SPECS.map((s) => (
        <button
          key={`hs-${s.key}`}
          type="button"
          aria-label={`Ver especialistas de ${s.label}`}
          className="absolute z-30 h-20 w-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde-concepto"
          style={pct(s.x, s.y)}
          onMouseEnter={() => setArea(s.key)}
          onFocus={() => setArea(s.key)}
          onClick={() => setArea((a) => (a === s.key ? null : s.key))}
        />
      ))}
    </div>
  );
}
