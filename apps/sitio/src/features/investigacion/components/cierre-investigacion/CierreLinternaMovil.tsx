import { LinternaFaro } from "../LinternaFaro";
import { fondoNube, type Nube } from "./nubes";

/**
 * Pose del haz en el frame estático (movimiento reducido): a la izquierda y
 * apenas arriba, sobre el segundo mensaje. La coreografía la anula.
 */
const HAZ_QUIETO = -155;

/**
 * Las nubes del descenso en celular: el mismo campo que en escritorio
 * (NubesCierre.tsx), con las mismas siluetas, redibujado para un cuadro
 * VERTICAL. Los cajones de escritorio van en % del ancho y del alto: en una
 * pantalla alta y angosta las mismas nubes quedarían paradas. Acá son más
 * anchas que la pantalla y bajas. `y` más allá del 100 = esperan bajo el
 * piso y entran mientras la cámara baja; la última es la banda, que vela el
 * faro hasta que se enciende.
 */
const NUBES_MOVIL: ReadonlyArray<Nube> = [
  { x: -30, y: 52, w: 110, h: 26, cerca: 1, giro: -3, silueta: "cumuloA" },
  { x: 18, y: 68, w: 115, h: 24, cerca: 0.92, giro: 2.5, silueta: "cumuloB" },
  { x: -12, y: 20, w: 92, h: 20, cerca: 0.7, giro: -1.5, silueta: "mediana" },
  { x: 34, y: 6, w: 86, h: 18, cerca: 0.62, giro: 3.5, silueta: "mediana" },
  { x: -26, y: -2, w: 72, h: 14, cerca: 0.3, giro: -1, silueta: "jiron" },
  { x: 24, y: 38, w: 76, h: 15, cerca: 0.35, giro: 1.5, silueta: "jiron" },
  { x: 4, y: 92, w: 76, h: 14, cerca: 0.3, giro: 1, silueta: "jiron" },
  { x: 28, y: 106, w: 96, h: 19, cerca: 0.6, giro: -2.5, silueta: "mediana" },
  { x: -22, y: 126, w: 116, h: 25, cerca: 0.95, giro: 2, silueta: "cumuloA" },
  { x: 24, y: 142, w: 92, h: 19, cerca: 0.68, giro: 1.5, silueta: "mediana" },
  { x: -26, y: 160, w: 122, h: 26, cerca: 1, giro: -2, silueta: "cumuloB" },
  { x: -10, y: 176, w: 120, h: 22, cerca: 0.3, giro: -2, silueta: "banda" },
];

/**
 * El faro y las nubes del cierre bajo `lg`. La escena es la de escritorio
 * contada en vertical (coreografia-cierre-movil.ts): la hoja llega metida
 * entre nubes, la cámara baja a través de ellas y el faro sube GIRANDO
 * adentro de la última, se enciende y su haz lee los dos mensajes. Lo que
 * dibuja el SSR es el frame final —el faro en su lugar y encendido, sin
 * nubes—: es lo que ven movimiento reducido y las pantallas bajas.
 *
 * El faro va en la esquina inferior derecha, alineado al margen de la
 * grilla: la torre sigue por debajo del cuadro (38 % de su alto, recortado
 * por el `overflow` de la sección). Su ancho es `--faro-movil`, el mismo que
 * le descuenta la columna de los mensajes para no pisarlo.
 */
export function CierreLinternaMovil() {
  return (
    <>
      {/* Por encima del faro (z-30), como en escritorio: el faro sube ADENTRO
          de las nubes. Invisibles hasta que la coreografía las enciende. */}
      <div
        aria-hidden="true"
        data-cierre-nubes-movil
        className="pointer-events-none invisible absolute inset-0 z-[32] opacity-0 lg:hidden"
      >
        {NUBES_MOVIL.map((n) => (
          <span
            key={`n-${n.x}-${n.y}`}
            data-cierre-nube-movil
            data-nube-cerca={n.cerca}
            data-nube-giro={n.giro}
            className="absolute block"
            style={{ left: `${n.x}%`, top: `${n.y}%`, width: `${n.w}%`, height: `${n.h}%`, backgroundImage: fondoNube(n) }}
          />
        ))}
      </div>

      <div
        data-cierre-linterna-movil
        className="pointer-events-none absolute right-6 bottom-[var(--footer-radio)] z-30 md:right-12 lg:hidden"
      >
        <div className="w-[var(--faro-movil)] translate-y-[38%]">
          <LinternaFaro prefijo="cierre-movil" hazPose={HAZ_QUIETO} largoHaz={1420} className="block h-auto w-full" />
        </div>
      </div>
    </>
  );
}
