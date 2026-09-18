import { ARCOS, LINEAS, NODOS, PERSPECTIVAS, RAMAS } from "./constelacion-mirada";

/**
 * Escenario decorativo: constelación en DOS capas con la misma cámara. Las
 * líneas van DEBAJO de las fichas y los nodos ENCIMA: una ficha tapa limpia
 * cualquier línea que cruce por detrás y sigue pasando por detrás del rótulo
 * del nodo. Decorativa: el contenido real vive en los bloques de texto.
 */
export function MapaConstelacion({ live }: { live: boolean }) {
  return (
    <>
      <div
        data-stage-lineas
        aria-hidden="true"
        className={
          "absolute inset-0 motion-reduce:hidden" +
          (live ? "" : " hidden")
        }
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 160 90"
          preserveAspectRatio="none"
        >
          {ARCOS.map((d, i) => (
            <path
              key={`arco-${i}`}
              data-arco
              d={d}
              fill="none"
              stroke="#1f2d4d"
              strokeWidth="0.12"
              strokeDasharray="0.35 0.95"
            />
          ))}
          {LINEAS.map((d, i) => (
            <path
              key={`linea-${i}`}
              data-linea
              d={d}
              fill="none"
              stroke="rgba(31,45,77,0.32)"
              strokeWidth="0.16"
              strokeLinecap="round"
            />
          ))}
          {RAMAS.map((r, i) => (
            <path
              key={`rama-${i}`}
              data-rama
              d={r.d}
              fill="none"
              stroke="rgba(31,45,77,0.35)"
              strokeWidth="0.13"
              strokeLinecap="round"
            />
          ))}
          {RAMAS.map((r, i) => (
            <circle
              key={`ramdot-${i}`}
              data-ramdot
              cx={r.fin.x}
              cy={r.fin.y}
              r="0.5"
              fill="#4a6fa5"
            />
          ))}
        </svg>
      </div>
      <div
        data-stage
        aria-hidden="true"
        className={
          "absolute inset-0 motion-reduce:hidden" +
          (live ? "" : " hidden")
        }
      >
        {/* Nodos (wrapper posiciona; el core anima — GSAP no pisa el
            translate de centrado) */}
        {/* Anclaje IZQUIERDO: el punto queda sobre la coordenada del nodo
            y el label crece hacia la derecha. Así, al hacer zoom sobre un
            principio, los labels vecinos no asoman sobre la zona de
            lectura (el 02 quedaba cruzando el texto del 01). */}
        {PERSPECTIVAS.map((p, i) => (
          <div
            key={p.id}
            className="absolute"
            style={{
              left: `${NODOS[i].x}%`,
              top: `${NODOS[i].y}%`,
              transform: "translate(-9px, -50%)",
            }}
          >
            <div
              data-nodo-core={i}
              className="flex items-center gap-3"
            >
              <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                {/* Halo pre-pintado: solo se anima su opacidad */}
                <span
                  data-nodo-halo
                  className="absolute -inset-[7px] rounded-full"
                  style={{ backgroundColor: `${p.accent}1f` }}
                />
                {/* Identidad cromática suave desde la apertura */}
                <span
                  className="relative block h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: p.accent }}
                />
              </span>
              <span
                data-nodo-num
                className="text-azul-principal/60 font-mono text-[0.8rem] font-medium tracking-[0.18em]"
              >
                {p.id}
              </span>
              <span
                data-nodo-label
                className="font-display text-azul-principal text-[1.02rem] font-semibold whitespace-nowrap md:text-[1.15rem]"
              >
                {p.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
