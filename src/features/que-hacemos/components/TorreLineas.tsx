"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TAMBORES } from "../data";
import { getLenis } from "@/lib/lenis";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * La torre de tambores — el "espiral" de Qué hacemos (referencia Noomo).
 *
 * Todo el contenido de la página vive en una torre de cilindros de texto:
 * cada tambor lleva su nombre envuelto alrededor (rebanado en caracteres
 * posicionados con rotateY(θ)·translateZ(R), CSS 3D puro, sin WebGL). El
 * scroll hace dos cosas a la vez: TRASLADA la torre verticalmente (viajás de
 * tambor en tambor, viendo asomar el siguiente desde abajo) y hace GIRAR
 * cada tambor sobre su eje, cada uno con su desfase para que no roten en
 * bloque. La cara trasera se ve espejada y "esmerilada" (color transparent +
 * text-shadow — filter blur a 60fps pincharía).
 *
 * Geometría: radio ÚNICO para toda la torre (es una sola torre, como la
 * referencia); cada tambor ajusta tamaño de letra y repeticiones del nombre
 * para que su vuelta cierre exacta en esa circunferencia.
 *
 * Los textos de apoyo (título oficial + frase verde + detalle) NO viajan con
 * los tambores: viven en ranuras fijas al pie y se cruzan (crossfade +
 * textContent, sin re-render de React) cuando cambia el tambor activo. La
 * FOTO sí viaja: cuelga del centro de su tambor y sube con la torre, con un
 * parallax leve que la deja un toque atrás. Probamos apilarlas quietas en el
 * eje de cámara y encenderlas por distancia, pero sin recorrido el cambio de
 * imagen se lee como un parpadeo.
 *
 * Performance: solo se pintan los tambores en cuadro (los demás quedan
 * visibility:hidden); por frame se escriben ~2 transforms + las opacidades
 * de las rebanadas visibles.
 *
 * Mobile / touch / prefers-reduced-motion: bloques planos apilados.
 */

const SEP = "  •  ";
const ANCHO_CHAR = 0.62; // ancho promedio (em) de Manrope extrabold mayúsculas
const F_MAX = 148;
const SVH_POR_TAMBOR = 130; // cuánto scroll dura cada estación de la torre
// ARRANQUE del viaje: los primeros ARRANQUE_SVH de scroll de la zona no
// mueven la torre. Es el respiro entre que el tambor cierra y empieza a
// viajar: quien viene empujando la rueda durante el armado no se lo lleva
// girando en el mismo frame en que se suelta el bloqueo. Corto a propósito
// (dos o tres muescas): con 100svh se sentía como si el scroll siguiera
// trabado ("tarda en dejarme scrollear"); sin nada, el tambor se iba a la
// izquierda antes de verse quieto (Mateo, 2026-09-02).
const ARRANQUE_SVH = 40;
const ZONA_SVH = TAMBORES.length * SVH_POR_TAMBOR + ARRANQUE_SVH;
/** Fracción del recorrido de la zona (alto − 100svh) que ocupa el arranque. */
const ARRANQUE = ARRANQUE_SVH / (ZONA_SVH - 100);
// Ángulos de los chips de frase sobre la banda (3 por tambor, repartidos).
const CHIP_ANGS = [40, 160, 280];
// Giro total de la torre a lo largo del recorrido. Antes 560°: un scroll
// rápido volvía molinete el texto. Con 300° cada estación gira ~50°.
const GIRO_TOTAL = 300;
// SIN deriva en reposo. Había un giro continuo en sentido de lectura
// (2.5°/s, "letrero luminoso"); con el scroll frenado durante el armado uno
// se queda mirando el tambor y la deriva se llevaba el principio del nombre
// hacia la izquierda: a los pocos segundos se leía «…OLLO PROFESIONAL».
// Ahora el tambor gira SOLO con el scroll y se queda donde lo dejás, con el
// nombre alineado (pedido de Mateo, 2026-09-02).
// Ángulo donde se planta la PRIMERA letra del nombre cuando llegás a una
// estación: al borde izquierdo del arco legible, para leer desde el
// principio. Al scrollear, el resto del nombre entra por la derecha.
const ALINEA = -46;

/** `angs[j]` = ángulo de la rebanada j (no hay paso uniforme, ver abajo). */
type GeoTambor = { f: number; angs: number[]; slices: string[] };
type Geo = { r: number; sp: number; alto: number; drums: GeoTambor[] };

/**
 * Ancho real de cada carácter, medido con la tipografía de verdad.
 *
 * Antes el ángulo entre letras era UNIFORME (360/n) y el tamaño de fuente
 * salía de un ancho promedio. Pero las mayúsculas de Manrope no miden lo
 * mismo: en palabras con muchas letras anchas —"SISTEMAS EDUCATIVOS" es casi
 * toda S, M, E, D, U, C, A, O— cada glifo pide más arco del que le tocaba y
 * se solapan; en las angostas, al revés, quedan huecos.
 *
 * Se mide una vez por sesión y se cachea. Si la fuente todavía no cargó, el
 * fallback promedio deja el comportamiento anterior y `document.fonts.ready`
 * dispara un recálculo.
 */
const anchoCache = new Map<string, number>();
function medirChar(ch: string): number {
  const hit = anchoCache.get(ch);
  if (hit !== undefined) return hit;
  let ancho = ANCHO_CHAR;
  if (typeof document !== "undefined") {
    const cv = (medirChar as { _cv?: HTMLCanvasElement })._cv ??
      ((medirChar as { _cv?: HTMLCanvasElement })._cv = document.createElement("canvas"));
    const cx = cv.getContext("2d");
    if (cx) {
      cx.font = '800 100px Manrope, system-ui, sans-serif';
      ancho = cx.measureText(ch).width / 100;
    }
  }
  anchoCache.set(ch, ancho);
  return ancho;
}

