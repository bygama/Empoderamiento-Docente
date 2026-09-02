const FUNDAMENTOS = [
  {
    titulo: "Socioepistemología",
    texto:
      "Una mirada que comprende el conocimiento matemático como una construcción social: estudia cómo adquiere sentido en contextos, usos, decisiones e interacciones concretas, en lugar de separarlo de las personas y de sus prácticas.",
  },
  {
    titulo: "Problematización de la matemática escolar",
    texto:
      "Revisar lo que suele darse por sentado: por qué se enseña un contenido de determinada manera, qué sentido tiene una tarea, qué estrategias habilita, qué argumentos produce y cómo se relaciona con la vida de quienes aprenden.",
  },
  {
    titulo: "Empoderamiento docente desde el saber",
    texto:
      "Un proceso progresivo y colectivo: las y los docentes fortalecen su autonomía, cuestionan prácticas naturalizadas, toman decisiones con fundamento y reconocen su capacidad de transformar desde el conocimiento.",
    aclaracion:
      "No es poder sobre estudiantes ni sobre otras personas: es poder sobre la propia práctica.",
  },
  {
    titulo: "Desarrollo del pensamiento matemático",
    texto:
      "Construir una forma de analizar y actuar: buscar estrategias, formular hipótesis, argumentar, anticipar, decidir y comprender información. Los contenidos escolares funcionan como herramientas, no como un fin aislado.",
  },
] as const;

/**
 * Sección 2 — Por qué investigamos (`#sentido`). Copy según
 * docs/content/arquitectura-investigacion.md §4. Las definiciones de los
 * cuatro fundamentos son el texto canónico de estos conceptos en el sitio.
 */
export function PorQueInvestigamos() {
  return (
    <section id="sentido" aria-label="Por qué investigamos">
      <div className="mx-auto max-w-screen-xl px-8 py-20">
        <p className="text-small uppercase tracking-wider">
          Por qué investigamos
        </p>
        <h2 className="mt-2 font-display text-h2 font-bold">
          Nacimos de una pregunta.
        </h2>
        <p className="mt-6 max-w-3xl text-body">
          Empoderamiento Docente nació de una pregunta: ¿qué sucede cuando
          las y los docentes transforman su relación con el saber matemático
          escolar y reconocen su capacidad de intervenir en la realidad? Esa
          pregunta creció mediante investigación, trabajo con comunidades
          docentes e intervenciones sostenidas. Hoy sigue orientando una
          forma de actuar en la que conocer y transformar son parte del mismo
          proceso.
        </p>
        <blockquote className="mt-8 max-w-3xl text-body">
          No investigamos para observar la escuela desde afuera. Investigamos
          con los contextos educativos para comprender lo que ocurre,
          construir alternativas y aprender de su implementación.
        </blockquote>
        <ul className="mt-10 grid gap-8 md:grid-cols-2">
          {FUNDAMENTOS.map((fundamento) => (
            <li key={fundamento.titulo}>
              <h3 className="font-display text-h3 font-medium">
                {fundamento.titulo}
              </h3>
              <p className="mt-2 text-body">{fundamento.texto}</p>
              {"aclaracion" in fundamento ? (
                <p className="mt-2 text-body font-medium">
                  {fundamento.aclaracion}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-3xl text-body">
          Género, inclusión, derechos humanos, ciudadanía y justicia social
          atraviesan nuestras preguntas, nuestros materiales y nuestras
          relaciones educativas. No son un capítulo aparte: son criterios con
          los que investigamos.
        </p>
      </div>
    </section>
  );
}
