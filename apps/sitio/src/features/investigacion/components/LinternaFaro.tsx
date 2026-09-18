import {
  aspectoBarra,
  FOCO,
  LENTE,
  MONTANTES,
  PARANTES,
  proyectar,
  proyectarLente,
  RADIO_CRISTAL,
  RADIO_GALERIA,
  VIEWBOX,
} from "./linterna-geometria";

/**
 * La linterna del faro: fuste hasta el piso, galería con baranda, cristal con
 * la óptica, techo a dos aguas y remate. Geometría calcada de FaroEscena.tsx
 * (Qué hacemos) para que sea EL MISMO faro de la marca, no otro; acá vive
 * recortada y grande, como objeto plantado en el borde inferior de la hoja.
 *
 * Presentacional. Renderiza el estado FINAL de la escena (encendida, con el
 * haz posado hacia la derecha). Los grupos llevan data-attributes para que
 * la coreografía prenda la luz y gire el haz: data-linterna-vidrio,
 * data-linterna-nucleo, data-linterna-halo, data-linterna-haces.
 *
 * Reglas de marca (DESIGN.md): tokens + mezclas con blanco/negro; la luz es
 * blanco → azul-claro, nunca amarilla. Sin filtros SVG (re-rasterizan al
 * rotar): el volumen sale de gradientes y envolventes apiladas.
 */

const AZUL = "var(--color-azul-principal)";
const AZUL_MEDIO = "var(--color-azul-medio)";
const AZUL_CLARO = "var(--color-azul-claro)";

const mezcla = (color: string, pct: number, base: "black" | "white") =>
  `color-mix(in srgb, ${color} ${pct}%, ${base})`;

const MARFIL_SOMBRA = mezcla(AZUL_MEDIO, 42, "white");

/** Semiancho del fuste a la altura y (se abre apenas hacia el piso). */
const fuste = (y: number) => 13.6 + (y - 430) * 0.06;

/** Hasta dónde llega el haz de siempre (x del viewBox), el del cierre. */
const LARGO_HAZ_BASE = 1300;

type Props = {
  className?: string;
  /**
   * Prefijo de los ids de gradientes y máscara. La linterna vive dos veces
   * en Investigación (hero y cierre) y los ids de un SVG son globales al
   * documento: sin prefijo propio, `url(#…)` de una resuelve a la otra.
   */
  prefijo?: string;
  /** Hasta qué x del viewBox llega el haz (el hero lo tiene que posar sobre
   *  el titular, más lejos que el cierre). La punta conserva su semialtura:
   *  un haz más largo es un cono más CERRADO, no una inundación. */
  largoHaz?: number;
  /**
   * Ángulo del haz en el frame ESTÁTICO (0 = derecha, −90 = cielo, −180 =
   * izquierda). Va en un grupo propio, fuera del que anima la coreografía:
   * un `rotate()` previo en el mismo elemento que GSAP rota lo descompone
   * en traslación y corre el haz de lugar. La coreografía lo anula.
   */
  hazPose?: number;
};

