/**
 * Escena del faro v2 — «Qué hacemos», por CAPAS DE PROFUNDIDAD.
 *
 * La escena ya no es un SVG único: son seis capas DOM apiladas, cada una con
 * una profundidad Z conceptual. La "cámara" (QueHacemosHeroFaro) anima un
 * proxy {z,x,y} y aplica a cada capa escala y desplazamiento derivados de su
 * profundidad — paralaje geométricamente correcto sin CSS 3D real (evita el
 * flattening de filters/overflow sobre preserve-3d).
 *
 *   CAPAS.cielo      Z=1500  cielo + mar profundo + estrellas + velos de alba
 *   CAPAS.horizonte  Z=1050  línea de horizonte, mar lejano, bruma
 *   CAPAS.faro       Z=620   islote + faro + LUZ (haz, halo, linterna)
 *   CAPAS.marMedio   Z=300   destellos, espejo de la linterna, puntos-verbo
 *   CAPAS.muelle     Z=90    el muelle en perspectiva hacia el punto de fuga
 *   CAPAS.foreground Z=-140  postes cercanos que sangran el cuadro
 *
 * Todas las capas comparten viewBox 1440x900 y el mismo PUNTO DE FUGA
 * (FUGA_X, FUGA_Y): el muelle converge ahí y el faro se planta ahí — avanzar
 * la cámara agranda el mundo DESDE ese punto (caminamos hacia la luz).
 * transform-origin de cada capa = el punto de fuga, por eso.
 *
 * Reglas de marca (DESIGN.md): paleta 100% tokens + mezclas con blanco/negro
 * vía color-mix; nada de amarillo (la luz es blanco→azul-claro); las
 * estrellas insinúan el grid de puntos §6 (alineadas a múltiplos de 44px)
 * pero escasas y atmosféricas, no un wallpaper. El faro es una representación
 * conceptual —arquitectónica, esbelta— no el isotipo del logo (manual §10).
 * Todo determinista: SSR e hidratación idénticas.
 */

const AZUL = "var(--color-azul-principal)";
const AZUL_MEDIO = "var(--color-azul-medio)";
const AZUL_CLARO = "var(--color-azul-claro)";
const GRIS_FONDO = "var(--color-gris-fondo)";
const VERDE = "var(--color-verde-concepto)";

/** Sombra/tinte dentro de familia: token mezclado solo con negro o blanco. */
const mezcla = (color: string, pct: number, base: "black" | "white") =>
  `color-mix(in srgb, ${color} ${pct}%, ${base})`;

const NOCHE = mezcla(AZUL, 45, "black");
const SILUETA = mezcla(AZUL, 52, "black");
const SILUETA_SUAVE = mezcla(AZUL, 68, "black");
const MARFIL = mezcla(AZUL_CLARO, 10, "white");
const MARFIL_SOMBRA = mezcla(AZUL_MEDIO, 42, "white");

/** Punto de fuga compartido (viewBox 1440x900) y su equivalente en %. */
export const FUGA_X = 950;
export const FUGA_Y = 522;
export const ORIGEN_CSS = `${((FUGA_X / 1440) * 100).toFixed(2)}% ${((FUGA_Y / 900) * 100).toFixed(2)}%`;

/** Profundidades conceptuales de cada capa (px hacia el fondo). */
export const CAPAS_Z = {
  cielo: 1500,
  horizonte: 1050,
  faro: 620,
  marMedio: 300,
  muelle: 90,
  foreground: -140,
} as const;

/** Foco de la linterna, en coordenadas de la capa faro. */
export const FOCO_X = FUGA_X;
export const FOCO_Y = 388;

/* ── Estrellas ────────────────────────────────────────────────────────────
 * Escasas y deterministas. Alineadas a la retícula de 44px (submúltiplo del
 * grid de marca) con radios/alfas variados: el ADN del patrón §6 queda
 * subliminal, no gráfico. Menos densidad cerca del horizonte. */
const ESTRELLAS: ReadonlyArray<readonly [number, number, number, number]> = [
  [88, 44, 1.6, 0.16], [308, 88, 1.2, 0.1], [528, 44, 1.4, 0.2],
  [792, 132, 1.2, 0.12], [1056, 66, 1.7, 0.18], [1276, 110, 1.3, 0.1],
  [176, 176, 1.2, 0.09], [440, 220, 1.5, 0.14], [704, 176, 1.1, 0.08],
  [968, 198, 1.3, 0.12], [1188, 242, 1.5, 0.16], [1364, 176, 1.1, 0.09],
  [44, 308, 1.4, 0.12], [264, 352, 1.1, 0.07], [572, 330, 1.3, 0.1],
  [836, 308, 1.1, 0.08], [1100, 352, 1.4, 0.11], [1320, 330, 1.2, 0.08],
  [132, 440, 1.2, 0.06], [396, 462, 1.0, 0.05], [660, 440, 1.2, 0.07],
  [924, 462, 1.0, 0.05], [1232, 440, 1.2, 0.06],
] as const;

