const ETAPAS = [
  {
    nombre: "Fase experiencial",
    texto:
      "Las y los participantes viven situaciones que permiten cuestionar sentidos, explorar estrategias y problematizar la matemática escolar desde su propia experiencia.",
    destacado:
      "«Vivir para hacer vivir»: para diseñar nuevos escenarios, el cuerpo docente necesita experimentar otra relación con la matemática.",
  },
  {
    nombre: "Implementación en contexto",
    texto:
      "Las propuestas se interpretan y se llevan a aulas, instituciones o programas reales. No se reproducen mecánicamente: se contextualizan desde el conocimiento profesional de quienes las implementan.",
  },
  {
    nombre: "Práctica reflexiva",
    texto:
      "Se analiza lo ocurrido, se intercambian experiencias, se confrontan decisiones y se observan las respuestas, estrategias y argumentos que produjo la situación.",
  },
  {
    nombre: "Resignificación del conocimiento matemático escolar",
    texto:
      "La experiencia permite revisar sentidos, usos y formas de participación. El conocimiento deja de ser solo un contenido a transmitir: se convierte en una herramienta para comprender y actuar.",
  },
] as const;

/**
 * Sección 4 — Ciclo de investigación aplicada (`#ciclo`): el ciclo
 * pedagógico. Copy según docs/content/arquitectura-investigacion.md §6.
 */
export function CicloInvestigacionAplicada() {
  return (
    <section id="ciclo" aria-label="Ciclo de investigación aplicada">
      <div className="mx-auto max-w-screen-xl px-8 py-20">
        <p className="text-small uppercase tracking-wider">
          Ciclo de investigación aplicada
        </p>
        <h2 className="mt-2 font-display text-h2 font-bold">
          Cómo una experiencia se convierte en transformación.
        </h2>
        <ol className="mt-10 max-w-3xl space-y-8">
          {ETAPAS.map((etapa, index) => (
            <li key={etapa.nombre}>
              <h3 className="font-display text-h3 font-medium">
                {String(index + 1).padStart(2, "0")} · {etapa.nombre}
              </h3>
              <p className="mt-2 text-body">{etapa.texto}</p>
              {"destacado" in etapa ? (
                <p className="mt-2 text-body font-medium">{etapa.destacado}</p>
              ) : null}
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-3xl text-body">
          La cuarta etapa no cierra el ciclo: abre nuevas preguntas. Por eso
          volvemos a investigar.
        </p>
      </div>
    </section>
  );
}
