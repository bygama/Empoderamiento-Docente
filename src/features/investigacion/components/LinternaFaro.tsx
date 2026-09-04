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

/** Foco de la lámpara (centro del cristal), en coordenadas del viewBox. */
export const FOCO = { x: 950, y: 385 } as const;
/** El viewBox: 90 de ancho, y del remate (318) al piso (578). */
export const VIEWBOX = { x: 905, y: 318, w: 90, h: 260 } as const;

/**
 * El giro pseudo-3D: el tambor de la linterna y la galería son cilindros
 * vistos de costado. Cada barra vertical vive en un ángulo φ del cilindro y
 * se proyecta en x = cx + r·cos(φ + θ); las de atrás (sin < 0) se ven a
 * través del cristal, tenues. Con θ = 0 el SSR dibuja la pose final.
 *
 * La ÓPTICA rompe la simetría: es un rasgo único del tambor (vive en φ = 90°,
 * mirando al frente en la pose final), así una vuelta se lee como UNA vuelta
 * — con seis parantes iguales el ojo contaba seis.
 */
export const RADIO_CRISTAL = 14.5;
export const RADIO_GALERIA = 19.5;
/** Ángulos base de los parantes del cristal (6, cada 60°). */
export const PARANTES = [0, 60, 120, 180, 240, 300] as const;
/** Ángulos base de los montantes de la baranda (16, cada 22.5°). */
export const MONTANTES = Array.from({ length: 16 }, (_, k) => k * 22.5);
/** La óptica: ángulo base, radio de giro y ancho de frente. */
export const LENTE = { phi: 90, radio: 9, ancho: 10.8, y: 376.5, alto: 19 } as const;

export function proyectar(phi: number, theta: number, radio: number) {
  const a = ((phi + theta) * Math.PI) / 180;
  return { x: FOCO.x + radio * Math.cos(a), frente: Math.sin(a) };
}

/** Opacidad y grosor de una barra según su profundidad y su ángulo. */
export function aspectoBarra(frente: number, x: number, radio: number) {
  const canto = Math.abs(x - FOCO.x) / radio; // 1 = en el borde del cilindro
  // Al pasar atrás la barra se apaga en los últimos ~15° (sin escalón).
  const paso = Math.min(1, Math.max(0, (frente + 0.25) / 0.25));
  return {
    opacity: +(0.28 + 0.72 * paso).toFixed(3),
    grosor: +(1.2 + canto * 1.2).toFixed(3),
  };
}

/** La óptica proyectada: se angosta al ponerse de perfil y se apaga atrás. */
export function proyectarLente(theta: number) {
  const { x, frente } = proyectar(LENTE.phi, theta, LENTE.radio);
  const ancho = Math.max(2.4, LENTE.ancho * Math.abs(frente));
  const paso = Math.min(1, Math.max(0, (frente + 0.3) / 0.3));
  return {
    x: +(x - ancho / 2).toFixed(3),
    ancho: +ancho.toFixed(3),
    opacity: +(0.3 + 0.7 * paso).toFixed(3),
  };
}

/** Semiancho del fuste a la altura y (se abre apenas hacia el piso). */
const fuste = (y: number) => 13.6 + (y - 430) * 0.06;

export function LinternaFaro({ className = "" }: { className?: string }) {
  const lente = proyectarLente(0);
  return (
    <svg
      data-linterna
      viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`}
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="inv-fuste" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: mezcla(AZUL_CLARO, 18, "white") }} />
          <stop offset="0.55" style={{ stopColor: MARFIL_SOMBRA }} />
          <stop offset="1" style={{ stopColor: mezcla(AZUL_MEDIO, 62, "black") }} />
        </linearGradient>
        <linearGradient id="inv-cupula" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: mezcla(AZUL, 60, "white") }} />
          <stop offset="0.52" style={{ stopColor: AZUL }} />
          <stop offset="1" style={{ stopColor: mezcla(AZUL, 58, "black") }} />
        </linearGradient>
        <radialGradient id="inv-vidrio">
          <stop offset="0" stopColor="white" stopOpacity="0.98" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id="inv-lente">
          <stop offset="0" stopColor="white" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="white" stopOpacity="0.55" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.25" />
        </radialGradient>
        <radialGradient id="inv-nucleo">
          <stop offset="0" stopColor="white" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.5" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="inv-halo">
          <stop offset="0" stopColor="white" stopOpacity="0.85" />
          <stop offset="0.45" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.26" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0" />
        </radialGradient>
        {/* El haz: gradiente a lo largo (denso en el foco → nada al final)
            multiplicado por uno lateral (borde suave → centro → borde). */}
        <linearGradient id="inv-haz-largo" gradientUnits="userSpaceOnUse" x1={FOCO.x} y1={FOCO.y} x2="1300" y2={FOCO.y}>
          <stop offset="0" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.55" />
          <stop offset="0.35" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.22" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="inv-haz-lat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.5" stopColor="white" stopOpacity="1" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="inv-haz-mask">
          <polygon points="954,372 1300,250 1300,520 954,398" fill="url(#inv-haz-lat)" />
        </mask>
      </defs>

      {/* ── La luz, detrás de la arquitectura (el cristal la deja pasar). UN
          solo haz, en un grupo que GIRA alrededor del foco: rotación 0 =
          apunta a la derecha, −90 = al cielo, −180 = a la izquierda. */}
      <g data-linterna-luz>
        <g data-linterna-haces mask="url(#inv-haz-mask)">
          <polygon points="954,376 1300,290 1300,480 954,394" fill="url(#inv-haz-largo)" />
          <polygon points="954,380 1300,345 1300,425 954,390" fill="url(#inv-haz-largo)" opacity="0.85" />
        </g>
        <circle data-linterna-halo cx={FOCO.x} cy={FOCO.y} r="72" fill="url(#inv-halo)" />
      </g>

      {/* ── El fuste, plantado hasta el piso de la hoja. */}
      <polygon
        points={`${950 - fuste(430)},430 ${950 + fuste(430)},430 ${950 + fuste(578)},578 ${950 - fuste(578)},578`}
        fill="url(#inv-fuste)"
      />
      {/* Sombra de la galería sobre el arranque del fuste. */}
      <polygon
        points={`${950 - fuste(430)},430 ${950 + fuste(430)},430 ${950 + fuste(444)},444 ${950 - fuste(444)},444`}
        fill="black"
        opacity="0.16"
      />
      {/* Dos franjas azules que siguen la caída de luz lateral (como el original). */}
      {[[486, 498], [540, 552]].map(([y1, y2]) => (
        <g key={`fr-${y1}`}>
          <polygon
            points={`${950 - fuste(y1)},${y1} ${950 + fuste(y1)},${y1} ${950 + fuste(y2)},${y2} ${950 - fuste(y2)},${y2}`}
            style={{ fill: AZUL }}
            opacity="0.85"
          />
          <line x1={950 - fuste(y1)} y1={y1 + 0.5} x2={950 + fuste(y1)} y2={y1 + 0.5} stroke="white" strokeOpacity="0.1" strokeWidth="0.9" />
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
        <rect x="935.5" y="371.5" width="29" height="27.5" fill="url(#inv-vidrio)" />
        <rect
          data-linterna-lente
          x={lente.x}
          y={LENTE.y}
          width={lente.ancho}
          height={LENTE.alto}
          rx="1.4"
          fill="url(#inv-lente)"
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
      <circle data-linterna-nucleo cx={FOCO.x} cy={FOCO.y} r="12" fill="url(#inv-nucleo)" />

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
      <polygon points="930.5,368.4 950,348.8 969.5,368.4" fill="url(#inv-cupula)" />
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