/* ── Destellos del mar (por capa, para paralaje interno) ───────────────── */
const DESTELLOS_LEJOS: ReadonlyArray<readonly [number, number, number, number]> = [
  [210, 596, 46, 0.07], [470, 610, 34, 0.05], [700, 590, 52, 0.08],
  [1130, 600, 44, 0.09], [1290, 616, 36, 0.06], [880, 622, 30, 0.05],
] as const;

const DESTELLOS_MEDIO: ReadonlyArray<readonly [number, number, number, number]> = [
  [150, 700, 64, 0.09], [420, 742, 46, 0.07], [90, 800, 78, 0.08],
  [640, 700, 40, 0.06], [1180, 690, 58, 0.1], [1310, 760, 48, 0.07],
  [1120, 830, 60, 0.06], [340, 850, 70, 0.06],
] as const;

/** Espejo de la linterna en el agua: [y, largo, alfa, corrimiento x]. */
const ESPEJO: ReadonlyArray<readonly [number, number, number, number]> = [
  [700, 34, 0.3, -3], [716, 22, 0.24, 4], [734, 26, 0.18, -2],
  [756, 16, 0.13, 5], [782, 20, 0.09, -5], [812, 12, 0.06, 2],
] as const;

/**
 * Puntos del mar que el haz "toca" en el método (escena 2), en coordenadas
 * de la capa marMedio. El orden acompaña la coreografía de verbos: izquierda
 * lejos → izquierda alta → derecha → derecha cerca → centro (el camino).
 */
export const PUNTOS_VERBO: ReadonlyArray<readonly [number, number]> = [
  [270, 700], [180, 620], [1230, 680], [1150, 780], [720, 820],
] as const;

/* ── Muelle ───────────────────────────────────────────────────────────────
 * Converge al punto de fuga. Borde cercano centrado, ancho de paseo real. */
const MUELLE = {
  nearL: [300, 940],
  nearR: [1080, 940],
  farL: [928, 546],
  farR: [974, 548],
} as const;

const lerp = (a: readonly number[], b: readonly number[], t: number) =>
  [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as const;

/** Compresión geométrica de tablones hacia la fuga. */
const TABLONES = Array.from({ length: 17 }, (_, k) => 1 - 0.855 ** k);

/** Postes del muelle [t, ladoDerecho]. */
const POSTES: ReadonlyArray<readonly [number, boolean]> = [
  [0.06, false], [0.06, true], [0.3, false], [0.3, true],
  [0.52, false], [0.52, true], [0.7, false], [0.7, true],
  [0.84, false], [0.84, true],
] as const;

function CapaCielo() {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        {/* Fondo único cielo+mar profundo: evita costuras entre capas. */}
        <linearGradient id="qh2-fondo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: NOCHE }} />
          <stop offset="0.55" style={{ stopColor: AZUL }} />
          <stop offset="0.63" style={{ stopColor: mezcla(AZUL_MEDIO, 40, "black") }} />
          <stop offset="0.78" style={{ stopColor: mezcla(AZUL, 82, "black") }} />
          <stop offset="1" style={{ stopColor: mezcla(AZUL, 58, "black") }} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1440" height="900" fill="url(#qh2-fondo)" />
      <g data-estrellas>
        {ESTRELLAS.map(([x, y, r, a]) => (
          <circle key={`s-${x}-${y}`} cx={x} cy={y} r={r} fill="white" opacity={a} />
        ))}
      </g>
    </svg>
  );
}

/**
 * Velos de amanecer como DIVs (no rects dentro del SVG): animar su opacity
 * es puro compositor — un rect en el SVG repintaría la capa cielo entera en
 * cada frame del scrub. Alba 2 termina EXACTAMENTE en gris-fondo para que
 * la sección siguiente sea la continuación literal del cielo.
 */
function VelosAlba() {
  return (
    <>
      <div
        data-alba="1"
        className="absolute inset-0"
        style={{
          opacity: 0,
          background: `linear-gradient(to bottom, ${AZUL} 0%, ${mezcla(AZUL_MEDIO, 78, "white")} 42%, ${mezcla(AZUL_CLARO, 72, "white")} 60%, ${mezcla(AZUL_MEDIO, 55, "white")} 80%, ${mezcla(AZUL_MEDIO, 70, "white")} 100%)`,
        }}
      />
      <div
        data-alba="2"
        className="absolute inset-0"
        style={{
          opacity: 0,
          background: `linear-gradient(to bottom, ${mezcla(AZUL_CLARO, 55, "white")} 0%, ${mezcla(AZUL_CLARO, 26, "white")} 50%, ${GRIS_FONDO} 100%)`,
        }}
      />
    </>
  );
}

function CapaHorizonte() {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <filter id="qh2-blur-h" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      {/* Respiración atmosférica sobre el horizonte, del lado del faro. */}
      <ellipse cx="1010" cy="560" rx="420" ry="96" style={{ fill: AZUL_MEDIO }} opacity="0.14" filter="url(#qh2-blur-h)" />
      <line x1="0" y1="560" x2="1440" y2="560" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.12" strokeWidth="1" />
      {DESTELLOS_LEJOS.map(([x, y, l, a]) => (
        <line key={`dl-${x}`} x1={x} y1={y} x2={x + l} y2={y} style={{ stroke: AZUL_CLARO }} strokeOpacity={a} strokeWidth="1.6" strokeLinecap="round" />
      ))}
      {/* Bruma baja: crece con el amanecer. */}
      <g data-bruma style={{ opacity: 0.5 }}>
        <rect x="520" y="536" width="920" height="30" fill="white" opacity="0.05" filter="url(#qh2-blur-h)" />
        <rect x="80" y="548" width="560" height="22" fill="white" opacity="0.03" filter="url(#qh2-blur-h)" />
      </g>
    </svg>
  );
}

