/**
 * Indicador de pasos — eje vertical (centro en desktop, margen izquierdo
 * compacto en mobile). Funciona igual con la alternancia: siempre queda entre
 * la foto y el texto. En celular la foto va arriba, así que el eje no se centra
 * en la pantalla: arranca donde arranca el texto (header + foto + separación,
 * las mismas medidas de `PasoMetodo`). La coreografía anima cada `[data-nav-dot]`.
 */
export function IndicadorPasos({ pasos }: { pasos: ReadonlyArray<{ n: string }> }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-start pt-[calc(var(--metodo-arriba)+var(--metodo-foto)+2.75rem)] pl-4 md:items-center md:justify-center md:pt-0 md:pl-0">
      <div className="relative flex flex-col items-center gap-2.5">
        {/* Línea fina conectora */}
        <span
          aria-hidden="true"
          className="bg-azul-principal/10 absolute top-1 bottom-1 left-1/2 w-px -translate-x-1/2"
        />
        {pasos.map((p, idx) => (
          <span
            key={p.n}
            data-nav-dot={idx}
            className="relative w-1.5 rounded-full"
            style={{
              height: idx === 0 ? 36 : 8,
              backgroundColor:
                idx === 0
                  ? "var(--color-naranja-accion)"
                  : "rgb(31 45 77 / 0.18)",
              transition: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
