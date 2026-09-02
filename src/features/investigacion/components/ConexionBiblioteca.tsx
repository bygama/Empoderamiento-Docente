import Link from "next/link";

/**
 * Tres referencias representativas (SÍNTESIS — selección y datos
 * bibliográficos en VALIDAR con ED). El catálogo completo vive en Biblioteca.
 */
const REFERENCIAS = [
  {
    cita: "Reyes-Gasperini (2016)",
    titulo:
      "Empoderamiento docente y Socioepistemología. Un estudio sobre la transformación educativa en Matemáticas",
    tipo: "Libro",
  },
  {
    cita: "Báez, Flores y Reyes-Gasperini (2025)",
    titulo:
      "Problematizar la matemática escolar: ¿cómo contribuye al desarrollo profesional docente?",
    tipo: "Artículo",
  },
  {
    cita: "Cantoral, Montiel y Reyes-Gasperini (2014)",
    titulo:
      "Hacia una educación que promueva el desarrollo del pensamiento matemático",
    tipo: "Artículo",
  },
] as const;

/**
 * Sección 7 — Conexión con Biblioteca (`#biblioteca`). Copy según
 * docs/content/arquitectura-investigacion.md §9.
 */
export function ConexionBiblioteca() {
  return (
    <section id="biblioteca" aria-label="Conexión con Biblioteca">
      <div className="mx-auto max-w-screen-xl px-8 py-20">
        <p className="text-small uppercase tracking-wider">
          Producción académica
        </p>
        <h2 className="mt-2 font-display text-h2 font-bold">
          La investigación también se comparte.
        </h2>
        <p className="mt-6 max-w-3xl text-body">
          Libros, artículos, capítulos, recursos pedagógicos y materiales
          producidos o coordinados por el equipo se reúnen en la Biblioteca
          para poner el conocimiento en circulación. Allí pueden explorarse
          los fundamentos, desarrollos y recursos que dialogan con las líneas
          presentadas en esta página.
        </p>
        <ul className="mt-10 max-w-3xl space-y-6">
          {REFERENCIAS.map((referencia) => (
            <li key={referencia.titulo}>
              <p className="text-small">
                {referencia.tipo} · {referencia.cita}
              </p>
              <p className="mt-1 text-body font-medium">{referencia.titulo}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Link href="/biblioteca">Explorá la Biblioteca</Link>
        </div>
      </div>
    </section>
  );
}
