import { PROYECTOS_INTRO, TIPOS_APLICACION } from "@/features/que-hacemos/proyectos";

/**
 * Proyectos y aplicaciones: la prueba de Qué hacemos, en texto plano
 * (sitemap §6, «Líneas aplicadas en proyectos reales»). Tres tipos de
 * aplicación y, dentro de cada uno, los proyectos reales que lo muestran,
 * con quién, cuándo y a qué escala. Misma regla que Áreas: nada detrás de
 * una animación. Va justo antes del cierre, así la página argumenta en
 * orden: qué hacemos → dónde → cómo → así se ve → hablemos.
 */
export function ProyectosAplicaciones() {
  return (
    <section
      id="proyectos"
      data-indice="Proyectos"
      className="bg-gris-fondo text-azul-principal scroll-mt-28"
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-28">
        <header className="max-w-[62ch]">
          <p className="text-gris-texto font-sans text-[0.78rem] font-medium tracking-[0.22em] uppercase">
            {PROYECTOS_INTRO.volanta}
          </p>
          <h2
            className="font-display mt-4 text-[2rem] font-bold tracking-[-0.02em] text-balance md:text-[2.75rem]"
            style={{ lineHeight: 1.1 }}
          >
            {PROYECTOS_INTRO.titulo}
          </h2>
          <p className="text-gris-texto mt-5 font-sans text-[1.05rem] leading-relaxed md:text-[1.15rem]">
            {PROYECTOS_INTRO.texto}
          </p>
        </header>

        <div className="mt-12 space-y-5 md:mt-16">
          {TIPOS_APLICACION.map((tipo, i) => (
            <article
              key={tipo.id}
              className="border-azul-principal/8 rounded-[1.25rem] border bg-white p-6 md:p-8 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-14"
            >
              <div>
                <p className="text-gris-texto font-mono text-[0.75rem] tracking-[0.18em]">
                  0{i + 1}
                </p>
                <h3 className="font-display mt-2 text-[1.45rem] font-bold tracking-[-0.01em] text-balance">
                  {tipo.nombre}
                </h3>
                <p className="text-azul-principal/80 mt-3 font-sans text-[0.95rem] leading-relaxed">
                  {tipo.texto}
                </p>
              </div>

              <ul className="divide-azul-principal/8 mt-8 divide-y lg:mt-0">
                {tipo.proyectos.map((p) => (
                  <li key={p.nombre} className="py-5 first:pt-0 last:pb-0">
                    <p className="text-verde-concepto-texto font-mono text-[0.75rem] tracking-[0.08em]">
                      {p.con}
                      {p.cuando ? ` · ${p.cuando}` : ""}
                    </p>
                    <h4 className="font-display mt-1.5 text-[1.08rem] leading-snug font-bold">
                      {p.nombre}
                    </h4>
                    <p className="text-azul-principal/80 mt-1.5 font-sans text-[0.95rem] leading-relaxed">
                      {p.que}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
