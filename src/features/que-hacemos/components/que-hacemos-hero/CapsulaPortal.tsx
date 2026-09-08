import type { CSSProperties, RefObject } from "react";

type CapsulaPortalProps = {
  /** Campo magnético (el padding invisible es el radio de sensado). */
  refCampo: RefObject<HTMLDivElement | null>;
  /** El botón que se carga con click u hold. */
  refBoton: RefObject<HTMLButtonElement | null>;
  /** Contenido interno (parallax propio y olita de letras). */
  refInner: RefObject<HTMLSpanElement | null>;
};

/**
 * Portal al recorrido: CÁPSULA DE LUZ VERDE — vidrio con halo que respira.
 * Click u hold la cargan: el cuerpo se hincha y la luz interna crece
 * (--carga alimenta glow/borde/halo desde CSS); al completar, pop gomoso +
 * flood verde + viaje a la torre. Scrollear sigue funcionando siempre —
 * atajo, no puerta. Los refs los consumen el magnetismo y el portal.
 */
export function CapsulaPortal({ refCampo, refBoton, refInner }: CapsulaPortalProps) {
  return (
    <div data-qh-rise className="mt-10 md:mt-12">
      {/* Campo magnético: el padding invisible es el radio de sensado. */}
      <div ref={refCampo} className="-m-10 inline-block p-10">
        <button
          ref={refBoton}
          type="button"
          aria-label="Entrar al recorrido de lo que hacemos"
          className="group border-verde-concepto/45 bg-verde-concepto/12 focus-visible:outline-verde-concepto relative inline-flex cursor-pointer touch-none items-center justify-center rounded-full border px-10 py-[1.15rem] font-sans text-[1rem] font-medium text-white outline-none backdrop-blur-sm select-none focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ "--carga": 0 } as CSSProperties}
        >
          {/* Halo exterior que respira (CSS puro, compositor). */}
          <span
            aria-hidden="true"
            className="absolute -inset-px rounded-full motion-safe:animate-[qh-halo-respira_3.4s_ease-in-out_infinite]"
            style={{
              boxShadow:
                "0 0 24px 2px color-mix(in srgb, var(--color-verde-concepto) 50%, transparent)",
            }}
          />
          {/* Halo + borde encendidos por la carga. */}
          <span
            aria-hidden="true"
            className="border-verde-concepto absolute -inset-px rounded-full border"
            style={{
              opacity: "var(--carga, 0)",
              boxShadow:
                "0 0 46px 12px color-mix(in srgb, var(--color-verde-concepto) 65%, transparent), inset 0 0 34px color-mix(in srgb, var(--color-verde-concepto) 40%, transparent)",
            }}
          />
          {/* Glow interno: brasita en reposo, llena la cápsula al cargar. */}
          <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-full">
            <span
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(85% 95% at 50% 108%, color-mix(in srgb, var(--color-verde-concepto) 55%, transparent), transparent 75%)",
                opacity: "calc(0.35 + var(--carga, 0) * 0.65)",
              }}
            />
            <span
              className="bg-verde-concepto/45 absolute inset-0"
              style={{ opacity: "var(--carga, 0)" }}
            />
          </span>
          {/* Contenido: letras sueltas para la olita + flecha que aparece
              en hover. El aria-label del botón lee por todos. */}
          <span ref={refInner} aria-hidden="true" className="relative flex items-center">
            {"Entrá al recorrido".split("").map((ch, i) => (
              <span key={i} data-qh-letra className="inline-block whitespace-pre">
                {ch}
              </span>
            ))}
            <span className="inline-block w-0 -translate-x-1 opacity-0 transition-all duration-300 ease-out group-hover:w-[1.1em] group-hover:translate-x-1 group-hover:opacity-100">
              ↓
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
