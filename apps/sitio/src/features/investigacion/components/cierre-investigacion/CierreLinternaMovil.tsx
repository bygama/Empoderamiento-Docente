import { LinternaFaro } from "../LinternaFaro";

/**
 * Pose del haz en el frame estático (movimiento reducido): a la izquierda y
 * apenas arriba, sobre el segundo mensaje. La coreografía la anula.
 */
const HAZ_QUIETO = -155;

/**
 * El faro y sus dos nubes bajo `lg`: el faro llega ya ENCENDIDO (es la
 * LinternaFaro estática, igual que en el hero chico) y sube desde el piso;
 * el haz gira de costado hacia cada mensaje. La coreografía
 * (coreografia-cierre-movil.ts) escribe sobre estos mismos data-attributes,
 * escritos de acá: separado de CierreInvestigacion.tsx para no seguir
 * sumando líneas a un componente que ya pasa el tope de 200 (§6 AGENTS.md).
 *
 * El faro es una silueta en la esquina inferior derecha, alineada al margen
 * de la grilla (`right-6`/`md:right-12`, como su `px`): la torre sigue por
 * debajo del cuadro (38 % de su alto, recortado por el `overflow` de la
 * sección) y en pantalla quedan la linterna y el arranque del fuste. Su
 * ancho es `--faro-movil`, el mismo que le descuenta la columna de los
 * mensajes para no pisarlo.
 */
export function CierreLinternaMovil() {
  return (
    <>
      {/* Dos nubes que se abren cuando el faro sube (el mismo gesto que el
          marco/las nubes de escritorio, en miniatura). Sin blur: re-rasteriza
          al animar y es costoso. */}
      <span
        aria-hidden="true"
        data-cierre-nube-movil
        className="pointer-events-none absolute -left-[20%] top-[30%] z-20 h-[18lvh] w-[70vw] rounded-full lg:hidden"
        style={{ background: "radial-gradient(closest-side, rgb(255 255 255 / 0.18), transparent)" }}
      />
      <span
        aria-hidden="true"
        data-cierre-nube-movil
        className="pointer-events-none absolute -right-[20%] top-[45%] z-20 h-[18lvh] w-[70vw] rounded-full lg:hidden"
        style={{ background: "radial-gradient(closest-side, rgb(255 255 255 / 0.18), transparent)" }}
      />

      <div
        data-cierre-linterna-movil
        className="pointer-events-none absolute right-6 bottom-[var(--footer-radio)] z-30 md:right-12 lg:hidden"
      >
        <div className="w-[var(--faro-movil)] translate-y-[38%]">
          <LinternaFaro prefijo="cierre-movil" hazPose={HAZ_QUIETO} className="block h-auto w-full" />
        </div>
      </div>
    </>
  );
}
