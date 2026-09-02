import Link from "next/link";

/**
 * Taxonomía de 6 líneas del doc maestro (SÍNTESIS — nombres oficiales en
 * VALIDAR con ED antes del lanzamiento).
 */
const LINEAS = [
  {
    nombre: "Empoderamiento y desarrollo profesional docente",
    pregunta:
      "¿Cómo se transforma la relación de las y los docentes con el saber y qué condiciones fortalecen su autonomía y capacidad de acción?",
  },
  {
    nombre:
      "Socioepistemología y construcción social del conocimiento matemático",
    pregunta:
      "¿Cómo se construye, usa y resignifica el conocimiento matemático en prácticas sociales y contextos educativos?",
  },
  {
    nombre: "Discurso y problematización de la matemática escolar",
    pregunta:
      "¿Qué formas de presentar la matemática se han naturalizado y cómo pueden revisarse para ampliar sentidos, estrategias y posibilidades de aprendizaje?",
  },
  {
    nombre: "Desarrollo y funcionalidad del pensamiento matemático",
    pregunta:
      "¿Cómo pueden los contenidos escolares convertirse en herramientas para decidir, argumentar, interpretar información y actuar en el mundo?",
  },
  {
    nombre: "Escenarios, currículum y recursos para el aprendizaje",
    pregunta:
      "¿Qué condiciones, tareas, currículas y materiales habilitan participación, múltiples estrategias, debate y construcción de sentido?",
  },
  {
    nombre: "Evidencia, evaluación y mejora educativa",
    pregunta:
      "¿Qué evidencias permiten comprender una intervención, interpretar sus efectos y tomar mejores decisiones sin reducir el aprendizaje a una cifra?",
  },
] as const;

/**
 * Sección 3 — Líneas de investigación (`#lineas`). Copy según
 * docs/content/arquitectura-investigacion.md §5.
 */
export function LineasInvestigacion() {
  return (
    <section id="lineas" aria-label="Líneas de investigación">
      <div className="mx-auto max-w-screen-xl px-8 py-20">
        <p className="text-small uppercase tracking-wider">
          Líneas de investigación
        </p>
        <h2 className="mt-2 font-display text-h2 font-bold">
          Qué estudiamos y qué buscamos comprender.
        </h2>
        <p className="mt-6 max-w-3xl text-body">
          Estas líneas no describen servicios: describen preguntas. Son los
          grandes temas que investigamos y los que sostienen, por debajo,
          cada intervención que diseñamos y acompañamos.
        </p>
        <ol className="mt-10 max-w-3xl space-y-8">
          {LINEAS.map((linea, index) => (
            <li key={linea.nombre}>
              <h3 className="font-display text-h3 font-medium">
                {String(index + 1).padStart(2, "0")} · {linea.nombre}
              </h3>
              <p className="mt-2 text-body">{linea.pregunta}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10">
          <Link href="#en-accion">Mirá la investigación en acción</Link>
        </div>
      </div>
    </section>
  );
}
