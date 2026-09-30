/**
 * Indicador horizontal de progreso (Quiénes somos → Misión). Versión
 * HORIZONTAL del indicador vertical de "Cómo trabajamos": misma línea fina
 * conectora + cápsula naranja activa alargada + punto gris inactivo (mismos
 * grosor, colores y lenguaje). La cápsula activa pasa de QS a Misión con el
 * barrido (`progreso-quienes.ts`). Decorativo y oculto en reduced-motion;
 * centrado, sin pegarse al borde. Bajo lg va sobre la esquina de la foto, al
 * lado de la etiqueta del capítulo, no perdido al pie de la pantalla.
 */
export function IndicadorQuienes() {
  return (
    <div
      data-qs-progress
      aria-hidden="true"
      className="pointer-events-none absolute bottom-8 left-1/2 z-40 -translate-x-1/2 opacity-0 max-lg:top-[5.95rem] max-lg:bottom-auto max-lg:left-8 max-lg:translate-x-0 motion-reduce:hidden md:bottom-12 md:max-lg:bottom-auto md:max-lg:left-[3.25rem] [@media(max-height:38.74rem)_and_(max-width:63.999rem)]:hidden!"
    >
      <div className="relative flex flex-row items-center gap-2.5 max-lg:rounded-full max-lg:bg-white/90 max-lg:px-2.5 max-lg:py-1.5 max-lg:backdrop-blur-sm">
        {/* Línea fina conectora — igual que en el indicador vertical. */}
        <span
          aria-hidden="true"
          className="bg-azul-principal/10 absolute top-1/2 right-1 left-1 h-px -translate-y-1/2 max-lg:right-3.5 max-lg:left-3.5"
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