/**
 * Semiancho del fuste a la altura y. Cónico (14 arriba → 23 en la base) con
 * ENTASIS: una concavidad de ~1.9px en el medio — el perfil de un faro real
 * no es un trapecio, es una curva. Es la diferencia entre «ícono ampliado»
 * y objeto arquitectónico; todo lo que viste el fuste (franjas, juntas,
 * filo de luz) hereda la curva porque consulta esta función.
 */
const fuste = (y: number) => {
  const t = (y - 430) / 186;
  return 14 + 9 * t - 1.9 * 4 * t * (1 - t);
};

/** Muestreo del perfil (el polígono del fuste y sus bandas de volumen). */
const FUSTE_YS = Array.from({ length: 14 }, (_, i) => 430 + (186 * i) / 13);
const camino = (pts: ReadonlyArray<readonly [number, number]>) =>
  pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

function CapaFaro() {
  const izq = FUSTE_YS.map((y) => [950 - fuste(y), y] as const);
  const der = FUSTE_YS.map((y) => [950 + fuste(y), y] as const);
  const perfilFuste = camino([...izq, ...[...der].reverse()]);
  const filoLuz = camino([...izq, ...izq.map(([x, y]) => [x + 2.3, y] as const).reverse()]);
  const coreShadow = camino([
    ...der.map(([x, y]) => [x - 6.2, y] as const),
    ...der.map(([x, y]) => [x - 1.8, y] as const).reverse(),
  ]);
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        {/* Marfil con highlight desplazado (la luz de la linterna vive a la
            izquierda del eje): lectura cilíndrica sin sombreado ilustrativo. */}
        <linearGradient id="qh2-fuste" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: MARFIL }} />
          <stop offset="0.34" style={{ stopColor: mezcla(AZUL_CLARO, 12, "white") }} />
          <stop offset="0.72" style={{ stopColor: mezcla(AZUL_CLARO, 26, "white") }} />
          <stop offset="1" style={{ stopColor: MARFIL_SOMBRA }} />
        </linearGradient>
        {/* Franjas y cúpula con caída de luz lateral: acompañan el volumen
            del cuerpo en vez de leerse como bandas planas pegadas. */}
        <linearGradient id="qh2-franja" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: mezcla(AZUL, 80, "white") }} />
          <stop offset="0.55" style={{ stopColor: AZUL }} />
          <stop offset="1" style={{ stopColor: mezcla(AZUL, 74, "black") }} />
        </linearGradient>
        <linearGradient id="qh2-cupula" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: mezcla(AZUL, 60, "white") }} />
          <stop offset="0.52" style={{ stopColor: AZUL }} />
          <stop offset="1" style={{ stopColor: mezcla(AZUL, 58, "black") }} />
        </linearGradient>
        {/* Sombra que la galería proyecta sobre el arranque del fuste. */}
        <linearGradient id="qh2-sombra-gal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="black" stopOpacity="0.2" />
          <stop offset="1" stopColor="black" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="qh2-plinto" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: MARFIL }} />
          <stop offset="1" style={{ stopColor: MARFIL_SOMBRA }} />
        </linearGradient>
        {/* Óptica interior de la linterna (lente sugerida, no infografía). */}
        <radialGradient id="qh2-lente">
          <stop offset="0" stopColor="white" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="white" stopOpacity="0.55" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.25" />
        </radialGradient>
        {/* Haz: el cerebro tiene que leer LUZ, no shapes. Cada óptica es un
            único cono con gradiente LATERAL (transparente → penumbra →
            núcleo blanco → penumbra → transparente): como el cono es más
            angosto cerca de la linterna, ahí solo muestrea la zona central
            del gradiente y el feathering acompaña la geometría solo. La
            caída con la distancia la pone una MÁSCARA longitudinal (blanco
            en el origen → negro a lo lejos) — sin blur, sin bandas. */}
        <linearGradient id="qh2-haz-lat-izq" gradientUnits="userSpaceOnUse" x1="-360" y1="288" x2="-360" y2="644">
          <stop offset="0" style={{ stopColor: AZUL_CLARO }} stopOpacity="0" />
          <stop offset="0.26" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.13" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.3" />
          <stop offset="0.74" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.13" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="qh2-haz-lat-der" gradientUnits="userSpaceOnUse" x1="2260" y1="288" x2="2260" y2="644">
          <stop offset="0" style={{ stopColor: AZUL_CLARO }} stopOpacity="0" />
          <stop offset="0.26" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.13" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.3" />
          <stop offset="0.74" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.13" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="qh2-haz-fade-izq" gradientUnits="userSpaceOnUse" x1={FOCO_X} y1={FOCO_Y} x2="-360" y2="466">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.45" stopColor="#999" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <linearGradient id="qh2-haz-fade-der" gradientUnits="userSpaceOnUse" x1={FOCO_X} y1={FOCO_Y} x2="2260" y2="466">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.45" stopColor="#999" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="qh2-haz-mask-izq">
          <polygon points="946,374 -360,280 -360,652 946,402" fill="url(#qh2-haz-fade-izq)" />
        </mask>
        <mask id="qh2-haz-mask-der">
          <polygon points="954,374 2260,280 2260,652 954,402" fill="url(#qh2-haz-fade-der)" />
        </mask>
        <radialGradient id="qh2-halo">
          <stop offset="0" stopColor="white" stopOpacity="0.9" />
          <stop offset="0.5" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.28" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="qh2-vidrio">
          <stop offset="0" stopColor="white" stopOpacity="0.98" />
          <stop offset="1" style={{ stopColor: AZUL_CLARO }} stopOpacity="0.45" />
        </radialGradient>
        {/* Núcleo de la lámpara sin filtro: glow por gradiente radial. */}
        <radialGradient id="qh2-nucleo">
          <stop offset="0" stopColor="white" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.5" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Islote ── */}
      <polygon points="900,640 940,628 1000,632 1022,652 1004,674 952,682 910,670 892,654" style={{ fill: SILUETA }} />
      <polygon points="900,640 946,630 938,668 906,662" style={{ fill: SILUETA_SUAVE }} />
      <polygon points="978,632 1022,652 1000,672 962,664" style={{ fill: mezcla(AZUL, 40, "black") }} />
      <polyline points="892,654 940,628 1000,632" fill="none" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.24" strokeWidth="1.3" />
      {/* Espuma de contacto: la roca toca el agua, no flota sobre ella. */}
      <polyline points="894,672 918,678 952,682 990,678 1016,668" fill="none" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.13" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── Faro: arquitectura esbelta, marfil + azul institucional ── */}
      <g>
        {/* Sombra de contacto: el faro PESA sobre la roca. */}
        <ellipse cx="950" cy="637" rx="37" ry="4.6" fill="black" opacity="0.2" />
        {/* Plinto: dos escalones con talud + moldura toro — el cuerpo no
            nace de un corte seco, se ASIENTA. */}
        <polygon points="920,637 924,627 976,627 980,637" fill="url(#qh2-plinto)" />
        <rect x="920" y="635.6" width="60" height="1.8" style={{ fill: AZUL }} opacity="0.38" />
        <polygon points="924,627 927.5,617 972.5,617 976,627" fill="url(#qh2-plinto)" />
        <line x1="924.6" y1="627" x2="975.4" y2="627" stroke="white" strokeOpacity="0.24" strokeWidth="1" />
        <rect x="925.8" y="613.8" width="48.4" height="3.6" rx="1.8" style={{ fill: MARFIL_SOMBRA }} />
        <rect x="925.8" y="613.8" width="48.4" height="1.2" rx="0.6" fill="white" opacity="0.3" />
        {/* Fuste con entasis + volumen: filo de luz a la izquierda,
            core-shadow como banda interior a la derecha (no en el borde:
            así el borde queda con luz rebotada y el cilindro gira). */}
        <polygon points={perfilFuste} fill="url(#qh2-fuste)" />
        <polygon points={filoLuz} fill="white" opacity="0.28" />
        <polygon points={coreShadow} style={{ fill: AZUL }} opacity="0.11" />
        {/* Sombra proyectada por la galería sobre el arranque del fuste. */}
        <polygon points={`${(950 - fuste(431)).toFixed(1)},431 ${(950 + fuste(431)).toFixed(1)},431 ${(950 + fuste(447)).toFixed(1)},447 ${(950 - fuste(447)).toFixed(1)},447`} fill="url(#qh2-sombra-gal)" />
        {/* Juntas de sillería, casi subliminales (aguantan el acercamiento) */}
        {[452, 468, 484, 500, 540, 548, 588, 596].map((y) => (
          <line key={`j-${y}`} x1={950 - fuste(y)} y1={y} x2={950 + fuste(y)} y2={y} style={{ stroke: AZUL }} strokeOpacity="0.05" strokeWidth="1" />
        ))}
        {/* Tres franjas azules: siguen la curva del fuste y llevan la misma
            caída de luz lateral que el cuerpo (materialidad, no stickers). */}
        {[[470, 482], [516, 528], [562, 574]].map(([y1, y2]) => (
          <g key={`fr-${y1}`}>
            <polygon
              points={`${950 - fuste(y1)},${y1} ${950 + fuste(y1)},${y1} ${950 + fuste(y2)},${y2} ${950 - fuste(y2)},${y2}`}
              fill="url(#qh2-franja)"
            />
            <line x1={950 - fuste(y1)} y1={y1 + 0.5} x2={950 + fuste(y1)} y2={y1 + 0.5} stroke="white" strokeOpacity="0.1" strokeWidth="0.9" />
            <line x1={950 - fuste(y2)} y1={y2 - 0.4} x2={950 + fuste(y2)} y2={y2 - 0.4} stroke="black" strokeOpacity="0.1" strokeWidth="0.9" />
          </g>
        ))}
        {/* Puerta: marco + hoja con arco, dintel y umbral. */}
        <rect x="940.5" y="595.4" width="19" height="2.6" rx="1.3" style={{ fill: MARFIL_SOMBRA }} />
        <path d="M943,618 L943,601 Q950,594 957,601 L957,618 Z" style={{ fill: mezcla(AZUL, 58, "black") }} />
        <path d="M944.6,618 L944.6,602.2 Q950,597 955.4,602.2 L955.4,618 Z" style={{ fill: SILUETA }} />
        <rect x="941" y="617" width="18" height="2.2" style={{ fill: mezcla(AZUL, 64, "black") }} />
        {/* Cornisa acampanada: el fuste no termina seco — se abre para
            recibir la galería. */}
        <polygon points="934.6,423.6 965.4,423.6 964,430 936,430" style={{ fill: MARFIL_SOMBRA }} />
        <line x1="934.6" y1="424.2" x2="965.4" y2="424.2" stroke="white" strokeOpacity="0.22" strokeWidth="1" />
        {/* Ménsulas (5) que sostienen el vuelo de la platea. */}
        {[-19, -9.5, 0, 9.5, 19].map((dx) => (
          <polygon key={`me-${dx}`} points={`${950 + dx - 2.4},423.6 ${950 + dx + 2.4},423.6 ${950 + dx + 1.3},429.6 ${950 + dx - 1.3},429.6`} style={{ fill: mezcla(AZUL, 68, "black") }} />
        ))}
        {/* Platea de la galería con espesor real: cara de luz + canto. */}
        <rect x="926" y="419" width="48" height="4.6" rx="1" style={{ fill: AZUL }} />
        <rect x="926" y="419" width="48" height="1.3" rx="0.65" style={{ fill: AZUL_CLARO }} opacity="0.45" />
        {/* Baranda: pasamanos + riel medio + riel bajo sobre montantes. */}
        {Array.from({ length: 11 }, (_, i) => 931.5 + i * 3.7).map((x, i) => (
          <line key={`b-${x}`} x1={x} y1="404.5" x2={x} y2="419" style={{ stroke: AZUL_CLARO }} strokeOpacity={i === 0 || i === 10 ? 0.6 : 0.46} strokeWidth={i === 0 || i === 10 ? 1.2 : 0.8} />
        ))}
        <line x1="930.5" y1="404.2" x2="969.5" y2="404.2" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.68" strokeWidth="1.5" />
        <line x1="930.5" y1="410.6" x2="969.5" y2="410.6" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.34" strokeWidth="0.9" />
        <line x1="930.5" y1="416.8" x2="969.5" y2="416.8" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.4" strokeWidth="1" />
        {/* Piso de la linterna con moldura doble. */}
        <rect x="932.5" y="399" width="35" height="3.4" style={{ fill: AZUL }} />
        <rect x="933.6" y="402" width="32.8" height="1.5" style={{ fill: mezcla(AZUL, 70, "black") }} />
        <line x1="932.5" y1="399.4" x2="967.5" y2="399.4" stroke="white" strokeOpacity="0.18" strokeWidth="0.8" />
        {/* Linterna: el cristal completo (vidrio + óptica + reflejo) prende
            y apaga junto — por eso el data-linterna vive en el GRUPO. */}
        <g data-linterna>
          <rect x="935.5" y="371.5" width="29" height="27.5" fill="url(#qh2-vidrio)" />
          {/* Óptica: tambor de lente al centro, tres anillos sugeridos. */}
          <rect x="944.6" y="376.5" width="10.8" height="19" rx="1.4" fill="url(#qh2-lente)" />
          {[381.5, 388, 394.5].map((y) => (
            <line key={`l-${y}`} x1="945.4" y1={y} x2="954.6" y2={y} style={{ stroke: AZUL_CLARO }} strokeOpacity="0.5" strokeWidth="0.8" />
          ))}
          {/* Profundidad del vidrio: reflejo diagonal + sombra interior. */}
          <polygon points="937.2,371.5 946.4,371.5 940,399 935.5,399 935.5,382" fill="white" opacity="0.14" />
          <rect x="961.3" y="371.5" width="3.2" height="27.5" style={{ fill: AZUL }} opacity="0.15" />
        </g>
        {/* Estructura de la linterna: marcos horizontales + parantes. */}
        <line x1="934.4" y1="371.6" x2="965.6" y2="371.6" style={{ stroke: AZUL }} strokeWidth="1.6" />
        <line x1="934.4" y1="398.9" x2="965.6" y2="398.9" style={{ stroke: AZUL }} strokeWidth="1.6" />
        {[935.5, 945.2, 954.8, 964.5].map((x) => (
          <line key={`p-${x}`} x1={x} y1="371" x2={x} y2="399.4" style={{ stroke: AZUL }} strokeWidth={x === 935.5 || x === 964.5 ? 2.4 : 1.4} />
        ))}
        {/* Cornisa de la linterna. */}
        <rect x="932.8" y="368.4" width="34.4" height="3.1" rx="1.3" style={{ fill: AZUL }} />
        <rect x="932.8" y="368.4" width="34.4" height="1.1" rx="0.55" style={{ fill: AZUL_CLARO }} opacity="0.35" />
        {/* Cúpula de campana (perfil curvo, no un triángulo) + nervio. */}
        <path d="M932.5,368.4 C934,357.5 941.5,350.5 950,349.5 C958.5,350.5 966,357.5 967.5,368.4 Z" fill="url(#qh2-cupula)" />
        <path d="M950,350 L950,368" stroke="white" strokeOpacity="0.16" strokeWidth="0.9" />
        <path d="M935.2,368 C936.6,359.4 942.6,353.2 950,351.8" fill="none" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.3" strokeWidth="1" />
        {/* Rim-light derecho: la cúpula no se funde en silueta contra el
            halo — el perfil completo del domo sigue leyéndose de noche. */}
        <path d="M950,351.6 C957.6,352.8 963.6,358.8 965.2,367.6" fill="none" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.2" strokeWidth="1" />
        {/* Remate: tambor, mástil, esfera con brillo y aguja fina. */}
        <circle cx="950" cy="348.6" r="2.3" style={{ fill: AZUL }} />
        <rect x="949.1" y="335.5" width="1.8" height="13.5" rx="0.9" style={{ fill: AZUL }} />
        <circle cx="950" cy="333" r="2.5" style={{ fill: AZUL_CLARO }} opacity="0.9" />
        <circle cx="949.2" cy="332.2" r="0.8" fill="white" opacity="0.55" />
        <line x1="950" y1="330.6" x2="950" y2="327.8" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.7" strokeWidth="1" />
      </g>

      {/* ── La luz (apagada por defecto la maneja la coreografía) ──
          Sin feGaussianBlur: los filtros dentro de un grupo que ROTA en el
          scrub re-rasterizan la capa entera por frame. La penumbra del cono
          se construye apilando dos envolventes de opacidad decreciente
          (bordes escalonados deliberados, lenguaje flat de la escena). */}
      <g data-luz>
        {/* Dos ópticas: izquierda y derecha. La coreografía las alterna.
            NACIMIENTO: los conos ya no salen de un punto matemático — nacen
            del ANCHO del cristal (segmento vertical dentro de la linterna,
            a ±4px del foco), así la luz sale de toda la óptica. El segmento
            queda siempre dentro del vidrio para cualquier rotación del haz
            (radio máx ~13px < semiancho del cristal), y el mismo sistema de
            envolventes apiladas + rotación por svgOrigin queda intacto. */}
        <g data-haz="izq" mask="url(#qh2-haz-mask-izq)">
          <polygon points="946,376 -360,288 -360,644 946,400" fill="url(#qh2-haz-lat-izq)" />
          <polygon points="946,381 -360,415 -360,525 946,395" fill="url(#qh2-haz-lat-izq)" opacity="0.85" />
        </g>
        <g data-haz="der" opacity="0" mask="url(#qh2-haz-mask-der)">
          <polygon points="954,376 2260,288 2260,644 954,400" fill="url(#qh2-haz-lat-der)" />
          <polygon points="954,381 2260,415 2260,525 954,395" fill="url(#qh2-haz-lat-der)" opacity="0.85" />
        </g>
        <circle data-halo cx={FOCO_X} cy={FOCO_Y} r="64" fill="url(#qh2-halo)" />
        <circle data-nucleo cx={FOCO_X} cy={FOCO_Y} r="11" fill="url(#qh2-nucleo)" />
      </g>
    </svg>
  );
}

