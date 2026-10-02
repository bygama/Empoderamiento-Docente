import { FOCO_Y } from "../faro-geometria";

const AZUL_CLARO = "var(--color-azul-claro)";

/** La caja de cada cono en el dibujo (viewBox 1440×900): x, y, ancho, alto.
 *  Las dos nacen en el foco de la linterna (x 950) y van para su lado. */
const CAJA = { izq: [-360, 280, 1310, 372], der: [950, 280, 1310, 372] } as const;
const pct = (n: number, de: number) => `${((n / de) * 100).toFixed(3)}%`;

/**
 * El foco de la linterna dentro de la caja de cada cono: su pivote. Lo usan
 * las coreografías al fijar el estado inicial (antes era un `transformOrigin`
 * en píxeles del bbox del `<g>`, que solo vale adentro de un SVG).
 */
export const ORIGEN_HAZ = {
  izq: `100% ${pct(FOCO_Y - CAJA.izq[1], CAJA.izq[3])}`,
  der: `0% ${pct(FOCO_Y - CAJA.der[1], CAJA.der[3])}`,
} as const;

/** Un cono: dos envolventes con gradiente lateral y una máscara que lo apaga
 *  con la distancia (ver el porqué en `HacesFaro`). */
function Haz({ lado }: { lado: "izq" | "der" }) {
  const [x, y, ancho, alto] = CAJA[lado];
  // El extremo lejano: a la izquierda del foco en un cono, a la derecha en el otro.
  const lejos = lado === "izq" ? -360 : 2260;
  const cerca = lado === "izq" ? 946 : 954;
  return (
    <div
      data-haz={lado}
      className="absolute"
      style={{
        left: pct(x, 1440),
        top: pct(y, 900),
        width: pct(ancho, 1440),
        height: pct(alto, 900),
        transformOrigin: ORIGEN_HAZ[lado],
        opacity: lado === "der" ? 0 : undefined,
      }}
    >
      <svg viewBox={`${x} ${y} ${ancho} ${alto}`} className="h-full w-full">
        <defs>
          <linearGradient id={`qh2-haz-lat-${lado}`} gradientUnits="userSpaceOnUse" x1={lejos} y1="288" x2={lejos} y2="644">
            <stop offset="0" style={{ stopColor: AZUL_CLARO }} stopOpacity="0" />
            <stop offset="0.26" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.13" />
            <stop offset="0.5" stopColor="white" stopOpacity="0.3" />
            <stop offset="0.74" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.13" />
            <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`qh2-haz-fade-${lado}`} gradientUnits="userSpaceOnUse" x1="950" y1={FOCO_Y} x2={lejos} y2="466">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.45" stopColor="#999" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id={`qh2-haz-mask-${lado}`}>
            <polygon points={`${cerca},374 ${lejos},280 ${lejos},652 ${cerca},402`} fill={`url(#qh2-haz-fade-${lado})`} />
          </mask>
        </defs>
        <g mask={`url(#qh2-haz-mask-${lado})`}>
          <polygon points={`${cerca},376 ${lejos},288 ${lejos},644 ${cerca},400`} fill={`url(#qh2-haz-lat-${lado})`} />
          <polygon points={`${cerca},381 ${lejos},415 ${lejos},525 ${cerca},395`} fill={`url(#qh2-haz-lat-${lado})`} opacity="0.85" />
        </g>
      </svg>
    </div>
  );
}

/**
 * LOS HACES DEL FARO, cada uno en su propia caja HTML sobre el dibujo.
 *
 * Antes eran dos `<g>` adentro del SVG de la torre, y la coreografía los
 * giraba ahí: cada cuadro del giro obligaba al navegador a volver a pintar
 * el SVG entero —la torre, el islote, la linterna— a la resolución de la
 * pantalla. En un iPhone eso se sentía trabado (Gastón, 2026-10-02). Como
 * cajas aparte, el giro es una transformación de capa: el cono se pinta una
 * vez y después solo se compone.
 *
 * EL DIBUJO NO CAMBIA. Cada cono es el mismo de siempre: un gradiente
 * LATERAL (transparente → penumbra → núcleo blanco → penumbra →
 * transparente) que, como el cono es más angosto cerca de la linterna, ahí
 * solo muestrea su zona central; y una MÁSCARA longitudinal (blanco en el
 * origen → negro a lo lejos) que pone la caída con la distancia. Sin blur.
 * Nacen del ANCHO del cristal (a ±4 del foco), no de un punto.
 *
 * LA GEOMETRÍA. Las capas del faro muestran el dibujo con `slice`: lo
 * escalan hasta cubrir su caja y lo centran. La caja de adentro repite esa
 * cuenta en CSS —ancho = max(100% del ancho, 160% del alto), proporción
 * 1440:900, centrada— así cada cono se ubica en porcentajes del dibujo y
 * gira sobre el foco sin medir nada por código. Los márgenes negativos
 * centran sin `translate`: GSAP absorbe el translate de quien anima.
 */
export function HacesFaro() {
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div
        className="absolute top-1/2 left-1/2 aspect-[1440/900]"
        style={{
          width: "max(100cqw, 160cqh)",
          marginLeft: "calc(max(100cqw, 160cqh) / -2)",
          marginTop: "calc(max(100cqw, 160cqh) / -3.2)",
        }}
      >
        <Haz lado="izq" />
        <Haz lado="der" />
      </div>
    </div>
  );
}