function calcularGeo(w: number, h: number): Geo {
  const r = Math.min(w * 0.36, 540);
  const circ = 2 * Math.PI * r;
  const drums = TAMBORES.map((t) => {
    const base = (t.tambor + SEP).toUpperCase();
    const anchoBase = Array.from(base).reduce((acc, ch) => acc + medirChar(ch), 0);
    // Repeticiones para que la letra no pase de F_MAX al cerrar la vuelta.
    const k = Math.max(1, Math.ceil(circ / (F_MAX * anchoBase)));
    const slices = Array.from(base.repeat(k));
    const anchos = slices.map(medirChar);
    const total = anchos.reduce((a2, b2) => a2 + b2, 0);
    const f = Math.min(F_MAX, circ / total);
    // Cada rebanada se lleva el arco que su glifo necesita: se le asigna el
    // ángulo del CENTRO de su tramo, así ninguna pisa a la vecina.
    let acum = 0;
    const angs = anchos.map((an) => {
      const centro = acum + an / 2;
      acum += an;
      return (centro / total) * 360;
    });
    return { f, angs, slices };
  });
  // Separación entre tambores: lo justo para que el siguiente asome desde
  // abajo mientras el activo está al frente — a mitad de viaje los dos se
  // ven a la vez, sin vacío entre medio (continuidad de torre).
  return { r, sp: Math.max(370, h * 0.46), alto: h, drums };
}