function CapaMarMedio() {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="qh2-reflejo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.11" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <filter id="qh2-blur-m" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      {DESTELLOS_MEDIO.map(([x, y, l, a]) => (
        <line key={`dm-${x}`} x1={x} y1={y} x2={x + l} y2={y} style={{ stroke: AZUL_CLARO }} strokeOpacity={a} strokeWidth="2" strokeLinecap="round" />
      ))}
      {/* Reflejos de la luz: columna del faro + espejo de la linterna. */}
      <g data-espejo>
        <rect x={FUGA_X - 12} y="690" width="24" height="150" fill="url(#qh2-reflejo)" filter="url(#qh2-blur-m)" />
        {ESPEJO.map(([y, l, a, dx]) => (
          <line key={`e-${y}`} x1={FUGA_X + dx - l / 2} y1={y} x2={FUGA_X + dx + l / 2} y2={y} style={{ stroke: AZUL_CLARO }} strokeOpacity={a} strokeWidth="2.6" strokeLinecap="round" />
        ))}
      </g>
      {/* Donde el haz toca el agua: un pulso por verbo + el rastro verde que
          queda (la luz pasó por acá y dejó una idea encendida). */}
      {PUNTOS_VERBO.map(([x, y], i) => (
        <g key={`v-${i}`}>
          <g data-verbo-punto={i} opacity="0">
            <ellipse cx={x} cy={y} rx="120" ry="26" fill="white" opacity="0.07" filter="url(#qh2-blur-m)" />
            <ellipse cx={x} cy={y} rx="44" ry="10" style={{ fill: AZUL_CLARO }} opacity="0.3" filter="url(#qh2-blur-m)" />
          </g>
          <circle data-rastro={i} cx={x} cy={y} r="3.2" style={{ fill: VERDE }} opacity="0" />
        </g>
      ))}
    </svg>
  );
}

