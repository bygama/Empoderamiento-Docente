import Link from "next/link";

const PASOS = [
  {
    nombre: "Registrar evidencias",
    texto:
      "Recuperamos producciones, decisiones, interacciones, resultados y testimonios, siempre con resguardo ético de docentes, estudiantes e instituciones.",
  },
  {
    nombre: "Analizar e interpretar",
    texto:
      "Leemos las evidencias en relación con las preguntas, el contexto y los objetivos. Una cifra aislada no explica por sí sola qué ocurrió ni por qué.",
  },
  {
    nombre: "Sistematizar y producir conocimiento",
    texto:
      "Organizamos aprendizajes, reconocemos patrones y elaboramos explicaciones: la experiencia se convierte en conocimiento que puede comunicarse, discutirse y transferirse.",
  },
  {
    nombre: "Retroalimentar y ajustar",
    texto:
      "Volvemos sobre el diseño, acompañamos nuevas decisiones y abrimos otro ciclo de investigación y acción.",
  },
] as const;

/**
 * Sección 5 — Volvemos a investigar (`#evidencia`): el ciclo de evidencia.
 * Copy según docs/content/arquitectura-investigacion.md §7.
 */
export function VolvemosInvestigar() {
  return (
    <section id="evidencia" aria-label="Volvemos a investigar">
      <div className="mx-auto max-w-screen-xl px-8 py-20">
        <p className="text-small uppercase tracking-wider">
          Volvemos a investigar
        </p>
        <h2 className="mt-2 font-display text-h2 font-bold">
          Implementar no es terminar.
        </h2>
        <p className="mt-6 max-w-3xl text-body">
          Implementar es generar una nueva oportunidad para observar,
          comprender y decidir. La evidencia vuelve al proceso: mejora la
          intervención y fortalece la capacidad de los equipos.
        </p>
        <ol className="mt-10 max-w-3xl space-y-8">
          {PASOS.map((paso, index) => (
            <li key={paso.nombre}>
              <h3 className="font-display text-h3 font-medium">
                {String(index + 1).padStart(2, "0")} · {paso.nombre}
              </h3>
              <p className="mt-2 text-body">{paso.texto}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Link href="/biblioteca">Conocé lo que publicamos</Link>
        </div>
      </div>
    </section>
  );
}
