/**
 * Titular y bajada del hero (referencia Ink): titular blanco con
 * «transformamos.» teñido de celeste y subrayado verde (el marcador de
 * concepto en versión subrayado). La entrada los mueve por data-attributes.
 *
 * La bajada se acortó el 2026-09-09 para que entre en DOS renglones y no en
 * tres o cuatro: salieron «pensados para cada contexto y sostenidos en
 * investigación», que la página ya dice —el chip de Investigación está
 * justo debajo y la frase del cartel va en la escena del faro—. Queda el
 * mensaje pilar entero («Generar escenarios de aprendizaje», AGENTS §5.5) y
 * la relación con la matemática escolar, que es lo que ED transforma. El
 * El corte lo hace el ancho, NO `text-balance`: medido a 1536px, con balance
 * los renglones salen 388 y 456 —el de abajo más ancho que el de arriba, una
 * V— y sin él salen 602 y 242, que es el diamante que se pidió. Por eso el
 * `max-w` bajó de 56ch a 52ch: es lo que fija dónde cae el corte.
 */
export function TitularQH() {
  return (
    <>
      <h1
        className="font-display font-extrabold tracking-[-0.03em] text-white [text-shadow:0_2px_30px_rgb(15_21_40/0.55)]"
        style={{ fontSize: "clamp(2.75rem, 1.1rem + 7vw, 6.25rem)", lineHeight: 1.04 }}
      >
        <span className="sr-only">Generamos y transformamos.</span>
        <span aria-hidden="true" className="block overflow-hidden pb-[0.08em]">
          <span data-qh-word className="block">
            Generamos y
          </span>
        </span>
        <span aria-hidden="true" className="block overflow-hidden pb-[0.14em]">
          <span data-qh-word className="block">
            {/* Marcador verde de la marca, en versión subrayado (ref Ink):
                se dibuja de izquierda a derecha en la entrada, y a la vez
                una copia en azul-claro (el celeste de la paleta, §1) se
                revela con clip-path DESDE LA DERECHA — barrido cruzado:
                el subrayado va y el color viene. Sin motion: celeste
                directo (el clip solo lo setea GSAP). */}
            <span className="relative inline-block">
              transformamos.
              <span aria-hidden="true" data-qh-pintura className="text-azul-claro absolute inset-0">
                transformamos.
              </span>
              <span
                data-qh-underline
                className="bg-verde-concepto absolute right-[0.04em] -bottom-[0.04em] left-[0.02em] h-[0.045em] origin-left rounded-full"
              />
            </span>
          </span>
        </span>
      </h1>

      <p
        data-qh-rise
        className="mt-6 max-w-[52ch] font-sans text-[1.05rem] leading-relaxed text-white/85 md:text-[1.2rem]"
      >
        Generamos escenarios de aprendizaje que transforman la relación con
        la matemática escolar.
      </p>
    </>
  );
}
