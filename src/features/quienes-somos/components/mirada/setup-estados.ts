import gsap from "gsap";
import { altoViewport, anchoDocumento } from "@/lib/viewport";
import { BOUNDS, CAMARA, FASE_COLOR } from "./constelacion-mirada";

/**
 * Lee las piezas de la escena por data-attribute, acotadas a `root` (evita
 * colisiones con data-attrs de otras secciones). Nulo si falta alguna clave.
 */
export function leerEscena(root: HTMLElement) {
  const q = (sel: string) => root.querySelector<HTMLElement>(sel);
  const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);
  const stage = q("[data-stage]");
  const stageLineas = q("[data-stage-lineas]");
  const centro = q("[data-centro]");
  const sintesis = q("[data-sintesis]");
  const detalles = qa("[data-detalle]");
  if (!stage || !stageLineas || !centro || !sintesis || detalles.length !== 3) return null;
  return {
    q,
    qa,
    stage,
    stageLineas,
    centro,
    sintesis,
    detalles,
    // Las dos capas del escenario reciben la MISMA cámara (ver el JSX).
    capasCamara: [stageLineas, stage],
    puentes: qa("[data-puente]"),
    dots: qa("[data-mirada-dot]"),
    nodoCores: qa("[data-nodo-core]"),
    nodoHalos: qa("[data-nodo-halo]"),
    nodoNums: qa("[data-nodo-num]"),
    nodoLabels: qa("[data-nodo-label]"),
    strikes: qa("[data-strike]"),
    fichaGrupos: qa("[data-fichas]"),
    lineas: gsap.utils.toArray<SVGPathElement>("[data-linea]", root),
    arcos: gsap.utils.toArray<SVGPathElement>("[data-arco]", root),
    ramas: gsap.utils.toArray<SVGPathElement>("[data-rama]", root),
    ramdots: gsap.utils.toArray<SVGCircleElement>("[data-ramdot]", root),
  };
}

export type Escena = NonNullable<ReturnType<typeof leerEscena>>;

/**
 * Estados iniciales (solo con motion): posicionamiento imperativo de cámara,
 * zona de lectura, capas y nodos. Es el DUEÑO de la posición de las fichas:
 * cada grupo queda como pila fija bajo su nodo (ver el bloque de fichas).
 */
