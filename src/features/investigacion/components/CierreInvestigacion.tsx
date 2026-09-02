import Link from "next/link";

/**
 * Sección 8 — Cierre. Copy según docs/content/arquitectura-investigacion.md §10.
 */
export function CierreInvestigacion() {
  return (
    <section aria-label="Cierre e invitación a conversar">
      <div className="mx-auto max-w-screen-xl px-8 py-20">
        <h2 className="font-display text-h2 font-bold">
          Investigar permite hacer mejores preguntas.
        </h2>
        <p className="mt-6 max-w-3xl text-body">
          Investigar permite hacer mejores preguntas, diseñar con fundamento
          y aprender de cada experiencia. Si tu institución, red o equipo
          necesita comprender y transformar un desafío educativo, podemos
          construir el proceso de manera situada y colaborativa.
        </p>
        <div className="mt-8">
          <Link href="/contacto">Conversemos</Link>
        </div>
      </div>
    </section>
  );
}