function CapaMuelle() {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="qh2-tablado" gradientUnits="userSpaceOnUse" x1="690" y1="940" x2={FUGA_X} y2="548">
          <stop offset="0" style={{ stopColor: mezcla(AZUL, 46, "black") }} />
          <stop offset="0.75" style={{ stopColor: SILUETA }} />
          <stop offset="1" style={{ stopColor: mezcla(AZUL, 66, "black") }} />
        </linearGradient>
      </defs>
      {/* Tablado completo */}
      <polygon points={`${MUELLE.nearL} ${MUELLE.nearR} ${MUELLE.farR} ${MUELLE.farL}`} fill="url(#qh2-tablado)" />
      {/* Tablones: gaps oscuros comprimiéndose hacia la fuga */}
      {TABLONES.map((t) => {
        const [lx, ly] = lerp(MUELLE.nearL, MUELLE.farL, t);
        const [rx, ry] = lerp(MUELLE.nearR, MUELLE.farR, t);
        return (
          <line key={`t-${t}`} x1={lx} y1={ly} x2={rx} y2={ry} style={{ stroke: "black" }} strokeOpacity={0.34 - t * 0.18} strokeWidth={3.4 * (1 - t) + 0.7} />
        );
      })}
      {/* Cantos laterales apenas encendidos */}
      <line x1={MUELLE.nearL[0]} y1={MUELLE.nearL[1]} x2={MUELLE.farL[0]} y2={MUELLE.farL[1]} style={{ stroke: AZUL_CLARO }} strokeOpacity="0.16" strokeWidth="1.5" />
      <line x1={MUELLE.nearR[0]} y1={MUELLE.nearR[1]} x2={MUELLE.farR[0]} y2={MUELLE.farR[1]} style={{ stroke: AZUL_CLARO }} strokeOpacity="0.22" strokeWidth="1.5" />
      {/* La punta remata limpia contra la torre: con la costura clavada
          (la capa recibe el translate del faro), la oclusión cuenta la
          llegada — el camino termina EN el faro, sin piezas extra. */}
      {/* Postes con cabezal, a ambos lados */}
      {POSTES.map(([t, der]) => {
        const [x, y] = der ? lerp(MUELLE.nearR, MUELLE.farR, t) : lerp(MUELLE.nearL, MUELLE.farL, t);
        const alto = 64 * (1 - t * 0.88) + 8;
        const ancho = 15 * (1 - t * 0.72) + 3;
        const dx = der ? 2 : -ancho - 2;
        return (
          <g key={`po-${t}-${der}`}>
            <rect x={x + dx} y={y - alto} width={ancho} height={alto} rx={ancho * 0.22} style={{ fill: SILUETA }} />
            <rect x={x + dx - 1} y={y - alto - 3} width={ancho + 2} height={5} rx={2} style={{ fill: mezcla(AZUL, 62, "black") }} />
            <rect x={x + dx} y={y - alto - 3} width={ancho + 2} height={1.6} rx={0.8} style={{ fill: AZUL_CLARO }} opacity="0.32" />
          </g>
        );
      })}
      {/* Lavado tenue de la luz sobre el tramo final */}
      <polygon points={`${lerp(MUELLE.nearL, MUELLE.farL, 0.55)} ${lerp(MUELLE.nearR, MUELLE.farR, 0.55)} ${MUELLE.farR} ${MUELLE.farL}`} style={{ fill: AZUL_CLARO }} opacity="0.05" />
    </svg>
  );
}