export function prepararEstados(e: Escena) {
  const { q, qa, stage, stageLineas, centro, sintesis, detalles, capasCamara } = e;
  const { puentes, nodoCores, nodoHalos, strikes, fichaGrupos, lineas, arcos, ramas, ramdots } = e;

  // clientWidth (sin scrollbar): la cámara aterriza donde el usuario ve.
  const W = anchoDocumento;
  const H = altoViewport;

  gsap.set(capasCamara, { transformOrigin: "0 0" });
  gsap.set([centro, sintesis], { position: "absolute", inset: 0 });
  gsap.set(sintesis, { autoAlpha: 0 });
  const fogInit = q("[data-sintesis-fog]");
  if (fogInit) gsap.set(fogInit, { autoAlpha: 0 });
  gsap.set(qa("[data-centro-bit]"), { autoAlpha: 0, y: 22 });
  gsap.set(puentes, { autoAlpha: 0, y: 18 });

  // Detalles: zona de lectura derecha (viewport-anclada, no escala).
  detalles.forEach((d) => {
    gsap.set(d, { position: "absolute", inset: 0, pointerEvents: "none" });
    const inner = d.querySelector<HTMLElement>("[data-detalle-inner]");
    if (inner) {
      gsap.set(inner, {
        position: "absolute",
        left: "auto",
        right: "6vw",
        top: "50%",
        yPercent: -50,
        width: "min(32vw, 26rem)",
        textAlign: "left",
        margin: 0,
        autoAlpha: 0,
      });
    }
  });
  gsap.set(strikes, { scaleX: 0, transformOrigin: "left center" });
  gsap.set(qa("[data-afirma-underline]"), { scaleX: 0, transformOrigin: "left center" });

  // Capas: líneas (3) < fichas (5) < nodos (10) < contenido (20). Las
  // fichas tapan limpias cualquier línea que cruce por detrás y siguen
  // pasando POR DETRÁS del rótulo del nodo. Antes el escenario era UNA
  // capa por encima de las fichas y las líneas se dibujaban sobre ellas
  // (se veía como bug; Mateo, 2026-09-02).
  gsap.set(stageLineas, { zIndex: 3 });
  gsap.set(stage, { zIndex: 10 });
  gsap.set(fichaGrupos, { zIndex: 5 });
  gsap.set([...detalles, centro, sintesis], { zIndex: 20 });

  // Fichas: PILA FIJA bajo el nodo activo (02-sep). Antes eran una
  // "corriente" que nacía abajo, subía por un carril y salía por arriba,
  // atada al scroll: a ritmo de lectura quedaban congeladas a medias, la
  // huella al 10% parecía una ficha rota y el carril cruzaba la altura
  // del rótulo del nodo (una ficha se montaba sobre «Transformación
  // educativa»). Ahora cada grupo es una columna estática que arranca
  // debajo del rótulo (la cámara deja el nodo en CAMARA[i]); las fichas
  // entran de a una, con el scroll, y se QUEDAN hasta que la fase
  // cierra. Nada se mueve mientras se lee y nada cruza nada: a la
  // derecha de la pila queda la zona de lectura (desde ~0.62W) y el
  // único nodo en pantalla durante una fase es el activo.
  fichaGrupos.forEach((g, i) => {
    const cam = CAMARA[i];
    gsap.set(g, {
      position: "absolute",
      // right/bottom explícitos, no el shorthand inset: GSAP aplica
      // `inset: auto` después de left/top y los pisa (medido: la pila
      // quedaba en la esquina 0,0).
      right: "auto",
      bottom: "auto",
      left: cam.tx * W() + 28,
      top: cam.ty * H() + 54,
      width: "auto",
      padding: 0,
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: "0.55rem",
      pointerEvents: "none",
    });
    gsap.set(gsap.utils.toArray<HTMLElement>("[data-ficha]", g), {
      position: "static",
      maxWidth: "12.5rem",
      autoAlpha: 0,
      y: 12,
    });
  });
  // (Sin "respiración": el vaivén infinito de ±5px del grupo, pensado
  // para que las fichas detenidas no se sintieran muertas, sobre una
  // ficha translúcida reforzaba la sensación de glitch. Con fichas
  // opacas y salidas cortas, quietas están bien.)

  // Nodos: nacen apagados y chicos; líneas sin dibujar; ramas ocultas.
  // El origin va en el centro del PUNTO (7px): al escalar, el punto
  // queda clavado al extremo de su línea y el label crece hacia afuera.
  gsap.set(nodoCores, { autoAlpha: 0, scale: 0.6, transformOrigin: "7px 50%" });
  gsap.set(nodoHalos, { autoAlpha: 0 });
  [...lineas, ...ramas].forEach((p) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
  });
  gsap.set(arcos, { autoAlpha: 0 });
  gsap.set(ramdots, { scale: 0, transformOrigin: "center", autoAlpha: 0 });
}

/**
 * Indicador de progreso (mapa · 01 · 02 · 03 · síntesis). Devuelve el setter
 * que el timeline llama en cada `onUpdate`; solo tweenea cuando cambia el
 * momento activo. Sus tweens nacen fuera del `gsap.context` (async), así que
 * el compositor los mata a mano en el cleanup.
 */
export function crearIndicador(dots: HTMLElement[]) {
  let lastIdx = -1;
  return (p: number) => {
    let idx = 0;
    for (let i = 0; i < BOUNDS.length; i++) if (p >= BOUNDS[i]) idx = i + 1;
    if (idx === lastIdx) return;
    lastIdx = idx;
    dots.forEach((d, i) => {
      gsap.to(d, {
        width: i === idx ? 26 : 8,
        backgroundColor: i === idx ? FASE_COLOR[idx] : "rgba(31,45,77,0.18)",
        duration: 0.35,
        ease: "power2.out",
      });
    });
  };
}
