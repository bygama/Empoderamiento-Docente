import { Eyebrow } from "@/components/ui/Eyebrow";
import { CtaButton } from "@/components/ui/CtaButton";
import { MathField } from "@/components/ui/MathField";
import { CTA_LINK } from "@/config/nav";

/**
 * Forma parte de ED — cierre de conversión de la Home (sitemap §7
 * "CONVERSIÓN · Cierre orientado a la participación", entre Biblioteca +
 * Novedades y el Footer).
 *
 * Es un cierre, no una sección más: banda corta, centrada, que recoge el
 * recorrido y lo orienta a la acción (→ Contacto). Articula con la página por
 * tres lados:
 *
 *  - Hacia arriba: el nodo verde de apertura es eco del nodo del divisor de
 *    Biblioteca y Novedades (la red de marca que vuelve a aparecer).
 *  - Con el Hero: la constelación reaparece como bookend — la misma "red de
 *    nodos" del inicio, ahora reaccionando al cursor (participar = sumarse a
 *    la red). La matemática se dice con la red, nunca con números o símbolos.
 *  - Hacia abajo: el fondo decanta a `gris-fondo` para que el Footer navy se
 *    levante limpio con sus esquinas redondeadas (sin costura).
 *
 * Sin reveal de scroll (igual que Biblioteca y Novedades): el contenido está
 * siempre presente, así no hay "pop" janky al bajar hacia el footer. La vida
 * está en la constelación y en el hover magnético del CTA. Server component:
 * solo los hijos interactivos (constelación + CTA) hidratan.
 */
export function FormaParteED() {
  return (
    <section
      data-section="forma-parte"
      aria-labelledby="forma-parte-title"
      className="bg-grain-light relative overflow-hidden bg-gradient-to-b from-white to-gris-fondo py-24 md:py-32"
    >
      {/* Constelación de la comunidad docente — eco del Hero, reactiva al
          cursor. La máscara radial la deja florecer en los bordes y la apaga
          detrás del texto para no competir con la lectura. Decorativa. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-45 [mask-image:radial-gradient(125%_100%_at_50%_50%,transparent_0%,transparent_34%,#000_80%)]"
      >
        <MathField className="block h-full w-full" />
      </div>

      {/* Halo verde concepto detrás del título (faro / red). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgb(31 154 120 / 0.12) 0%, transparent 62%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-5 text-center md:px-10">
        {/* Nodo de apertura — eco del nodo del divisor de Biblioteca y
            Novedades (la red de marca vuelve a anudar el cierre). */}
        <span
          aria-hidden="true"
          className="bg-verde-concepto mb-8 block h-2.5 w-2.5 rounded-full shadow-[0_0_0_0.45rem_rgb(31_154_120/0.14)]"
        />

        <Eyebrow>Forma parte de ED</Eyebrow>

        <h2
          id="forma-parte-title"
          className="font-display text-azul-principal mt-6 font-bold tracking-[-0.022em]"
          style={{ fontSize: "clamp(2.05rem, 5.2vw, 4rem)", lineHeight: 1.04 }}
        >
          Hagamos comunidad en torno a{" "}
          <span className="text-verde-concepto">la matemática</span>.
        </h2>

        <p className="text-gris-texto mt-6 max-w-xl font-sans text-[1.02rem] leading-relaxed md:text-[1.08rem]">
          Cada propuesta empieza con una conversación. Pensemos, juntas y
          juntos, un recorrido a la medida de tu institución o tu equipo.
        </p>

        <div className="mt-10">
          <CtaButton href={CTA_LINK.href} label="Conversemos" size="lg" />
        </div>
      </div>
    </section>
  );
}
