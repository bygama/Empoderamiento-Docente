import Image from "next/image";
import { FOTOS } from "./data";
import { GRILLA } from "./estilos";

/**
 * Panel de fotos (beats 0–2): lámina acoplada a la derecha. Vive en la MISMA
 * grilla que la columna de texto (columna 2), así su borde derecho cierra
 * sobre el margen del sitio. Las fotos se revelan dentro de la máscara y la
 * muesca del borde izquierdo viaja con el scroll (reinterpretación sobria de
 * la referencia editorial). Solo desktop + motion. Lo anima `panel-fotos.ts`.
 */
export function PanelFotos() {
  return (
    <div
      data-photo-panel
      className="absolute inset-0 z-0 hidden will-change-transform md:block motion-reduce:hidden"
    >
      <div className={`h-full ${GRILLA}`}>
        <div className="col-start-2 mt-[13svh] h-[74svh]">
          <div
            data-photo-lamina
            className="relative h-full w-full overflow-hidden rounded-[1.75rem] bg-white/[0.04] shadow-[0_60px_140px_-50px_rgb(0_0_0/0.7)] will-change-transform"
          >
            {FOTOS.map((f, i) => (
              <div
                key={f.src}
                data-photo={i}
                className={`absolute inset-0 will-change-transform ${i === 0 ? "" : "opacity-0"}`}
              >
                {/* Bleed del 7% para la deriva vertical sin descubrir bordes */}
                <div data-photo-img className="absolute -inset-[7%]">
                  <Image
                    src={f.src}
                    alt={f.alt}
                    fill
                    sizes="(max-width: 767px) 1px, (min-width: 1280px) 560px, 44vw"
                    className="object-cover"
                  />
                </div>
                {/* Velos navy: integran la foto al sistema visual de la lámina */}
                <div
                  aria-hidden="true"
                  className="bg-azul-principal/25 absolute inset-0 mix-blend-multiply"
                />
                <div
                  aria-hidden="true"
                  className="from-azul-principal/30 absolute inset-0 bg-gradient-to-r via-transparent to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="from-azul-principal/55 absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t to-transparent"
                />
              </div>
            ))}
            {/* Muesca deslizante del borde izquierdo (chaflán suave).
                Filo de luz + tick naranja para que se lea sobre la
                foto (navy puro desaparecía contra los velos). El rail
                mide la altura del panel: GSAP lo desliza con yPercent
                (transform composited, sin reflow) y el % sigue al
                panel en resize. */}
            <div
              data-notch-rail
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 -left-px z-10 w-[22px] will-change-transform"
            >
              <svg
                viewBox="0 0 18 144"
                preserveAspectRatio="none"
                className="text-azul-principal absolute top-0 left-0 h-36 w-[22px]"
              >
                <path
                  d="M0 0 C 0 14, 13 18, 13 34 L 13 110 C 13 126, 0 130, 0 144 Z"
                  fill="currentColor"
                />
                <path
                  d="M0 0 C 0 14, 13 18, 13 34 L 13 110 C 13 126, 0 130, 0 144"
                  fill="none"
                  stroke="rgb(255 255 255 / 0.16)"
                  strokeWidth="1.25"
                />
                <rect
                  x="4"
                  y="56"
                  width="3"
                  height="32"
                  rx="1.5"
                  fill="var(--color-naranja-accion)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