export function TorreLineas() {
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const towerRef = useRef<HTMLDivElement | null>(null);
  const drumRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spanRefs = useRef<(HTMLSpanElement | null)[][]>([]);
  const fotoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chipRefs = useRef<(HTMLDivElement | null)[][]>([]);
  const aroRefs = useRef<(HTMLDivElement | null)[][]>([]);
  const pulsos = useRef<number[]>([]); // latido elástico por tambor (escala extra)
  const tituloRef = useRef<HTMLParagraphElement | null>(null);
  const fraseRef = useRef<HTMLParagraphElement | null>(null);
  const detalleRef = useRef<HTMLParagraphElement | null>(null);
  const apoyoRef = useRef<HTMLDivElement | null>(null);
  const railRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const pctRef = useRef<HTMLSpanElement | null>(null);
  const veloRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();
  const [live, setLive] = useState(false);
  const [geo, setGeo] = useState<Geo | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;
    // 1024, no 768: el tambor necesita ancho para que el título envuelto se
    // lea. En tablet salía cortado contra los bordes, el rótulo se montaba
    // sobre la foto y la escena quedaba ilegible. Abajo de eso va la lista.
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    setLive(true);
  }, [reduced]);

  useIsomorphicLayoutEffect(() => {
    if (!live) return;
    const medir = () => setGeo(calcularGeo(window.innerWidth, window.innerHeight));
    medir();
    // Los anchos se miden con canvas: si Manrope todavía no cargó, la primera
    // pasada usa la fuente de fallback y los ángulos quedan mal repartidos.
    // Al resolverse fonts.ready se limpia el cache y se recalcula.
    let vivo = true;
    document.fonts?.ready.then(() => {
      if (!vivo) return;
      anchoCache.clear();
      medir();
    });
    window.addEventListener("resize", medir);
    return () => {
      vivo = false;
      window.removeEventListener("resize", medir);
    };
  }, [live]);

  useIsomorphicLayoutEffect(() => {
    if (!live || !geo) return;
    const zone = zoneRef.current;
    const stage = stageRef.current;
    const tower = towerRef.current;
    if (!zone || !stage || !tower) return;

    const n = TAMBORES.length;
    const ocultos: boolean[] = TAMBORES.map(() => false);
    let activo = 0;
    let enCuadro = false;
    const avance = { p: 0 };

    // FASE por tambor: al llegar a la estación i (p = i/(n-1)) la primera
    // letra del nombre cae en ALINEA. Reemplaza al desfase arbitrario de
    // antes (i·47), que te dejaba leyendo desde la mitad.
    // El giro por scroll va con signo NEGATIVO: bajando, las letras del
    // frente corren hacia la izquierda, que es el sentido en que se lee.
    // Antes iba al revés y el nombre te escapaba; se leía mejor subiendo.
    const fase = TAMBORES.map(
      (_, i) => ALINEA - geo.drums[i].angs[0] + (i / (n - 1)) * GIRO_TOTAL,
    );
    // Sin deriva no hace falta asentado: en cada estación el nombre queda
    // alineado por construcción.
    const rotDe = (i: number, pv: number) => fase[i] - pv * GIRO_TOTAL;

    // ARMADO: el primer tambor se CONSTRUYE sobre la superficie que emerge
    // del blanco. Nace como una LÍNEA recta legible (el nombre entero,
    // quieto, a escala reducida) y después se ENROLLA hasta cerrar el
    // cilindro. Así el usuario lee qué es antes de que se vuelva objeto.
    //
    // RELEVO CON EL FARO. La sección se mete SOLAPE_SVH por debajo del faro
    // (ver el -mt del <section>) y pinta POR ENCIMA (z-20 contra z-10). La
    // zona arranca justo donde el faro termina su línea de tiempo con la
    // pantalla en blanco; desde ahí y durante una pantalla el escenario del
    // faro se desliza fuera de cuadro TAPADO por este escenario, que entra
    // opaco pero cubierto por un VELO BLANCO propio: mismo blanco en que
    // termina el faro, relevo invisible, y nada se ve mover. De ese blanco
    // emergen POR TIEMPO la superficie gris con su trama y después el
    // tambor (ver `armar`): el usuario que frena en el blanco ve nacer la
    // sección sin tener que empujar la rueda. (Se probó disolver el velo
    // por scroll y quedaba peor: quien se detiene en el blanco no ve nada.)
    // El viaje de la torre arranca ARRANQUE_SVH después del inicio de la
    // zona (ver la constante). Antes descontaba el solape entero (100svh)
    // para que quien scrolleaba durante el velo no se perdiera el tambor
    // 01; con el scroll frenado mientras se arma eso ya no puede pasar.

    // El armado NO va scrubbeado: corre SOLO, por tiempo, en cuanto la zona
    // arranca (= el faro terminó en blanco). Atado al scroll obligaba a ir
    // empujando la rueda para verlo construirse; así el remate del flash se
    // reproduce como animación y el scroll queda libre para viajar la
    // torre. Si el usuario vuelve arriba, se rearma para la próxima pasada.
    // Secuencia (por tiempo, en segundos desde el blanco). Los pasos se
    // SOLAPAN y van en seno: cada cosa empieza a aparecer mientras la
    // anterior todavía termina, así no hay escalones.
    //   velo  0.0→1.2  el velo blanco se disuelve: la superficie gris y su
    //                  trama de puntos EMERGEN del blanco (el ojo descansa)
    //   linea 0.7→1.2  el nombre en UNA línea, quieto, legible
    //   apoyo 1.0→1.5  la tarjeta de apoyo abajo (nombre arriba, explicación
    //                  abajo, antes de que nada gire)
    //   rollo 1.4→3.0  la línea se enrolla hasta el tubo y crece a escala 1,
    //                  al ritmo ORIGINAL (1.6 s): en 1.0 s se leía como un
    //                  barrido hacia la izquierda, no como una transformación
    //   foto  2.2→3.0  el disco nace en el centro cuando ya hay "adentro"
    //   chips 3.05→3.65 las frases sobre la banda, con el tubo YA cerrado:
    //                  mientras se enrolla el div no gira, y un chip que
    //                  asome antes aparece en otro ángulo y salta al cerrar
    // 3.65 s en total (antes 4.9): se acortaron las esperas (velo, línea),
    // no la transformación. El scroll hacia abajo queda frenado hasta el
    // final (onComplete): se probó soltarlo al cerrar el tubo y no gustó,
    // la animación tiene que terminar antes de que el scroll vuelva.
    const build = { velo: 1, linea: 0, apoyo: 0, rollo: 0, foto: 0, chips: 0 };
    let buildAnim: gsap.core.Timeline | null = null;
    // Transform final de cada tambor escrito UNA vez (i>0: al primer frame;
    // i=0: al cerrar el rollo). Se limpia al rearmar.
    const fijado: boolean[] = TAMBORES.map(() => false);
    const resetBuild = () => {
      build.velo = 1;
      build.linea = build.apoyo = build.rollo = build.foto = build.chips = 0;
      fijado[0] = false;
    };
    // El armado y su rebobinado se disparan desde un ScrollTrigger PROPIO
    // (más abajo), no desde pintar(): pintar() solo corre mientras la zona
    // está activa, así que una vez armado nada lo devolvía a cero y la torre
    // quedaba visible y montada desde antes del flash — los tambores
    // aparecían subiendo desde abajo en vez de nacer de la luz.
    // SCROLL HACIA ABAJO BLOQUEADO mientras se arma. El armado corre por
    // tiempo, y hasta acá quien seguía empujando la rueda se llevaba la
    // torre de viaje con el tambor a medio enrollar, o se pasaba de largo.
    // Ahora, al entrar desde arriba: se clava el scroll al comienzo de la
    // zona (eso también corta la inercia de Lenis) y se tragan la rueda y
    // las teclas que BAJAN; recién cuando terminó el armado entero
    // (onComplete) el scroll vuelve. Hacia ARRIBA queda libre (pedido de
    // Mateo, 2026-09-02): quien se arrepiente vuelve al faro, y al cruzar
    // el borde onLeaveBack rebobina y suelta. Entrando desde abajo no se
    // bloquea: ahí el tambor 01 ni siquiera está en cuadro.
    // Los listeners van en CAPTURA sobre window y cortan la propagación:
    // así el evento no llega a Lenis (que escucha en burbuja) ni al scroll
    // nativo. Clavar va diferido un frame: onEnter corre adentro de
    // ScrollTrigger.update, y Lenis emite scroll al mover.
    const TECLAS_ABAJO = new Set([" ", "PageDown", "ArrowDown", "End"]);
    const tragar = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    const frenarTecla = (e: KeyboardEvent) => {
      // Shift+Espacio sube: se deja pasar.
      if (TECLAS_ABAJO.has(e.key) && !(e.key === " " && e.shiftKey)) tragar(e);
    };
    const frenarRueda = (e: WheelEvent) => {
      if (e.deltaY > 0) tragar(e);
    };
    let bloqueado = false;
    let rafBloqueo = 0;
    const bloquear = () => {
      rafBloqueo = 0;
      if (bloqueado) return;
      bloqueado = true;
      window.addEventListener("keydown", frenarTecla, { capture: true });
      window.addEventListener("wheel", frenarRueda, { capture: true, passive: false });
      // +2px: en el borde exacto (progreso 0) ScrollTrigger da la zona por
      // inactiva y apagaría el escenario. El faro ya terminó en blanco y
      // este escenario lo tapa opaco, así que el salto no se ve.
      const top = zone.getBoundingClientRect().top + window.scrollY + 2;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
      else window.scrollTo(0, top);
    };
    const liberar = () => {
      if (rafBloqueo) cancelAnimationFrame(rafBloqueo);
      rafBloqueo = 0;
      if (!bloqueado) return;
      bloqueado = false;
      window.removeEventListener("keydown", frenarTecla, { capture: true });
      window.removeEventListener("wheel", frenarRueda, { capture: true });
    };
    const armar = (bloquearScroll: boolean) => {
      buildAnim?.kill();
      resetBuild();
      if (bloquearScroll && !bloqueado && !rafBloqueo) {
        rafBloqueo = requestAnimationFrame(bloquear);
      }
      buildAnim = gsap
        .timeline({
          onUpdate: pintar,
          onComplete: () => {
            buildAnim = null;
            liberar();
          },
        })
        .to(build, { velo: 0, duration: 1.2, ease: "sine.inOut" }, 0)
        .to(build, { linea: 1, duration: 0.5, ease: "sine.out" }, 0.7)
        .to(build, { apoyo: 1, duration: 0.5, ease: "sine.out" }, 1.0)
        .to(build, { rollo: 1, duration: 1.6, ease: "power2.inOut" }, 1.4)
        .to(build, { foto: 1, duration: 0.8, ease: "power2.out" }, 2.2)
        .to(build, { chips: 1, duration: 0.6, ease: "power2.out" }, 3.05);
    };
    // Rebobinar deshace SOLO el armado (velo de vuelta a blanco, tambor a
    // cero): la visibilidad del escenario la maneja el trigger de la zona
    // (ver onToggle). Se pinta enseguida para que, si la zona vuelve a
    // entrar, el primer frame ya sea blanco y no la torre armada.
    const rebobinar = () => {
      buildAnim?.kill();
      buildAnim = null;
      liberar();
      resetBuild();
      pintar();
      // (Las fotos no necesitan reset: build.foto=0 apaga la 01 y las demás
      // vuelven a su sitio con el transform del próximo pintar.)
    };
    // Nace APAGADO. La torre pinta por encima del faro (z-20), así que con la
    // opacidad por defecto (1) se vería montada sobre la escena nocturna y
    // taparía el flash. Se prende y apaga de golpe con la zona (onToggle):
    // al cruzar hacia arriba el corte es INMEDIATO, no un fundido — pasado
    // ese borde el escenario deja de estar pineado y se DESLIZA con la
    // página; desvanecerlo hacía que se lo viera resbalar. Y en ese borde el
    // faro está en blanco pleno, igual que el velo: el relevo no se ve.
    stage.style.opacity = "0";

    // Geometría del ENROLLADO del primer tambor. En la línea, el nombre
    // (primera copia, sin separador) queda centrado al frente; las demás
    // copias y los "•" se encienden recién cuando el arco cierra.
    const g0 = geo.drums[0];
    const nombreLen = Array.from(TAMBORES[0].tambor).length;
    const rotLinea = -(g0.angs[0] + g0.angs[nombreLen - 1]) / 2;
    // Escala de la línea: a tamaño final no entra en pantalla (~2000px).
    const ESCALA_LINEA = 0.55;
    const DEG = Math.PI / 180;
    const wrap180 = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

    const pintar = () => {
      // Viaje de la torre: el avance de la zona menos el arranque (ver
      // ARRANQUE_SVH).
      const pv = Math.min(1, Math.max(0, (avance.p - ARRANQUE) / (1 - ARRANQUE)));

      // El velo blanco lo disuelve el armado (por tiempo): la superficie
      // gris y su trama EMERGEN del blanco en que terminó el faro.
      if (veloRef.current) veloRef.current.style.opacity = String(build.velo);
      if (apoyoRef.current) apoyoRef.current.style.opacity = String(build.apoyo);
      const y = -pv * (n - 1) * geo.sp;
      tower.style.transform = `translateY(${y}px)`;
      for (let i = 0; i < n; i++) {
        const drum = drumRefs.current[i];
        const foto = fotoRefs.current[i];
        if (!drum) continue;
        const wy = i * geo.sp + y; // 0 = centro de cámara
        const visible = Math.abs(wy) < geo.alto * 1.05;
        if (!visible) {
          if (!ocultos[i]) {
            drum.style.visibility = "hidden";
            if (foto) foto.style.visibility = "hidden";
            ocultos[i] = true;
          }
          continue;
        }
        if (ocultos[i]) {
          drum.style.visibility = "";
          if (foto) foto.style.visibility = "";
          ocultos[i] = false;
        }
        // Giro: fase del tambor + scroll (en sentido de lectura). El latido
        // (pulsos) es el "beat" elástico cuando llega.
        const rot = rotDe(i, pv);
        const lat = 1 + (pulsos.current[i] || 0);
        // Solo el PRIMER tambor se arma: es el que recibe el deslumbre. Los
        // demás ya llegan montados desde arriba, como siempre.
        const rollo = i === 0 ? build.rollo : 1;
        const enRollo = rollo < 1;
        // Durante el rollo el tambor NO gira como div: cada letra lleva su
        // ángulo efectivo (ver abajo), porque la línea tiene que mirar a
        // cámara sea cual sea la fase. Crece de ESCALA_LINEA a 1.
        if (enRollo) {
          const esc = ESCALA_LINEA + (1 - ESCALA_LINEA) * rollo;
          drum.style.transform = `translate(-50%, -50%) translateY(${i * geo.sp}px) scale(${esc * lat})`;
        } else {
          drum.style.transform = `translate(-50%, -50%) translateY(${i * geo.sp}px) rotateY(${rot}deg) scale(${lat})`;
        }
        // La foto viaja CON la torre, un toque más lenta (parallax): sube
        // pegada a su tambor en vez de encenderse quieta en el centro. Las
        // fotos apiladas en el eje de cámara se leían como un parpadeo — un
        // cambio de imagen sin recorrido, justo lo contrario del viaje que
        // cuenta la sección. La 01 sí nace con el armado: crece desde el eje
        // cuando el tubo ya cerró y hay un "adentro" donde ponerla.
        if (foto) {
          const nac = i === 0 ? build.foto : 1;
          foto.style.opacity = String(nac);
          foto.style.transform = `translate(-50%, -50%) translateY(${i * geo.sp - wy * 0.1}px) scale(${0.4 + 0.6 * nac})`;
        }
        const g = geo.drums[i];
        const spans = spanRefs.current[i] ?? [];
        // ENROLLADO: una línea es un arco de radio infinito. Se parte de un
        // radio enorme (R / rollo) tangente al frente y se lo cierra hasta R:
        // cada letra conserva su arco real, así la línea se dobla sola sin
        // que nada se amontone. Mientras tanto la fase se desliza desde la
        // del nombre centrado hasta la de la estación.
        const e = Math.max(rollo, 1e-4);
        const rho = geo.r / e;
        const rotNow = enRollo ? rotLinea + (rot - rotLinea) * rollo : rot;
        // Copias repetidas y separadores: apagados en la línea, entran con
        // el arco (si no, la línea muestra "…ONAL • DESARROLLO PROF…").
        const copiaFade = Math.min(1, Math.max(0, (rollo - 0.35) / 0.5));
        const fijar = !fijado[i];
        for (let j = 0; j < spans.length; j++) {
          const s = spans[j];
          if (!s) continue;
          let c: number;
          let vis = 1;
          if (enRollo) {
            const aw = wrap180(g.angs[j] + rotNow);
            const phi = aw * e; // grados: s/ρ = (aw·R)/(R/e)
            c = Math.cos(phi * DEG);
            const x = rho * Math.sin(phi * DEG);
            const z = geo.r - rho + rho * Math.cos(phi * DEG);
            s.style.transform = `translate(-50%, -50%) translate3d(${x}px, 0px, ${z}px) rotateY(${phi}deg)`;
            vis = build.linea * (j < nombreLen ? 1 : copiaFade);
          } else {
            const a = (((g.angs[j] + rot) % 360) + 360) % 360;
            c = Math.cos(a * DEG);
            if (fijar) {
              s.style.transform = `translate(-50%, -50%) rotateY(${g.angs[j]}deg) translateZ(${geo.r}px)`;
            }
          }
          if (c > 0) {
            // Zona legible bien marcada: plena de frente, cae rápido hacia
            // los costados (antes 0.2 + 0.8·c, casi lineal).
            s.style.opacity = String((0.08 + 0.92 * Math.pow(c, 1.5)) * vis);
            // El acento se REPONE, no se limpia: `color = ""` borraba el
            // color que pone React desde data y las letras volvían al navy
            // heredado en el frame siguiente.
            s.style.color = TAMBORES[i].acento;
            s.style.textShadow = "none";
          } else {
            // Cara de atrás: se ve a través del "vidrio", tenue y difusa. La
            // sombra toma el color de la estación (antes navy fijo), así el
            // tambor tiene su tinte también por detrás. A la mitad de lo que
            // estaba: las letras espejadas ensuciaban el frente que se lee.
            s.style.opacity = String((0.05 + 0.06 * -c) * vis);
            s.style.color = "transparent";
            s.style.textShadow = `0 0 14px color-mix(in srgb, ${TAMBORES[i].acento} 55%, transparent)`;
          }
        }
        if (!enRollo) fijado[i] = true;

        // Aros del cilindro: alrededor de una línea recta no tienen sentido;
        // entran con el arco.
        const aros = aroRefs.current[i] ?? [];
        for (let k = 0; k < aros.length; k++) {
          const aro = aros[k];
          if (aro) aro.style.opacity = String(copiaFade);
        }

        // Chips de frase: legibles solo del lado de adelante. Entran recién
        // con el rollo CERRADO (si aparecen con las letras, el momento se
        // ensucia: son dos lecturas compitiendo; y durante el rollo el div
        // no gira, así que quedarían desfasados de las letras).
        const chipArm = i === 0 ? build.chips : 1;
        const chips = chipRefs.current[i] ?? [];
        for (let k = 0; k < chips.length; k++) {
          const chip = chips[k];
          if (!chip) continue;
          const a = (((CHIP_ANGS[k] + rot) % 360) + 360) % 360;
          const c = Math.cos(a * DEG);
          chip.style.opacity = c > 0.12 ? String((0.2 + 0.8 * c) * chipArm) : "0";
        }

      }

      // El apoyo YA NO se apaga durante el viaje: tiene contenedor propio, así
      // que el tambor que llega le pasa por detrás sin ensuciarlo. Antes se
      // desvanecía para no pisarse con la foto y quedaba ilegible justo en el
      // tramo en que uno lee.
      const pos = pv * (n - 1);

      // Riel derecho: barra y porcentaje del recorrido.
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${pv})`;
      const pct = `${Math.round(pv * 100)}%`;
      if (pctRef.current && pctRef.current.textContent !== pct) {
        pctRef.current.textContent = pct;
      }

      // Estación activa → cruzar los textos de apoyo (sin re-render React).
      const act = Math.min(n - 1, Math.max(0, Math.round(pos)));
      if (act !== activo) {
        activo = act;
        railRefs.current.forEach((el, i) => {
          if (el) el.dataset.active = String(i === act);
        });
        // Latido: el tambor que llega hace un pulso elástico (la escala extra
        // la lee pintar en cada frame, así compone con el giro).
        const beat = { v: 0.05 };
        pulsos.current[act] = beat.v;
        gsap.to(beat, {
          v: 0,
          duration: 0.7,
          ease: "elastic.out(1.2, 0.5)",
          onUpdate: () => {
            pulsos.current[act] = beat.v;
          },
        });
        const t = TAMBORES[act];
        gsap
          .timeline()
          .to("[data-torre-slot]", { autoAlpha: 0, y: -10, duration: 0.22, ease: "power2.in" })
          .add(() => {
            if (tituloRef.current) tituloRef.current.textContent = t.titulo;
            if (fraseRef.current) fraseRef.current.textContent = t.frase;
            if (detalleRef.current) detalleRef.current.textContent = t.detalle;
          })
          .to("[data-torre-slot]", { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" });
      }
    };

    // Repintado por frame mientras la torre está en cuadro: el latido
    // (pulsos) se anima por su cuenta y tiene que verse aunque el scroll
    // esté quieto. Durante el armado no corre: pintar() ya lo llama la
    // línea de tiempo del armado. (La deriva en reposo que corría acá se
    // quitó; ver el comentario sobre ALINEA.)
    const tick = () => {
      if (!enCuadro || buildAnim) return;
      pintar();
    };
    gsap.ticker.add(tick);

    const ctx = gsap.context(() => {
      gsap.to(avance, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: zone,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          invalidateOnRefresh: true,
          // Fuera de la zona pintar() no corre, así que el escenario se
          // prende y apaga acá: entra opaco (cubierto por su velo blanco) en
          // cuanto la zona arranca, y si volvés arriba se apaga y el flash
          // del faro vuelve a quedar despejado.
          onToggle: (self) => {
            enCuadro = self.isActive;
            stage.style.opacity = self.isActive ? "1" : "0";
          },
        },
        onUpdate: pintar,
      });

      // Armado / rebobinado: trigger PROPIO sin scrub, en el mismo punto
      // donde arranca la zona (= el faro terminó en blanco, por el solape).
      // onRefresh cubre el caso de cargar la página ya scrolleada.
      ScrollTrigger.create({
        trigger: zone,
        start: "top top",
        end: "bottom bottom",
        onEnter: () => armar(true),
        onEnterBack: () => armar(false),
        onLeaveBack: rebobinar,
        onRefresh: (self) => {
          if (!self.isActive) rebobinar();
        },
      });

      // (La aparición del bloque de apoyo la maneja pintar(): opacidad por
      // cercanía a la estación — un tween acá pelearía con esa escritura.)
    }, stage);

    pintar();

    return () => {
      gsap.ticker.remove(tick);
      // La línea de tiempo del armado nace fuera del gsap.context (la crea
      // el ScrollTrigger en caliente), así que ctx.revert() no la alcanza.
      buildAnim?.kill();
      liberar();
      ctx.revert();
    };
  }, [live, geo]);

  drumRefs.current = [];
  spanRefs.current = TAMBORES.map(() => []);
  railRefs.current = [];
  fotoRefs.current = [];
  chipRefs.current = TAMBORES.map(() => []);

  // Riel izquierdo: saltar a la estación i (misma cuenta que hace pintar
  // al revés: posición de scroll donde el viaje pv = i/(n-1), contando el
  // arranque).
  const saltarA = (i: number) => {
    const zone = zoneRef.current;
    if (!zone) return;
    const top = zone.getBoundingClientRect().top + window.scrollY;
    const pv = i / (TAMBORES.length - 1);
    const destino =
      top + (zone.offsetHeight - window.innerHeight) * (ARRANQUE + (1 - ARRANQUE) * pv);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(destino, { duration: 1.4 });
    else window.scrollTo({ top: destino, behavior: "smooth" });
  };

  return (
    <section
      id="recorrido"
      // Se mete una pantalla debajo del final del faro y pinta POR ENCIMA
      // (z-20 contra su z-10): la zona arranca justo donde el faro termina
      // en blanco, y durante ese solape el escenario del faro sale de cuadro
      // tapado por este. El relevo, el velo blanco y el armado del tambor
      // están explicados en el effect (SOLAPE_SVH y `armar`).
      // Solo en lg + con motion, que es donde existe el runway del faro.
      className={
        "relative " +
        (live
          ? // Va POR ENCIMA del faro (z-20 contra su z-10) y sin fondo propio:
            // así el escenario se funde ENCIMA de la luz del deslumbre en vez
            // de que la luz se corra como una cortina. El gris de base lo pone
            // el body; la superficie real la trae el escenario (data-fondo).
            "z-20 lg:-mt-[100svh] lg:motion-reduce:mt-0"
          : "bg-gris-fondo")
      }
      aria-label="Líneas de acción"
    >
      {/* Grilla de puntos §6 — solo en el fallback plano: cuando la torre
          anima, la trama viaja dentro del escenario (data-fondo) para que
          aparezca junto con él sobre la luz del faro. */}
      {!live && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]"
        />
      )}

      {/* Contenido real para lectores de pantalla: la torre es decorativa. */}
      <ul className="sr-only">
        {TAMBORES.map((t) => (
          <li key={t.id}>
            <h3>{t.titulo}</h3>
            <p>{t.frase}</p>
            <p>{t.detalle}</p>
          </li>
        ))}
      </ul>

      <div
        ref={zoneRef}
        className="relative"
        // Estaciones + arranque (ver ARRANQUE_SVH): cada estación conserva
        // sus SVH_POR_TAMBOR de scroll.
        style={live ? { height: `${ZONA_SVH}svh` } : undefined}
      >
        <div
          ref={stageRef}
          className={
            live ? "sticky top-0 flex h-[100svh] flex-col overflow-clip" : "flex flex-col"
          }
          aria-hidden={live || undefined}
        >
          {/* Superficie del escenario: el gris de la página con su trama de
              puntos. Vive DENTRO del escenario para que entre junto con los
              tambores — el conjunto se funde ENCIMA de la luz del faro en vez
              de que la luz se corra. */}
          {live && (
            <span
              aria-hidden="true"
              className="bg-gris-fondo pointer-events-none absolute inset-0"
            >
              <span className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]" />
            </span>
          )}
          {/* Velo blanco del relevo: el mismo blanco en que termina el faro,
              por encima de TODO el escenario (z-30, sobre header, rieles y
              apoyos). El armado lo disuelve por tiempo (build.velo); de ahí
              emergen la superficie, la trama y el tambor. */}
          {live && (
            <span
              ref={veloRef}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30 bg-white"
            />
          )}
          {/* Niebla arriba y abajo del escenario: los tambores que entran o
              salen se desvanecen antes de pisar el encabezado o los apoyos.
              (z-10: sobre la escena, debajo de header/rieles/apoyos en z-20.) */}
          {live && (
            <>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40"
                style={{
                  background:
                    "linear-gradient(to bottom, var(--color-gris-fondo) 20%, color-mix(in srgb, var(--color-gris-fondo) 65%, transparent), transparent)",
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-60"
                style={{
                  background:
                    "linear-gradient(to top, var(--color-gris-fondo) 30%, color-mix(in srgb, var(--color-gris-fondo) 70%, transparent), transparent)",
                }}
              />
            </>
          )}

          {live && geo ? (
            <>
              {/* ── Riel izquierdo: las estaciones, clickeables ──────────── */}
              <nav
                aria-hidden="true"
                className="absolute top-1/2 left-4 z-20 hidden -translate-y-1/2 flex-col gap-1 lg:flex xl:left-8"
              >
                {TAMBORES.map((t, i) => (
                  <button
                    key={t.id}
                    ref={(el) => {
                      railRefs.current[i] = el;
                    }}
                    type="button"
                    tabIndex={-1}
                    data-active={i === 0}
                    onClick={() => saltarA(i)}
                    // La activa se nota por tres restas y sumas chicas: sube un
                    // escalón de tamaño, se corre 4px a la derecha (rompe la
                    // columna) y las demás retroceden al 40%. Sin bold ni
                    // fondo: en mono chica el bold se empasta y el fondo
                    // vuelve botonera al riel.
                    className="group text-gris-texto/40 hover:text-azul-principal data-[active=true]:text-azul-principal flex cursor-pointer items-center gap-2 py-0.5 text-left font-mono text-[0.62rem] tracking-[0.12em] uppercase transition-[color,font-size,transform] duration-300 ease-out data-[active=true]:translate-x-1 data-[active=true]:text-[0.72rem]"
                  >
                    {/* El punto se estira a un guion verde en la activa: el
                        gesto de "estás acá" lee mejor que un punto más grande. */}
                    <span className="group-data-[active=true]:bg-verde-concepto inline-block h-1 w-1 rounded-full bg-current opacity-40 transition-all duration-300 ease-out group-data-[active=true]:w-3 group-data-[active=true]:opacity-100" />
                    {String(i + 1).padStart(2, "0")} {t.tambor}
                  </button>
                ))}
              </nav>

              {/* ── Riel derecho: progreso del recorrido ─────────────────── */}
              <div
                aria-hidden="true"
                className="absolute top-1/2 right-5 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex xl:right-9"
              >
                <span className="text-gris-texto/60 font-mono text-[0.6rem] tracking-[0.16em] uppercase [writing-mode:vertical-rl]">
                  Recorrido
                </span>
                <span className="bg-azul-principal/15 relative block h-36 w-px overflow-hidden">
                  <span
                    ref={fillRef}
                    className="bg-verde-concepto absolute inset-0 origin-top"
                    style={{ transform: "scaleY(0)" }}
                  />
                </span>
                <span
                  ref={pctRef}
                  className="text-azul-principal font-mono text-[0.62rem] tracking-[0.12em]"
                >
                  0%
                </span>
              </div>

              {/* ── Escena 3D: la torre entera dentro de una perspectiva ── */}
              <div
                className="relative min-h-0 flex-1"
                style={{ perspective: "1500px", perspectiveOrigin: "50% 42%" }}
              >
                {/* Picado de cámara fijo; adentro, la torre que se traslada. */}
                <div
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: "translate(-50%, -46%) rotateX(11deg)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  <div
                    ref={towerRef}
                    className="will-change-transform"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Fotos flotando DENTRO de cada tambor (la "medusa" de la
                        referencia): no rotan — viajan con la torre con leve
                        parallax. En 3D quedan entre el texto esmerilado de
                        atrás y el texto nítido de adelante. */}
                    {TAMBORES.map((t, i) => (
                      <div
                        key={"foto-" + t.id}
                        ref={(el) => {
                          fotoRefs.current[i] = el;
                        }}
                        aria-hidden="true"
                        className="absolute will-change-transform"
                        style={{
                          transform: `translate(-50%, -50%) translateY(${i * geo.sp}px)`,
                        }}
                      >
                        {/* Resplandor del acento detrás de la foto: da aire
                            de color al centro del tambor. */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute top-1/2 left-1/2 h-[44vmin] w-[44vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            background: `radial-gradient(circle, color-mix(in srgb, ${t.acento} 22%, transparent) 0%, transparent 68%)`,
                          }}
                        />
                        <div
                          className="relative h-[30vmin] w-[30vmin] overflow-hidden rounded-full opacity-95 shadow-[0_30px_80px_-30px_rgb(15_23_42/0.5)]"
                          style={{ outline: `2px solid color-mix(in srgb, ${t.acento} 35%, transparent)`, outlineOffset: "6px" }}
                        >
                          <Image
                            src={t.foto}
                            alt=""
                            fill
                            sizes="30vmin"
                            className="object-cover"
                          />
                          <span className="bg-azul-principal/10 absolute inset-0" />
                        </div>
                      </div>
                    ))}
                    {TAMBORES.map((t, i) => {
                      const g = geo.drums[i];
                      return (
                        <div
                          key={t.id}
                          ref={(el) => {
                            drumRefs.current[i] = el;
                          }}
                          className="absolute will-change-transform"
                          style={{
                            transformStyle: "preserve-3d",
                            transform: `translate(-50%, -50%) translateY(${i * geo.sp}px)`,
                          }}
                        >
                          {/* Aros del cilindro */}
                          {[-1, 1].map((lado, k) => (
                            <div
                              key={lado}
                              ref={(el) => {
                                (aroRefs.current[i] ??= [])[k] = el;
                              }}
                              aria-hidden="true"
                              className="absolute rounded-full border"
                              // Aro del color de la estación (antes navy fijo).
                              style={{
                                borderColor: `color-mix(in srgb, ${t.acento} 22%, transparent)`,
                                width: geo.r * 2.06,
                                height: geo.r * 2.06,
                                left: -geo.r * 1.03,
                                top: -geo.r * 1.03,
                                transform: `translateY(${lado * g.f * 0.72}px) rotateX(90deg)`,
                              }}
                            />
                          ))}
                          {/* Chips con la frase de la línea, girando sobre la
                              banda; de espaldas se apagan (pintar). */}
                          {CHIP_ANGS.map((ang, k) => (
                            <div
                              key={"chip-" + k}
                              ref={(el) => {
                                chipRefs.current[i][k] = el;
                              }}
                              aria-hidden="true"
                              className="text-azul-principal/85 absolute w-[32ch] text-center font-mono text-[0.68rem] tracking-[0.14em] uppercase [backface-visibility:hidden]"
                              style={{
                                transform: `translate(-50%, -50%) rotateY(${ang}deg) translateZ(${geo.r + 2}px) translateY(${g.f * 0.62}px)`,
                                opacity: 0,
                              }}
                            >
                              {String(i + 1).padStart(2, "0")} · {t.frase}
                            </div>
                          ))}

                          {/* Rebanadas del nombre */}
                          {g.slices.map((ch, j) => (
                            <span
                              key={j}
                              ref={(el) => {
                                spanRefs.current[i][j] = el;
                              }}
                              className="font-display absolute select-none font-extrabold"
                              style={{
                                // Color de la estación, no navy fijo: el
                                // viaje deja de ser monocromo.
                                color: t.acento,
                                fontSize: g.f,
                                lineHeight: 1,
                                transform: `translate(-50%, -50%) rotateY(${g.angs[j]}deg) translateZ(${geo.r}px)`,
                              }}
                            >
                              {ch === " " ? " " : ch}
                            </span>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>

              {/* ── Apoyos fijos al pie: se cruzan al cambiar de tambor ── */}
              <div className="relative z-20 mx-auto w-full max-w-screen-xl px-5 pb-10 md:px-10">
                <div
                  ref={apoyoRef}
                  // Contenedor PROPIO: el tambor y su foto pasan por detrás y
                  // antes lavaban este texto hasta volverlo ilegible. Con
                  // superficie opaca y un borde tenue, el apoyo se lee siempre,
                  // esté donde esté la torre.
                  // 3fr/2fr y frase con tamaño fluido: la frase (el título
                  // visual) entra en UNA línea en todo lg, como el rótulo de
                  // arriba. A dos columnas iguales y 1.5rem las más largas
                  // (60 caracteres) se partían en dos; el detalle de la derecha
                  // baja un escalón (pedido de Mateo, 2026-09-02).
                  className="bg-gris-fondo/92 ring-azul-principal/10 grid gap-5 rounded-2xl px-6 py-6 shadow-[0_18px_50px_-30px_rgb(15_23_42/0.4)] ring-1 backdrop-blur-[2px] md:grid-cols-[3fr_2fr] md:gap-10 md:px-8 md:py-7"
                >
                <div>
                  <p
                    ref={tituloRef}
                    data-torre-slot
                    className="text-azul-principal font-sans text-[0.95rem] font-semibold"
                  >
                    {TAMBORES[0].titulo}
                  </p>
                  <p
                    ref={fraseRef}
                    data-torre-slot
                    className="text-verde-concepto-texto font-display mt-2 leading-snug font-bold"
                    // Medido con Manrope 700: la frase más larga mide 29.9 veces
                    // el tamaño de fuente, y la columna va de 504px (1024) a
                    // 658px (≥1280): 16px…20.8px deja 5% de aire.
                    style={{ fontSize: "clamp(1rem, 0.1rem + 1.2vw, 1.3rem)" }}
                  >
                    {TAMBORES[0].frase}
                  </p>
                </div>
                <p
                  ref={detalleRef}
                  data-torre-slot
                  className="text-gris-texto max-w-[52ch] font-sans text-[0.9rem] leading-relaxed md:self-end md:justify-self-end"
                >
                  {TAMBORES[0].detalle}
                </p>
                </div>
              </div>
            </>
          ) : (
            /* ── Fallback plano: todas las estaciones apiladas ── */
            <div className="mx-auto w-full max-w-screen-xl px-5 pb-20 md:px-10">
              {TAMBORES.map((t, i) => (
                <article key={t.id} className="border-azul-principal/10 border-t py-12 first:border-t-0">
                  <p className="text-gris-texto font-mono text-[0.7rem] tracking-[0.14em] uppercase">
                    {String(i + 1).padStart(2, "0")} / {String(TAMBORES.length).padStart(2, "0")}
                  </p>
                  <h3
                    className="font-display text-azul-principal mt-3 font-extrabold tracking-[-0.02em]"
                    style={{ fontSize: "clamp(1.9rem, 1rem + 4vw, 3.2rem)", lineHeight: 1.05 }}
                  >
                    {t.titulo}
                  </h3>
                  <p className="text-verde-concepto-texto font-display mt-4 max-w-[28ch] text-[1.15rem] leading-snug font-bold">
                    {t.frase}
                  </p>
                  <p className="text-gris-texto mt-3 max-w-[56ch] font-sans text-[0.98rem] leading-relaxed">
                    {t.detalle}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
