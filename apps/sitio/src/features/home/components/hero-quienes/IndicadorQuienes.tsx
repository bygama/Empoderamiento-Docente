/**
 * Indicador horizontal de progreso (Quiénes somos → Misión). Versión
 * HORIZONTAL del indicador vertical de "Cómo trabajamos": misma línea fina
 * conectora + cápsula naranja activa alargada + punto gris inactivo (mismos
 * grosor, colores y lenguaje). La cápsula activa pasa de QS a Misión con el
 * barrido (`progreso-quienes.ts`). Decorativo y oculto en reduced-motion;
 * centrado, sin pegarse al borde.
 */
export function IndicadorQuienes() {
  return (
    <div
      data-qs-progress
      aria-hidden="true"
      className="pointer-events-none absolute bottom-8 left-1/2 z-40 -translate-x-1/2 opacity-0 motion-reduce:hidden md:bottom-12"
    >
      <div className="relative flex flex-row items-center gap-2.5">
        {/* Línea fina conectora — igual que en el indicador vertical. */}
        <span
          aria-hidden="true"
          className="bg-azul-principal/10 absolute top-1/2 right-1 left-1 h-px -translate-y-1/2"
        />
        {/* Tramo "Quiénes somos" — cápsula activa que crece con la
            lectura (arranca como punto y se alarga a 36px). */}
        <span
          data-qs-seg="0"
          className="relative h-1.5 rounded-full"
          style={{
            width: 8,
            backgroundColor: "var(--color-naranja-accion)",
            transition: "none",
          }}
        />
        {/* Tramo "Misión" — punto inactivo hasta el barrido. */}
        <span
          data-qs-seg="1"
          className="relative h-1.5 rounded-full"
          style={{
            width: 8,
            backgroundColor: "rgb(31 45 77 / 0.18)",
            transition: "none",
          }}
        />
      </div>
    </div>
  );
}
