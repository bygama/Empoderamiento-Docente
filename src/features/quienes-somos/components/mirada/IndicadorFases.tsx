/**
 * Indicador de progreso: mapa · 01 · 02 · 03 · síntesis. Los puntos los
 * anima `crearIndicador` desde el `onUpdate` del timeline.
 */
export function IndicadorFases({ live }: { live: boolean }) {
  return (
    <div
      className={
        "absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 motion-reduce:hidden" +
        (live ? "" : " hidden")
      }
      aria-hidden="true"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} data-mirada-dot className="bg-azul-principal/18 h-2 w-2 rounded-full" />
      ))}
    </div>
  );
}
