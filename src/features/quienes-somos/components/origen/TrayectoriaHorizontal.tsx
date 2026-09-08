import { Fragment } from "react";
import { HITOS, NODOS, PATH_D } from "./data";

/**
 * Recorrido horizontal (desktop) del beat 3: la línea se dibuja sola por
 * dash-offset y cada hito se activa cuando el trazo llega a su posición.
 * El aire que dejó el párrafo de apoyo se conserva acá: el bloque va
 * centrado, así que sin este margen el titular caía ~38px al sacarlo. Con
 * él, titular y trayectoria quedan donde estaban.
 */
export function TrayectoriaHorizontal() {
  return (
    <div className="relative mt-28 hidden w-full max-w-6xl md:mt-32 md:block">
      <svg viewBox="0 0 1000 220" className="h-auto w-full" aria-hidden="true">
        <path
          d={PATH_D}
          fill="none"
          stroke="rgba(169,197,232,0.25)"
          strokeWidth="2"
          strokeDasharray="3 7"
        />
        <path
          data-const-path
          d={PATH_D}
          fill="none"
          stroke="#1f9a78"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {NODOS.map((n, i) => (
          <Fragment key={i}>
            <circle cx={n.x} cy={n.y} r="13" fill="rgba(31,154,120,0.15)" />
            <circle
              data-const-node
              cx={n.x}
              cy={n.y}
              r="8"
              fill={i === NODOS.length - 1 ? "#e07a2f" : "#1f9a78"}
              className="origin-center [transform-box:fill-box]"
            />
          </Fragment>
        ))}
      </svg>
      {/* Etiquetas HTML sobre la misma grilla del viewBox. El <li>
          EXTERNO posiciona (transform estático); el interno anima
          (así GSAP no pisa el offset de posicionamiento). */}
      <ol className="absolute inset-0 m-0 list-none p-0">
        {HITOS.map((h, i) => (
          <li
            key={h.t}
            className="absolute w-44 md:w-52"
            style={{
              left: `${(NODOS[i].x / 1000) * 100}%`,
              top: `${(NODOS[i].y / 220) * 100}%`,
              // Los hitos extremos se descentran para no cortarse
              // contra los bordes del viewport (Maestría / Hoy).
              transform: `translate(${
                i === 0 ? "-28%" : i === HITOS.length - 1 ? "-72%" : "-50%"
              }, ${i % 2 === 0 ? "20px" : "calc(-100% - 20px)"})`,
            }}
          >
            <div data-const-label>
              <p className="font-display text-[1.02rem] font-bold text-white md:text-[1.12rem]">
                {h.t}
              </p>
              <p className="text-azul-claro/80 mt-1 font-sans text-[0.85rem] leading-snug">
                {h.d}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
