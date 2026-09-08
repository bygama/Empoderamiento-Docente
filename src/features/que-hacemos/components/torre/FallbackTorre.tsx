import { TAMBORES } from "../../data";

/**
 * Fallback plano: todas las estaciones apiladas. Es lo que se sirve en
 * mobile, con touch o con reduced-motion — la torre necesita ancho para que
 * el título envuelto se lea.
 */
export function FallbackTorre() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-5 pb-20 md:px-10">
      {TAMBORES.map((t, i) => (
        <article key={t.id} className="border-azul-principal/10 border-t py-12 first:border-t-0">
          <p className="text-gris-texto font-mono text-[0.7rem] tracking-[0.14em] uppercase">
            {String(i + 1).padStart(2, "0")} / {String(TAMBORES.length).padStart(2, "0")}
          </p>
          <h3
            className="font-display text-azul-principal mt-3 font-extrabold tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.9rem, 1rem + 4vw, 3.2rem)", lineHeight: 1.05 }}
          >
            {t.titulo}
          </h3>
          <p className="text-verde-concepto-texto font-display mt-4 max-w-[28ch] text-[1.15rem] leading-snug font-bold">
            {t.frase}
          </p>
          <p className="text-gris-texto mt-3 max-w-[56ch] font-sans text-[0.98rem] leading-relaxed">
            {t.detalle}
          </p>
        </article>
      ))}
    </div>
  );
}
