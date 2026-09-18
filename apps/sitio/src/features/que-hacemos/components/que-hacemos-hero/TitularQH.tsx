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
 *
 * «cotidiana» se sumó después, para levantar el renglón de abajo de 242 a
 * 330 sin perder el escalón. Va del lado de «la relación» a propósito, para
 * no tocar la frase pilar.
 *
 * «situados» se sumó en un segundo paso y SÍ parte la frase pilar
 * («escenarios de aprendizaje situados»). MESSAGING §5 manda usarla literal
 * y no parafrasearla sin chequear con Daniela: el owner eligió esta opción
 * sabiéndolo, con las tres candidatas medidas a la vista, porque devuelve en
 * una palabra el contexto que se había perdido al acortar («pensados para
 * cada contexto»). Queda anotado acá para que se pueda revisar con ED; si
 * Daniela lo objeta, la palabra sale y la frase vuelve a quedar entera.
 *
 * «hoy» cerró la serie. Se eligió sobre «ya» porque dice que pasa ahora sin
 * prometer resultado entregado, que es el riesgo que marca MESSAGING §6
 * («basada en evidencia, sin afirmaciones grandilocuentes»).
 *
 * «de docentes» cerró la serie: nombra de quién es la relación que ED
 * transforma, que hasta acá no estaba. Va SIN artículo a propósito. Así
 * «docentes» es epiceno y no marca género, que es lo que pide AGENTS §5.1;
 * «los docentes» sí sería masculino genérico y está prohibido. Lo que no
 * hace es desdoblar («de las y los docentes»), que es lo que prefiere la
 * tabla de léxico de MESSAGING §6: son cinco palabras y no entraban.
 *
 * DÓNDE QUEDÓ LA FORMA. La bajada arrancó en 152 caracteres, se acortó a 89
 * para conseguir los dos renglones y volvió a 125 sumando de a una palabra.
 * En desktop siguen siendo dos renglones, pero el escalón se fue achatando
 * en cada paso: 602/242 → 602/330 → 607/407 → 625/428 → 625/546. De 360px
 * de diferencia a 79. En 390px son CUATRO renglones, que es lo que se había
 * pedido evitar: con 125 caracteres en una caja de 335px no entran en menos.
 * Si hace falta mover algo, cambiar palabras por otras, no sumarlas.
 *
 * De ahí `text-pretty`, y no `text-balance`. En 390px el corte natural dejaba
 * el último renglón en 62px —una palabra huérfana—; con `pretty` pasa a 159.
 * En desktop no cambia nada: medido, `wrap` y `pretty` dan los mismos 625/546.
 * `balance` sigue descartado por lo de arriba: empareja los renglones y mata
 * el escalón.
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
        className="mt-6 max-w-[52ch] font-sans text-[1.05rem] leading-relaxed text-pretty text-white/85 md:text-[1.2rem]"
      >
        Generamos escenarios de aprendizaje situados que transforman hoy la
        relación cotidiana de docentes con la matemática escolar.
      </p>
    </>
  );
}
