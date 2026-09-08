import gsap from "gsap";
import { CAPAS_Z } from "../faro-geometria";

const P = 1100; // distancia focal de la cámara imaginaria

// El muelle atraviesa profundidades (su punta toca el islote, su borde
// cercano casi pisa la cámara), pero la capa tiene UN solo Z: si se
// traslada en bloque, la punta se despega de la torre con cada lateral
// (paralaje de capa plana). Solución: la capa recibe el translate del
// FARO (punta soldada a la base, siempre) y el paralaje extra del
// tramo cercano lo pone una DEFORMACIÓN anclada en el punto de fuga
// (skewX para laterales, scaleY para verticales): el borde cercano
// barre, la punta no se mueve ni un píxel respecto del faro.
const MEZCLA_PARALAJE = 0.65; // cuánto del paralaje propio conserva el tramo cercano
const NEAR_Y = ((940 - 522) / 900) * 1.28; // borde cercano→fuga, en alturas de viewport

/**
 * La cámara: un proxy {z,x,y} animado por la línea de tiempo scrubbed;
 * cada frame se proyecta a cada capa con la fórmula de una cámara pinhole:
 *
 *   escala(Z)  = (P + Z) / (P + Z − camZ)      P = distancia focal
 *   despl.(Z)  = −camX · P / (P + Z − camZ)    (cerca se mueve más)
 *
 * Todo se expande desde el punto de fuga (transform-origin de las capas):
 * avanzar la cámara ES caminar el muelle hacia el faro. Paralaje correcto
 * sin preserve-3d (los filters/overflow no pueden aplanar nada).
 */
export function crearCamara(root: HTMLElement) {
  const cam = { z: -340, x: 0, y: 0 };
  // Entradas del mundo (S0→S1): offset vertical extra por capa, se suma
  // a la proyección para que el foreground ENTRE por el borde inferior.
  // El muelle NO desliza: está unido al faro y aparece con el mundo
  // (solo fade) — un muelle que viaja solo rompe la lectura espacial.
  const entrada = { foreground: 150, marMedio: 50 };

  // quickSetters cacheados: cero allocs por frame en el scrub.
  const capas = Array.from(
    root.querySelectorAll<HTMLElement>("[data-capa]"),
  ).map((el) => ({
    el,
    nombre: el.dataset.capa as keyof typeof CAPAS_Z,
    Z: CAPAS_Z[el.dataset.capa as keyof typeof CAPAS_Z],
    setX: gsap.quickSetter(el, "x", "px"),
    setY: gsap.quickSetter(el, "y", "px"),
    setS: gsap.quickSetter(el, "scale"),
    setSkX: gsap.quickSetter(el, "skewX", "deg"),
    setSY: gsap.quickSetter(el, "scaleY"),
  }));

  const aplicar = () => {
    const fFaro = P / (P + CAPAS_Z.faro - cam.z);
    const nearPx = NEAR_Y * window.innerHeight;
    for (const { nombre, Z, setX, setY, setS, setSkX, setSY } of capas) {
      const d = P + Z - cam.z;
      const f = P / d;
      setS((P + Z) / d);
      if (nombre === "muelle") {
        const dif = (f - fFaro) * MEZCLA_PARALAJE;
        setX(-cam.x * fFaro);
        setSkX((Math.atan2(-cam.x * dif, nearPx) * 180) / Math.PI);
        setY(-cam.y * fFaro);
        setSY(1 - (cam.y * dif) / nearPx);
      } else {
        setX(-cam.x * f);
        setY(-cam.y * f + ((entrada as Record<string, number>)[nombre] ?? 0) * f);
      }
    }
  };

  return { cam, entrada, capas, aplicar };
}

export type Camara = ReturnType<typeof crearCamara>;
