import { fondoNube, type Nube } from "./nubes";

const NUBES: ReadonlyArray<Nube> = [
  // En cuadro cuando llega la hoja: la cámara está metida en las nubes.
  { x: -14, y: 46, w: 72, h: 46, cerca: 1, giro: -3, silueta: "cumuloA" },
  { x: 42, y: 58, w: 74, h: 44, cerca: 0.92, giro: 2.5, silueta: "cumuloB" },
  { x: 12, y: 14, w: 56, h: 34, cerca: 0.7, giro: -1.5, silueta: "mediana" },
  { x: 58, y: 6, w: 52, h: 32, cerca: 0.62, giro: 3.5, silueta: "mediana" },
  { x: -10, y: -4, w: 42, h: 24, cerca: 0.3, giro: -1, silueta: "jiron" },
  { x: 30, y: 30, w: 44, h: 26, cerca: 0.35, giro: 1.5, silueta: "jiron" },
  { x: 66, y: 40, w: 46, h: 24, cerca: 0.25, giro: -2.5, silueta: "jiron" },
  // Esperan bajo el piso y van entrando a medida que la cámara baja.
  { x: 18, y: 88, w: 44, h: 24, cerca: 0.3, giro: 1, silueta: "jiron" },
  { x: 50, y: 100, w: 54, h: 32, cerca: 0.6, giro: -2.5, silueta: "mediana" },
  { x: 60, y: 118, w: 44, h: 24, cerca: 0.28, giro: -1.5, silueta: "jiron" },
  { x: 8, y: 120, w: 70, h: 44, cerca: 0.95, giro: 2, silueta: "cumuloA" },
  { x: 36, y: 135, w: 56, h: 34, cerca: 0.68, giro: 1.5, silueta: "mediana" },
  { x: -20, y: 150, w: 76, h: 46, cerca: 1, giro: -2, silueta: "cumuloB" },
  { x: 30, y: 185, w: 72, h: 44, cerca: 0.9, giro: 3, silueta: "cumuloA" },
  // La última: la banda. El faro sube adentro de ella y la lámpara se
  // enciende cuando se disuelve; su `y` está puesto para que llegue a la
  // linterna justo entonces (depende de DESCENSO, en coreografia-cierre.ts).
  { x: 2, y: 168, w: 92, h: 30, cerca: 0.3, giro: -2, silueta: "banda" },
];

/**
 * Las nubes: la capa más cercana. En primer plano, sobre el faro y bajo el
 * marco y el folio. Invisibles hasta que la coreografía las enciende: sin
 * ella (touch, reduced-motion) la hoja es el último frame y las nubes ya
 * pasaron.
 */
export function NubesCierre() {
  return (
    <div
      aria-hidden="true"
      data-cierre-nubes
      className="pointer-events-none invisible absolute inset-0 z-[32] hidden opacity-0 lg:block"
    >
      {NUBES.map((n) => (
        <span
          key={`n-${n.x}-${n.y}`}
          data-cierre-nube
          data-nube-cerca={n.cerca}
          data-nube-giro={n.giro}
          className="absolute block"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: `${n.w}%`,
            height: `${n.h}%`,
            backgroundImage: fondoNube(n),
          }}
        />
      ))}
    </div>
  );
}
