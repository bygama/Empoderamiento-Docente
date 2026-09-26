import { MathField } from "@/components/ui/MathField";
import { TITULO_TIPO } from "@/features/contacto/components/experiencia/estilos";
import { FormularioCV } from "./FormularioCV";

/**
 * /sumate-al-equipo: la segunda puerta de Contacto («¿Querés estar de este
 * lado?»), con su mismo lenguaje: el fondo de nodos, el titular de Contacto y
 * la grilla 2/3 del formulario, con el texto a la izquierda y el panel de
 * campos a la derecha. Es del sitio: sale de DESIGN.md §1 a §10, no del admin.
 */
export function SumateAlEquipo() {
  return (
    <section
      aria-labelledby="sumate-titulo"
      className="bg-grain-light relative isolate overflow-hidden bg-gradient-to-b from-white via-white to-gris-fondo/50"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <MathField className="h-full w-full" />
      </div>
      <div className="mx-auto w-full max-w-5xl px-5 pt-28 pb-20 md:px-10 md:pt-36 md:pb-28 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-x-12">
        <header className="mb-8 lg:mb-0 lg:pt-4">
          <h1 id="sumate-titulo" className={`${TITULO_TIPO.familia} ${TITULO_TIPO.peso} text-h1`}>
            Sumate al equipo
          </h1>
          <p className="text-gris-texto mt-5 max-w-[42ch] font-sans text-body">
            Buscamos profesionales de la educación que quieran generar escenarios de aprendizaje con nosotras y
            nosotros. Contanos quién sos y dejanos tu CV.
          </p>
        </header>
        <FormularioCV />
      </div>
    </section>
  );
}