function CapaForeground() {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="qh2-fg-poste" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: mezcla(AZUL, 38, "black") }} />
          <stop offset="0.55" style={{ stopColor: SILUETA }} />
          <stop offset="1" style={{ stopColor: mezcla(AZUL, 34, "black") }} />
        </linearGradient>
      </defs>
      {/* Dos postes grandes que sangran el borde inferior + cuerda entre ellos:
          el primer plano que vende la profundidad al avanzar. */}
      <g>
        <rect x="212" y="588" width="64" height="360" rx="10" fill="url(#qh2-fg-poste)" />
        <rect x="206" y="576" width="76" height="18" rx="6" style={{ fill: mezcla(AZUL, 55, "black") }} />
        <rect x="206" y="576" width="76" height="4" rx="2" style={{ fill: AZUL_CLARO }} opacity="0.3" />
      </g>
      <g>
        <rect x="1156" y="620" width="58" height="330" rx="9" fill="url(#qh2-fg-poste)" />
        <rect x="1151" y="609" width="68" height="16" rx="5" style={{ fill: mezcla(AZUL, 55, "black") }} />
        <rect x="1151" y="609" width="68" height="3.6" rx="1.8" style={{ fill: AZUL_CLARO }} opacity="0.28" />
      </g>
      {/* Cuerda catenaria entre postes */}
      <path d="M244,596 Q720,700 1185,630" fill="none" style={{ stroke: AZUL_MEDIO }} strokeOpacity="0.3" strokeWidth="2.4" />
      <path d="M244,596 Q720,700 1185,630" fill="none" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.1" strokeWidth="1" transform="translate(0,-2)" />
      {/* Borde de tablón inferior en sombra (se funde con el alba) */}
      <g data-fg-sombra>
        <rect x="0" y="864" width="1440" height="36" style={{ fill: mezcla(AZUL, 40, "black") }} />
        <line x1="0" y1="864" x2="1440" y2="864" style={{ stroke: AZUL_CLARO }} strokeOpacity="0.08" strokeWidth="1.4" />
      </g>
    </svg>
  );
}

/**
 * Stack de capas. Cada capa con bleed del 14% (puede crecer y desplazarse
 * sin mostrar bordes) y transform-origin en el punto de fuga. La cámara les
 * aplica scale/x/y vía GSAP según su Z (ver QueHacemosHeroFaro). SIN
 * will-change acá: la promoción a GPU (~30MB por capa full-viewport) la
 * activa la coreografía solo cuando corre — el fallback estático (mobile,
 * reduced-motion) no la paga.
 */
export function FaroEscena() {
  const capa =
    "pointer-events-none absolute -inset-[14%] [transform-origin:var(--qh-origen)]";
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{ "--qh-origen": ORIGEN_CSS } as React.CSSProperties}
    >
      <div data-capa="cielo" className={capa}>
        <CapaCielo />
        <VelosAlba />
      </div>
      <div data-capa="horizonte" className={capa}><CapaHorizonte /></div>
      <div data-capa="faro" className={capa}><CapaFaro /></div>
      <div data-capa="marMedio" className={capa}><CapaMarMedio /></div>
      <div data-capa="muelle" className={capa}><CapaMuelle /></div>
      <div data-capa="foreground" className={capa}><CapaForeground /></div>
    </div>
  );
}
