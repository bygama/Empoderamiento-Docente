import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { ButtonSecondary } from "@/components/ui/ButtonSecondary";

/**
 * Contenido CENTRADO en el primer viewport (se va con el scroll): halo de
 * legibilidad, titular palabra por palabra, descripción y acciones. Todo
 * entra por data-attributes desde la coreografía del hero.
 */
export function HeroCopy() {
  return (
    <div
      data-hero-copy-scroll
      className="absolute inset-x-0 top-0 z-20 flex h-screen flex-col items-center justify-center px-5 text-center md:px-10"
    >
      {/* Halo blanco suave detrás del texto central (solo desktop ≥ lg). En
          desktop angosto el scatter se acerca al copy; este velo difumina SOLO
          las fotos que quedan detrás de las palabras (las de los costados se
          ven igual) y deja el texto flotando limpio sin reubicar las cards.
          Vive dentro del copy → se desvanece con el scroll junto al texto. En
          mobile el scatter va en bandas que no tocan el centro → no se monta. */}
      <span
        data-hero-halo
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 hidden h-[clamp(26rem,80vh,36rem)] w-[clamp(30rem,62vw,52rem)] -translate-x-1/2 -translate-y-[45%] lg:block"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, #ffffff 0%, rgba(255,255,255,0.9) 46%, rgba(255,255,255,0) 78%)",
        }}
      />
      <div data-hero-copy className="mx-auto max-w-2xl translate-y-[5vh]">
        <h1
          data-hero-headline
          className="font-display font-bold text-balance tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.85rem, 1rem + 2.4vw, 2.7rem)", lineHeight: 1.12 }}
        >
          <span data-hero-word className="inline-block">La</span>{" "}
          <span data-hero-word className="inline-block">transformación</span>{" "}
          <span data-hero-word className="inline-block">educativa</span>{" "}
          <span data-hero-word className="inline-block">comienza</span>{" "}
          <span data-hero-word className="inline-block">en</span>{" "}
          <span data-hero-word className="inline-block">las</span>{" "}
          <span
            data-hero-word
            data-hero-accent
            className="text-verde-concepto inline-block"
          >
            matemáticas.
          </span>
        </h1>

        <p
          data-hero-desc
          className="text-gris-texto mx-auto mt-6 max-w-[40rem] text-balance font-sans text-[1.02rem] leading-relaxed md:text-[1.12rem]"
        >
          Escuchamos cada realidad y diseñamos soluciones educativas a medida,
          con base en la investigación y más de 15 años de experiencia.
        </p>

        <div
          data-hero-actions
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <ButtonPrimary href="/contacto">Contactanos</ButtonPrimary>
          <ButtonSecondary href="/que-hacemos">Qué hacemos</ButtonSecondary>
        </div>
      </div>
    </div>
  );
}
