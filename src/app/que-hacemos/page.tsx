import type { Metadata } from "next";
import { QueHacemosHeroFaro } from "@/features/que-hacemos/components/QueHacemosHeroFaro";

export const metadata: Metadata = {
  title: "Qué hacemos",
  description:
    "Diseñamos y acompañamos intervenciones educativas situadas: desarrollo profesional docente, currículum, evaluación, materiales e investigación aplicada.",
};

/**
 * Página «Qué hacemos» en ESTA rama: solo el hero del faro (experimento en
 * curso). Las 7 secciones de contenido viven en la rama de contenido maestro
 * (claude/contenido-maestro-que-hacemos-e9d744) y se integran al fusionar.
 * El bloque claro de abajo existe para ensayar la costura del amanecer
 * (escena 5) contra un fondo gris-fondo real.
 */
export default function QueHacemosPage() {
  return (
    <main>
      <QueHacemosHeroFaro />
      <section id="lineas" className="bg-gris-fondo flex min-h-[60vh] scroll-mt-28 items-center justify-center px-5">
        <p className="text-gris-texto max-w-md text-center font-sans text-sm">
          [Placeholder] Acá continúan las siete secciones de contenido, que se
          integran desde la rama de contenido maestro al fusionar.
        </p>
      </section>
    </main>
  );
}
