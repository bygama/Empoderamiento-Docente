import gsap from "gsap";
import { getLenis } from "@/lib/lenis";
import type { EstadoTorre } from "./pintar-torre";

/**
 * ARMADO: el primer tambor se CONSTRUYE sobre la superficie que emerge del
 * blanco. Nace como una LÍNEA recta legible (el nombre entero, quieto, a
 * escala reducida) y después se ENROLLA hasta cerrar el cilindro. Así el
 * usuario lee qué es antes de que se vuelva objeto.
 *
 * RELEVO CON EL FARO. La sección se mete SOLAPE_SVH por debajo del faro (ver
 * el -mt del <section>) y pinta POR ENCIMA (z-20 contra z-10). La zona
 * arranca justo donde el faro termina su línea de tiempo con la pantalla en
 * blanco; desde ahí y durante una pantalla el escenario del faro se desliza
 * fuera de cuadro TAPADO por este escenario, que entra opaco pero cubierto
 * por un VELO BLANCO propio: mismo blanco en que termina el faro, relevo
 * invisible, y nada se ve mover. De ese blanco emergen POR TIEMPO la
 * superficie gris con su trama y después el tambor: el usuario que frena en
 * el blanco ve nacer la sección sin tener que empujar la rueda. (Se probó
 * disolver el velo por scroll y quedaba peor: quien se detiene en el blanco
 * no ve nada.) El viaje de la torre arranca ARRANQUE_SVH después del inicio
 * de la zona (ver la constante). Antes descontaba el solape entero (100svh)
 * para que quien scrolleaba durante el velo no se perdiera el tambor 01; con
 * el scroll frenado mientras se arma eso ya no puede pasar.
 *
 * El armado NO va scrubbeado: corre SOLO, por tiempo, en cuanto la zona
 * arranca (= el faro terminó en blanco). Atado al scroll obligaba a ir
 * empujando la rueda para verlo construirse; así el remate del flash se
 * reproduce como animación y el scroll queda libre para viajar la torre. Si
 * el usuario vuelve arriba, se rearma para la próxima pasada.
 * Secuencia (por tiempo, en segundos desde el blanco). Los pasos se SOLAPAN
 * y van en seno: cada cosa empieza a aparecer mientras la anterior todavía
 * termina, así no hay escalones.
 *   velo  0.0→1.2  el velo blanco se disuelve: la superficie gris y su
 *                  trama de puntos EMERGEN del blanco (el ojo descansa)
 *   linea 0.7→1.2  el nombre en UNA línea, quieto, legible
 *   apoyo 1.0→1.5  la tarjeta de apoyo abajo (nombre arriba, explicación
 *                  abajo, antes de que nada gire)
 *   rollo 1.4→3.0  la línea se enrolla hasta el tubo y crece a escala 1,
 *                  al ritmo ORIGINAL (1.6 s): en 1.0 s se leía como un
 *                  barrido hacia la izquierda, no como una transformación
 *   foto  2.2→3.0  el disco nace en el centro cuando ya hay "adentro"
 *   chips 3.05→3.65 las frases sobre la banda, con el tubo YA cerrado:
 *                  mientras se enrolla el div no gira, y un chip que
 *                  asome antes aparece en otro ángulo y salta al cerrar
 * 3.65 s en total (antes 4.9): se acortaron las esperas (velo, línea), no la
 * transformación. El scroll hacia abajo queda frenado hasta el final
 * (onComplete): se probó soltarlo al cerrar el tubo y no gustó, la animación
 * tiene que terminar antes de que el scroll vuelva.
 *
 * SCROLL HACIA ABAJO BLOQUEADO mientras se arma. El armado corre por tiempo,
 * y hasta acá quien seguía empujando la rueda se llevaba la torre de viaje
 * con el tambor a medio enrollar, o se pasaba de largo. Ahora, al entrar
 * desde arriba: se clava el scroll al comienzo de la zona (eso también corta
 * la inercia de Lenis) y se tragan la rueda y las teclas que BAJAN; recién
 * cuando terminó el armado entero (onComplete) el scroll vuelve. Hacia
 * ARRIBA queda libre (pedido de Mateo, 2026-09-02): quien se arrepiente
 * vuelve al faro, y al cruzar el borde onLeaveBack rebobina y suelta.
 * Entrando desde abajo no se arma ni se bloquea (ver `completar`): ahí el
 * tambor 01 ni siquiera está en cuadro.
 * Los listeners van en CAPTURA sobre window y cortan la propagación: así el
 * evento no llega a Lenis (que escucha en burbuja) ni al scroll nativo.
 * Clavar va diferido un frame: onEnter corre adentro de
 * ScrollTrigger.update, y Lenis emite scroll al mover.
 */
export function crearArmado(
  zone: HTMLElement,
  { build }: EstadoTorre,
  pintar: () => void,
  resetBuild: () => void,
) {
  let buildAnim: gsap.core.Timeline | null = null;

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
  // (ver `mostrar`). Se pinta enseguida para que, si la zona vuelve a
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

  // Completar = el armado ya hecho, sin animarlo: para entrar desde ABAJO
  // (el tambor 01 ni está en cuadro) y para cargar la página pasada la
  // zona. Deja el velo en cero y todo lo del tambor 01 en su estado final.
  const completar = () => {
    buildAnim?.kill();
    buildAnim = null;
    liberar();
    build.velo = 0;
    build.linea = build.apoyo = build.rollo = build.foto = build.chips = 1;
    pintar();
  };

  /** La línea de tiempo del armado nace fuera del gsap.context (la crea el
   *  ScrollTrigger en caliente), así que ctx.revert() no la alcanza. */
  const matar = () => {
    buildAnim?.kill();
    liberar();
  };

  return { armar, rebobinar, completar, matar };
}
