import gsap from "gsap";
import { altoViewport, anchoDocumento } from "@/lib/viewport";
import { AIRE_TITULO, CAMARA, NODOS, PERSPECTIVAS } from "./constelacion-mirada";
import { crearIndicador, type Escena } from "./setup-estados";

/**
 * Timeline maestro (14 unidades sobre toda la zona), atado al scroll de
 * `zone`. Parte de los estados que dejó `prepararEstados`. Vive dentro del
 * `gsap.context` del compositor, que lo revierte.
 */
export function crearTimelineFases(e: Escena, zone: HTMLElement) {
  const { q, qa, centro, sintesis, detalles, capasCamara, puentes, dots } = e;
  const { nodoCores, nodoHalos, nodoNums, nodoLabels, strikes, fichaGrupos } = e;
  const { lineas, arcos, ramas, ramdots } = e;

  // clientWidth (sin scrollbar): la cámara aterriza donde el usuario ve.
  const W = anchoDocumento;
  const H = altoViewport;
  const setDot = crearIndicador(dots);

  // scrub NUMÉRICO: cada muesca de rueda avanza el scroll a saltos
  // discretos; con scrub:true la timeline saltaba con él (el "trabado").
  // 1s de catch-up convierte cada muesca en un deslizamiento largo y
  // untuoso sin desconectar del usuario.
  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    scrollTrigger: {
      trigger: zone,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => setDot(self.progress),
    },
  });

  // FASE 0 — el mapa se presenta: núcleo, líneas, nodos.
  // Clamp global de fichas al entrar a la zona (misma autocura que el
  // clamp por fase, para el tramo del mapa antes de la fase 1).
  tl.set(qa("[data-ficha]"), { autoAlpha: 0 }, 0.06);
  tl.to(qa("[data-centro-bit]"), { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.12, ease: "power3.out" }, 0.1);
  lineas.forEach((p, i) => {
    tl.to(
      p,
      { strokeDashoffset: 0, duration: 0.55, ease: "power2.out" },
      0.35 + AIRE_TITULO + i * 0.12,
    );
  });
  tl.to(
    nodoCores,
    { autoAlpha: 0.6, scale: 1, duration: 0.4, stagger: 0.12, ease: "power3.out" },
    0.55 + AIRE_TITULO,
  );
  tl.to(arcos, { autoAlpha: 0.12, duration: 0.35 }, 0.85 + AIRE_TITULO);

  // Núcleo se retira antes del primer acercamiento.
  tl.to(centro, { autoAlpha: 0, duration: 0.28 }, 1.02 + AIRE_TITULO);

  // FASES 1-5 — acercamiento, revelado y salida de cada principio.
  PERSPECTIVAS.forEach((p, i) => {
    const S = 1.3 + AIRE_TITULO + i * 2.15;
    const cam = CAMARA[i];
    const nodo = NODOS[i];

    // Cámara: el nodo activo aterriza en la zona izquierda de lectura.
    tl.to(
      capasCamara,
      {
        scale: cam.scale,
        x: () => cam.tx * W() - cam.scale * (nodo.x / 100) * W(),
        y: () => cam.ty * H() - cam.scale * (nodo.y / 100) * H(),
        duration: 0.55,
      },
      S,
    );

    // Estados del sistema: el activo manda; los recorridos quedan como
    // memoria tenue y los futuros apenas insinuados (no compiten con la
    // zona de lectura). El color solo no identifica al activo.
    nodoCores.forEach((core, j) => {
      const target = j === i ? 1 : j < i ? 0.38 : 0.12;
      tl.to(core, { autoAlpha: target, scale: j === i ? 1.08 : 1, duration: 0.3 }, S + 0.22);
    });
    // Nodo activo: halo pre-pintado (solo opacity, compositado) + número.
    if (nodoHalos[i]) tl.to(nodoHalos[i], { autoAlpha: 1, duration: 0.3 }, S + 0.22);
    tl.to(nodoNums[i], { color: p.accent, duration: 0.3 }, S + 0.22);
    tl.to(lineas[i], { stroke: p.accent, opacity: 1, duration: 0.35 }, S + 0.22);
    // Las líneas ajenas casi se apagan: que no crucen la lectura.
    lineas.forEach((l, j) => {
      if (j !== i) tl.to(l, { opacity: j < i ? 0.28 : 0.12, duration: 0.3 }, S + 0.22);
    });
    tl.to(arcos, { autoAlpha: 0.07, duration: 0.3 }, S + 0.22);

    // Zona de lectura (derecha).
    const inner = detalles[i].querySelector<HTMLElement>("[data-detalle-inner]");
    if (inner) {
      tl.fromTo(
        inner,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out" },
        S + 0.5,
      );
    }
    if (strikes[i]) {
      tl.to(strikes[i], { scaleX: 1, duration: 0.4, ease: "power2.out" }, S + 0.85);
    }
    // Subrayado editorial (03): se dibuja izq→der con el scroll.
    const under = detalles[i].querySelector<HTMLElement>("[data-afirma-underline]");
    if (under) tl.to(under, { scaleX: 1, duration: 0.45, ease: "power2.out" }, S + 0.9);

    // Fichas: entran de a una en la pila, con el scroll, y se quedan.
    // Entrada corta (0.12 u ≈ 65px, menos de una muesca de rueda): como
    // mucho una a medias en cualquier parada, y nunca translúcida por
    // mucho scroll. Se apagan juntas cuando se repliega la lectura
    // (S+1.88), antes del cambio de cámara (S+2.15).
    const E0 = 0.4;
    const STEP = 0.24;
    const items = gsap.utils.toArray<HTMLElement>("[data-ficha]", fichaGrupos[i]);
    // CLAMP de pre-nacimiento: al abrirse la fase se re-asegura el estado
    // oculto de TODAS sus fichas. El set inicial del mount puede ser
    // pisado por agentes externos (Fast Refresh en dev, hidratación);
    // sin este clamp, las fichas que esperan turno quedaban VISIBLES,
    // clavadas en su punto de nacimiento (el síntoma "trabado" del
    // 23-jul). Dentro del timeline es reversible y se auto-cura.
    tl.set(items, { autoAlpha: 0, y: 12 }, S + 0.02);
    items.forEach((f, k) => {
      tl.to(f, { autoAlpha: 1, y: 0, duration: 0.12, ease: "power2.out" }, S + E0 + k * STEP);
    });
    tl.to(items, { autoAlpha: 0, y: -8, duration: 0.18, ease: "power1.in" }, S + 1.88);

    // Salida: lectura se repliega; el halo del activo se apaga y el nodo
    // queda como memoria (recorrido).
    if (inner) tl.to(inner, { autoAlpha: 0, y: -16, duration: 0.24 }, S + 1.9);
    if (nodoHalos[i]) tl.to(nodoHalos[i], { autoAlpha: 0, duration: 0.25 }, S + 1.92);
    tl.to(nodoCores[i], { autoAlpha: 0.78, scale: 1, duration: 0.25 }, S + 1.92);
    tl.to(lineas[i], { opacity: 0.55, duration: 0.25 }, S + 1.92);
  });

  // FASE 6 — MOMENTO A: regreso al mapa y la síntesis SOLA, con foco
  // absoluto. El sistema queda como huella: puntos con su acento,
  // labels casi apagados, líneas finísimas (la naranja no cruza más el
  // texto a plena intensidad).
  tl.to(capasCamara, { x: 0, y: 0, scale: 1, duration: 0.6 }, 7.75 + AIRE_TITULO);
  tl.to(nodoCores, { autoAlpha: 0.8, duration: 0.35 }, 8.05 + AIRE_TITULO);
  tl.to(nodoLabels, { autoAlpha: 0.18, duration: 0.35 }, 8.05 + AIRE_TITULO);
  tl.to(nodoNums, { autoAlpha: 0.35, duration: 0.35 }, 8.05 + AIRE_TITULO);
  tl.to(lineas, { opacity: 0.22, duration: 0.35 }, 8.05 + AIRE_TITULO);
  tl.to(arcos, { autoAlpha: 0.1, duration: 0.35 }, 8.05 + AIRE_TITULO);
  tl.to(sintesis, { autoAlpha: 1, duration: 0.45 }, 8.5 + AIRE_TITULO);
  tl.fromTo(
    q("[data-sintesis-frase]"),
    { autoAlpha: 0, y: 22 },
    { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
    8.55 + AIRE_TITULO,
  );

  // FASE 7 — MOMENTO B: el sistema cede aún más (niebla marfil detrás
  // del texto), la síntesis achica apenas su presencia y recién entonces
  // entra el puente. Las ramas dibujan la red incipiente ALREDEDOR del
  // campo de lectura (la niebla protege el centro).
  const fog = q("[data-sintesis-fog]");
  if (fog) tl.to(fog, { autoAlpha: 1, duration: 0.45 }, 9.6 + AIRE_TITULO);
  tl.to(q("[data-sintesis-frase]"), { scale: 0.97, y: -14, duration: 0.45 }, 9.6 + AIRE_TITULO);
  tl.to(nodoCores, { autoAlpha: 0.35, duration: 0.4 }, 9.6 + AIRE_TITULO);
  tl.to(nodoLabels, { autoAlpha: 0.08, duration: 0.4 }, 9.6 + AIRE_TITULO);
  tl.to(lineas, { opacity: 0.12, duration: 0.4 }, 9.6 + AIRE_TITULO);
  ramas.forEach((r, k) => {
    tl.to(
      r,
      { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" },
      9.75 + AIRE_TITULO + k * 0.04,
    );
  });
  tl.to(
    ramdots,
    { scale: 1, autoAlpha: 1, duration: 0.25, stagger: 0.03, ease: "power2.out" },
    9.95 + AIRE_TITULO,
  );
  // Sin indices: el puente quedo en un solo parrafo y targetear puentes[1]
  // dejaria a GSAP buscando un elemento que ya no existe.
  tl.to(puentes, { autoAlpha: 1, y: 0, duration: 0.4 }, 10.3 + AIRE_TITULO);
  tl.to({}, { duration: 0.85 }, 11.15 + AIRE_TITULO); // respiro antes de soltar el pin
  setDot(0);
  return tl;
}
