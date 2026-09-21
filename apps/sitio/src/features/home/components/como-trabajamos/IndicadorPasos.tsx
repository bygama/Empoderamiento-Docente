/**
 * Indicador de pasos — eje vertical (centro en desktop, margen izquierdo
 * compacto en mobile). Funciona igual con la alternancia: siempre queda entre
 * la foto y el texto. En celular la foto va arriba y el texto abajo, así que
 * el eje se acuesta: la misma columna, girada, queda en fila sobre
 * `--metodo-linea` (la bisagra entre las dos mitades, ver `ComoTrabajamos`). Se
 * gira el contenedor y no cada punto para que la coreografía, que anima el
 * alto de cada `[data-nav-dot]`, sirva igual para los dos sentidos.
 */
export function IndicadorPasos({ pasos }: { pasos: ReadonlyArray<{ n: string }> }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center pt-(--metodo-linea) md:items-center md:pt-0">
      <div className="relative flex -translate-y-1/2 -rotate-90 flex-col items-center gap-2.5 md:translate-y-0 md:rotate-0">
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
