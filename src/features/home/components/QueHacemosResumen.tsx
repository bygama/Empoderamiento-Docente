import Link from "next/link";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ArrowUpRight } from "@/components/ui/icons";
import { AREAS, DESCRIPTOR } from "@/features/que-hacemos/areas";

/**
 * Qué hace ED, dicho en la home apenas termina el hero y sin animación: la
 * frase del cartel oficial y las seis áreas como tarjetas que llevan a su
 * bloque en /que-hacemos. Reemplaza al abanico de siete líneas que estaba
 * cinco pantallas más abajo (Raquel y Daniela, 2026-09-08: la web se veía
 * espectacular pero no se entendía qué hace ED).
 */
export function QueHacemosResumen() {
  return (
    <section
      id="que-hacemos"
      data-indice="Qué hacemos"
      className="text-azul-principal scroll-mt-28 bg-white"
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
          <header>
            <Eyebrow>Qué hacemos</Eyebrow>
            <h2
              className="font-display mt-5 text-[1.9rem] font-bold tracking-[-0.02em] text-balance md:text-[2.5rem]"
              style={{ lineHeight: 1.1 }}
            >
              {DESCRIPTOR}
            </h2>
            <p className="text-gris-texto mt-5 max-w-[48ch] font-sans text-[1.05rem] leading-relaxed">
              Investigamos, diseñamos e implementamos soluciones para la
              transformación educativa en Matemáticas, en seis áreas. No
              capacitamos docentes: transformamos la relación con las
              matemáticas.
            </p>
            <div className="mt-8">
              <ButtonPrimary href="/que-hacemos">Ver cómo trabajamos</ButtonPrimary>
            </div>
          </header>

          <ol className="grid gap-3 sm:grid-cols-2">
            {AREAS.map((a, i) => (
              <li key={a.id}>
                <Link
                  href={`/que-hacemos#area-${a.id}`}
                  className="group border-azul-principal/10 hover:border-azul-principal/40 focus-visible:outline-verde-concepto flex h-full flex-col rounded-[1.25rem] border p-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 md:p-6"
                >
                  <span className="text-gris-texto font-mono text-[0.72rem] tracking-[0.18em]">
                    0{i + 1}
                  </span>
                  <span className="font-display mt-2 flex items-start justify-between gap-3 text-[1.15rem] leading-snug font-bold">
                    {a.nombre}
                    <ArrowUpRight
                      size={16}
                      className="text-verde-concepto-texto mt-1 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                  <span className="text-verde-concepto-texto mt-2 font-sans text-[0.9rem] font-medium">
                    {a.idea}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