export function LinternaFaro({
  className = "",
  prefijo = "inv",
  largoHaz = LARGO_HAZ_BASE,
  hazPose = 0,
}: Props) {
  const lente = proyectarLente(0);
  const id = (nombre: string) => `${prefijo}-${nombre}`;
  /** Un cono del haz: semialtura en el arranque (el cristal) y en la punta. */
  const cono = (arranque: number, punta: number) =>
    `954,${FOCO.y - arranque} ${largoHaz},${FOCO.y - punta} ${largoHaz},${FOCO.y + punta} 954,${FOCO.y + arranque}`;
  return (
    <svg
      data-linterna
      viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`}
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id("fuste")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: mezcla(AZUL_CLARO, 18, "white") }} />
          <stop offset="0.55" style={{ stopColor: MARFIL_SOMBRA }} />
          <stop offset="1" style={{ stopColor: mezcla(AZUL_MEDIO, 62, "black") }} />
        </linearGradient>
        <linearGradient id={id("cupula")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: mezcla(AZUL, 60, "white") }} />
          <stop offset="0.52" style={{ stopColor: AZUL }} />
          <stop offset="1" style={{ stopColor: mezcla(AZUL, 58, "black") }} />
        </linearGradient>
        <radialGradient id={id("vidrio")}>
          <stop offset="0" stopColor="white" stopOpacity="0.98" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id={id("lente")}>
          <stop offset="0" stopColor="white" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="white" stopOpacity="0.55" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.25" />
        </radialGradient>
        <radialGradient id={id("nucleo")}>
          <stop offset="0" stopColor="white" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.5" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("halo")}>
          <stop offset="0" stopColor="white" stopOpacity="0.85" />
          <stop offset="0.45" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.26" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0" />
        </radialGradient>
        {/* El haz: gradiente a lo largo (denso en el foco → nada al final)
            multiplicado por uno lateral (borde suave → centro → borde). */}
        <linearGradient id={id("haz-largo")} gradientUnits="userSpaceOnUse" x1={FOCO.x} y1={FOCO.y} x2={largoHaz} y2={FOCO.y}>
          <stop offset="0" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.55" />
          <stop offset="0.35" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.22" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("haz-lat")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.5" stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={id("haz-mask")}>
          <polygon points={cono(13, 135)} fill={`url(#${id("haz-lat")})`} />
        </mask>
      </defs>

      {/* ── La luz, detrás de la arquitectura (el cristal la deja pasar). UN
          solo haz, en un grupo que GIRA alrededor del foco: rotación 0 =
          apunta a la derecha, −90 = al cielo, −180 = a la izquierda. */}
      <g data-linterna-luz>
        <g data-linterna-pose transform={`rotate(${hazPose} ${FOCO.x} ${FOCO.y})`}>
          <g data-linterna-haces mask={`url(#${id("haz-mask")})`}>
            <polygon points={cono(9, 95)} fill={`url(#${id("haz-largo")})`} />
            <polygon points={cono(5, 40)} fill={`url(#${id("haz-largo")})`} opacity="0.85" />
          </g>
        </g>
        <circle data-linterna-halo cx={FOCO.x} cy={FOCO.y} r="72" fill={`url(#${id("halo")})`} />
      </g>

      {/* ── El fuste, plantado hasta el piso de la hoja. */}
      <polygon
        points={`${950 - fuste(430)},430 ${950 + fuste(430)},430 ${950 + fuste(578)},578 ${950 - fuste(578)},578`}
        fill={`url(#${id("fuste")})`}
      />
      {/* Sombra de la galería sobre el arranque del fuste. */}
      <polygon
        points={`${950 - fuste(430)},430 ${950 + fuste(430)},430 ${950 + fuste(444)},444 ${950 - fuste(444)},444`}
        fill="black"
        opacity="0.16"
      />
      {/* Dos franjas azules a la altura del hero de Qué hacemos (ritmo del
          isotipo: ventana, franja, ventana, franja, puerta). Siguen la caída
          de luz lateral. */}
      {[[490, 503], [553, 566]].map(([y1, y2]) => (
        <g key={`fr-${y1}`}>
          <polygon
            points={`${950 - fuste(y1)},${y1} ${950 + fuste(y1)},${y1} ${950 + fuste(y2)},${y2} ${950 - fuste(y2)},${y2}`}
            style={{ fill: AZUL }}
            opacity="0.85"
          />
          <line x1={950 - fuste(y1)} y1={y1 + 0.5} x2={950 + fuste(y1)} y2={y1 + 0.5} stroke="white" strokeOpacity="0.1" strokeWidth="0.9" />
        </g>
      ))}

      {/* Los dos ojos de buey APAGADOS, a la misma altura que en el hero. */}
      {[468, 530].map((cy) => (
        <g key={`ob-${cy}`}>
          <circle cx="950" cy={cy} r="4.4" style={{ fill: AZUL }} opacity="0.85" />
          <path d={`M945.9,${cy - 0.7} A4.1,4.1 0 0 1 954.1,${cy - 0.7}`} fill="none" stroke="white" strokeOpacity="0.14" strokeWidth="0.9" />
          <path d={`M945.9,${cy + 1} A4.1,4.1 0 0 0 954.1,${cy + 1}`} fill="none" stroke="black" strokeOpacity="0.12" strokeWidth="0.9" />
        </g>
      ))}

      {/* ── Cornisa acampanada + ménsulas + platea de la galería. */}
      <polygon points="934.6,423.6 965.4,423.6 964,430 936,430" style={{ fill: MARFIL_SOMBRA }} />
      <line x1="934.6" y1="424.2" x2="965.4" y2="424.2" stroke="white" strokeOpacity="0.22" strokeWidth="1" />
      {[-19, -9.5, 0, 9.5, 19].map((dx) => (
        <polygon
          key={`me-${dx}`}
          points={`${950 + dx - 2.4},423.6 ${950 + dx + 2.4},423.6 ${950 + dx + 1.3},429.6 ${950 + dx - 1.3},429.6`}
          style={{ fill: mezcla(AZUL, 68, "black") }}
        />
      ))}
      <rect x="926" y="419" width="48" height="4.6" rx="1" style={{ fill: AZUL }} />
      <rect x="926" y="419" width="48" height="1.3" rx="0.65" style={{ fill: AZUL_CLARO }} opacity="0.45" />

      {/* ── Baranda: montantes proyectados sobre el cilindro + tres rieles. */}
      {MONTANTES.map((phi) => {
        const { x, frente } = proyectar(phi, 0, RADIO_GALERIA);
        const { opacity, grosor } = aspectoBarra(frente, x, RADIO_GALERIA);
        return (
          <line
            key={`b-${phi}`}
            data-linterna-montante={phi}
            x1={x}
            y1="404.5"
            x2={x}
            y2="419"
            style={{ stroke: AZUL_CLARO }}
            strokeOpacity={0.5 * opacity}
            strokeWidth={0.55 + grosor * 0.35}
          />
        );
      })}
      <line x1="930.5" y1="404.2" x2="969.5" y2="404.2" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.68" strokeWidth="1.5" />
      <line x1="930.5" y1="410.6" x2="969.5" y2="410.6" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.34" strokeWidth="0.9" />
      <line x1="930.5" y1="416.8" x2="969.5" y2="416.8" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.4" strokeWidth="1" />

      {/* ── Piso de la linterna con moldura doble. */}
      <rect x="932.5" y="399" width="35" height="3.4" style={{ fill: AZUL }} />
      <rect x="933.6" y="402" width="32.8" height="1.5" style={{ fill: mezcla(AZUL, 70, "black") }} />
      <line x1="932.5" y1="399.4" x2="967.5" y2="399.4" stroke="white" strokeOpacity="0.18" strokeWidth="0.8" />

      {/* ── El cristal: vidrio + la óptica (que gira con el tambor) + reflejo. */}
      <g data-linterna-vidrio>
        <rect x="935.5" y="371.5" width="29" height="27.5" fill={`url(#${id("vidrio")})`} />
        <rect
          data-linterna-lente
          x={lente.x}
          y={LENTE.y}
          width={lente.ancho}
          height={LENTE.alto}
          rx="1.4"
          fill={`url(#${id("lente")})`}
          opacity={lente.opacity}
        />
        {[381.5, 388, 394.5].map((y) => (
          <line key={`l-${y}`} x1="945.4" y1={y} x2="954.6" y2={y} style={{ stroke: AZUL_CLARO }} strokeOpacity="0.5" strokeWidth="0.8" />
        ))}
        <polygon points="937.2,371.5 946.4,371.5 940,399 935.5,399 935.5,382" fill="white" opacity="0.14" />
        <rect x="961.3" y="371.5" width="3.2" height="27.5" style={{ fill: AZUL }} opacity="0.15" />
      </g>
      {/* La lámpara, FUERA del grupo del cristal: su chispa no debe heredar la
          opacidad del vidrio apagado (la secuencia es chispa → cristal). */}
      <circle data-linterna-nucleo cx={FOCO.x} cy={FOCO.y} r="12" fill={`url(#${id("nucleo")})`} />

      {/* ── Estructura: marcos horizontales + parantes proyectados. */}
      <line x1="934.4" y1="371.6" x2="965.6" y2="371.6" style={{ stroke: AZUL }} strokeWidth="1.6" />
      <line x1="934.4" y1="398.9" x2="965.6" y2="398.9" style={{ stroke: AZUL }} strokeWidth="1.6" />
      {PARANTES.map((phi) => {
        const { x, frente } = proyectar(phi, 0, RADIO_CRISTAL);
        const { opacity, grosor } = aspectoBarra(frente, x, RADIO_CRISTAL);
        return (
          <line
            key={`p-${phi}`}
            data-linterna-parante={phi}
            x1={x}
            y1="371"
            x2={x}
            y2="399.4"
            style={{ stroke: AZUL }}
            strokeOpacity={opacity}
            strokeWidth={grosor}
          />
        );
      })}

      {/* ── Cornisa, techo a dos aguas con alero (como el isotipo), remate. */}
      <rect x="932.8" y="368.4" width="34.4" height="3.1" rx="1.3" style={{ fill: AZUL }} />
      <rect x="932.8" y="368.4" width="34.4" height="1.1" rx="0.55" style={{ fill: AZUL_CLARO }} opacity="0.35" />
      <polygon points="930.5,368.4 950,348.8 969.5,368.4" fill={`url(#${id("cupula")})`} />
      <path d="M950,349.6 L950,368" stroke="white" strokeOpacity="0.16" strokeWidth="0.9" />
      <path d="M933.2,367.2 L950,350.4" fill="none" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.32" strokeWidth="1" />
      <path d="M950,350.4 L966.8,367.2" fill="none" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.18" strokeWidth="1" />
      <rect x="929.6" y="367.4" width="40.8" height="2" rx="1" style={{ fill: AZUL }} />
      <rect x="929.6" y="367.4" width="40.8" height="0.9" rx="0.45" style={{ fill: AZUL_CLARO }} opacity="0.3" />
      <circle cx="950" cy="348.6" r="2.3" style={{ fill: AZUL }} />
      <rect x="949.1" y="335.5" width="1.8" height="13.5" rx="0.9" style={{ fill: AZUL }} />
      <circle cx="950" cy="333" r="2.5" style={{ fill: AZUL_CLARO }} opacity="0.9" />
      <circle cx="949.2" cy="332.2" r="0.8" fill="white" opacity="0.55" />
      <line x1="950" y1="330.6" x2="950" y2="327.8" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.7" strokeWidth="1" />

      {/* Sombra del techo sobre el cristal. */}
      <rect x="935.5" y="371.5" width="29" height="2.2" fill="black" opacity="0.12" />
    </svg>
  );
}
