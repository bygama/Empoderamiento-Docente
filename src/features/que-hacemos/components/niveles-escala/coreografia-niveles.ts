import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NIVELES } from "../../data";
import { ALTO_SVH, LAZO_SEG, PUNTO_GAP, PUNTO_SEG } from "./niveles-escena";
import { instalarToggle } from "./toggle-nivel";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Ritmo de la escalada (unidades de la timeline; la zona mide ALTO_SVH).
// APERTURA: el título grande («Del aula al sistema educativo.») solo en
// escena, con la víbora entrando, antes de que caiga la primera card
// (Gastón, 2026-09-10: la primera pantalla era un título chico y un 70 %
// vacío, y esa frase es la tesis de la sección, no una bajada). Es la
// misma gramática que abre Proyectos: una frase grande que se lee y se
// achica al rincón cuando llega la primera pieza.
const APERTURA = 1.6;
const PASO = 2.0; // separación entre llegadas
const SUBIDA = 1.4; // lo que tarda una card en aterrizar
const CIERRE_TRAS = 0.45; // la card i se cierra este rato después de que aterriza la i+1
const CIERRE = 0.45; // lo que tarda el cierre (el ícono va un toque más rápido)
// CADA CIERRE TIENE QUE PASAR SOLO, ENTRE DOS LLEGADAS. Medido con
// CIERRE_TRAS 1.0 y cierres de 0.8, la card i se cerraba en
// (i+1)·PASO + 1.98 → +2.78 y la i+2 arrancaba a subir en (i+1)·PASO + 2.0:
// el cierre transcurría casi entero por debajo de la llegada siguiente y no
// se veía cuál card se había cerrado (Mateo, 2026-09-05: «el 3 no se cierra
// en orden» — el orden estaba bien, lo que faltaba era poder verlo). Ahora
// el cierre va de +1.43 a +1.88, o sea después de que la i+1 aterriza
// (+SUBIDA = 1.4) y antes de que la i+2 arranque (+PASO = 2.0).
// Al tocar PASO, SUBIDA, CIERRE_TRAS o CIERRE hay que rehacer esta cuenta.
const CIERRE_INICIO = SUBIDA * 0.7 + CIERRE_TRAS;
// Fin de la coreografía: se cerró la última card, que es la quinta y no
// tiene ninguna atrás esperando (APERTURA + n·PASO + CIERRE_INICIO + CIERRE
// = 13,48). De ahí al final de la zona queda un respiro corto y el sticky
// se suelta.
const FIN = APERTURA + 11.9;

// Cuánto scroll corre la timeline ANTES de que el escenario se clave. El
// sticky se traba cuando el tope de la zona toca el tope del viewport, así
// que basta con arrancar el ScrollTrigger a `top ENTRADA_SVH%`.
// Apenas un anticipo: con 30 el lazo entraba de más y se comía el arranque
// (Mateo, 2026-09-05).
const ENTRADA_SVH = 10;
// Unidades de timeline que se consumen con el escenario ya clavado: la zona
// clava durante (ALTO_SVH - 100)svh, que es exactamente el tramo del
// ScrollTrigger sin la entrada.
const CUERPO = FIN + 0.5;
// La entrada vale lo mismo por unidad de scroll que el resto: así el ritmo
// no cambia al cruzar el momento en que se clava.
const ENTRADA = (CUERPO * ENTRADA_SVH) / (ALTO_SVH - 100);

/**
 * La escalada: el lazo viaja, cada nivel llega subiendo, se planta y se
 * cierra cuando aterriza el siguiente; el toggle de click queda instalado.
 * Corre con la tipografía definitiva (mide `scrollHeight`). Devuelve la
 * limpieza (listeners + `ctx.revert()`).
 */
export function crearNiveles(zone: HTMLElement, stage: HTMLElement) {
  let limpiarToggle: (() => void) | undefined;
  const ctx = gsap.context(() => {
    const cards = gsap.utils.toArray<HTMLElement>("[data-nivel-card]");
    if (cards.length !== NIVELES.length) return;
    const tituloGrande = stage.querySelector<HTMLElement>("[data-nivel-titulo-grande]");
    const encabezado = stage.querySelector<HTMLElement>("[data-nivel-encabezado]");

    // Medir las zonas colapsables y fijarles alto para poder animarlo a 0.
    const colapsables = gsap.utils.toArray<HTMLElement>("[data-collapse]");
    colapsables.forEach((c) => gsap.set(c, { height: c.scrollHeight }));
    gsap.set(cards, { y: 760, autoAlpha: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: zone,
        // Empieza ENTRADA_SVH antes de que el sticky se trabe.
        start: `top ${ENTRADA_SVH}%`,
        end: "bottom bottom",
        scrub: 0.6,
      },
    });

    // El lazo viajero + su cápsula: ventana visible que se desliza a lo
    // largo del recorrido vía dashoffset — entra, serpentea entre las
    // cards y SALE (no queda estático de fondo). La cápsula corre con un
    // offset corrido detrás de la cola, siempre sobre el mismo path.
    const lazo = stage.querySelector<SVGPathElement>("[data-nivel-lazo]");
    const punto = stage.querySelector<SVGPathElement>("[data-nivel-punto]");
    if (lazo && punto) {
      const L = lazo.getTotalLength();
      const seg = L * LAZO_SEG;
      const dot = L * PUNTO_SEG;
      const gap = L * PUNTO_GAP;
      const corrimiento = gap + dot;
      gsap.set(lazo, { strokeDasharray: `${seg} ${L * 2}`, strokeDashoffset: seg });
      gsap.set(punto, {
        strokeDasharray: `${dot} ${L * 2}`,
        strokeDashoffset: seg + corrimiento,
      });
      // Viaja hasta que la CABEZA llega justo al final del trazo, y llega
      // UNA UNIDAD ANTES de que la zona se acabe: el scrub va atrasado
      // respecto del scroll (0,6 s de suavizado) y si llegara justo al
      // final, en un scroll rápido la sección se soltaría con la cabeza
      // todavía a mitad de camino, y Proyectos ya estaría dibujando la
      // suya en el borde: dos cabezas. Ahí se queda quieta, con el
      // cuerpo asomando por el borde de abajo, y la sección que sigue
      // (Proyectos) dibuja el mismo cuerpo del otro lado del borde y lo
      // retoma cuando se clava. Así el animal es uno solo a través de las
      // dos secciones. Antes salía del todo y se desvanecía antes del
      // último cierre, y entre el final de esto y el arranque de Proyectos
      // quedaba un hueco sin víbora y una cabeza que nacía cortada
      // (Gastón, 2026-09-10). Arranca en 0, o sea ANTES de que el
      // escenario se clave: es lo único que se mueve durante la entrada.
      // El final del trazo pasa lejos de la quinta card (queda a la
      // izquierda de ella), así el último cierre no tiene lazo encima.
      const final = seg - L;
      const viaje = ENTRADA + FIN - 0.5;
      tl.to(lazo, { strokeDashoffset: final, ease: "none", duration: viaje }, 0).to(
        punto,
        { strokeDashoffset: final + corrimiento, ease: "none", duration: viaje },
        0,
      );
    }

    // La apertura: el título grande está desde el primer píxel (la sección
    // llega con él puesto), se va del todo encogiéndose apenas, y recién
    // después aparece el encabezado chico arriba a la izquierda, justo
    // cuando cae la primera card. Secuencia, no superposición.
    if (tituloGrande)
      tl.to(
        tituloGrande,
        { autoAlpha: 0, scale: 0.92, ease: "power2.in", duration: 0.3 },
        ENTRADA + APERTURA - 0.5,
      );
    if (encabezado) {
      gsap.set(encabezado, { autoAlpha: 0, y: 18 });
      tl.to(encabezado, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.3 }, ENTRADA + APERTURA - 0.15);
    }

    // Cada nivel LLEGA subiendo desde abajo, se PLANTA abierta y se
    // CIERRA recién cuando la siguiente aterrizó. Al aterrizar suelta un
    // ping. LAS CINCO se cierran, la última incluida (Mateo, 2026-09-05):
    // antes cedía abierta y el patrón quedaba cortado a medias. Como no
    // tiene una card que la siga, la fórmula le da el turno que le
    // tocaría a la sexta, así conserva exactamente el mismo rato abierta
    // y sola que tuvieron las otras cuatro.
    cards.forEach((card, i) => {
      const t = ENTRADA + APERTURA + i * PASO;
      const icono = card.querySelector("[data-collapse-icon]");
      const cuerpo = card.querySelector("[data-collapse]");
      const ping = card.querySelector("[data-nivel-ping]");
      tl.to(card, { y: 0, autoAlpha: 1, ease: "power2.out", duration: SUBIDA }, t);
      {
        const tc = ENTRADA + APERTURA + (i + 1) * PASO + CIERRE_INICIO;
        if (icono)
          tl.to(
            icono,
            { height: 0, autoAlpha: 0, marginBottom: 0, ease: "power1.inOut", duration: CIERRE * 0.9 },
            tc,
          );
        if (cuerpo)
          tl.to(
            cuerpo,
            { height: 0, autoAlpha: 0, marginTop: 0, ease: "power1.inOut", duration: CIERRE },
            tc,
          );
      }
      if (ping) {
        tl.fromTo(
          ping,
          { scale: 0.3, autoAlpha: 0.7 },
          // Dura exactamente hasta que arranca el cierre de la card
          // anterior (por eso CIERRE_TRAS y no un número suelto): la
          // onda es el remate de ESTA llegada y se apaga antes de que
          // el ojo tenga que irse al cierre de la otra.
          { scale: 2.1, autoAlpha: 0, ease: "power1.out", duration: CIERRE_TRAS },
          t + SUBIDA * 0.7,
        );
      }
    });

    limpiarToggle = instalarToggle(cards);

    // Respiro corto después de la última card (el scrub termina de
    // asentarse) y la zona se acaba: el sticky se suelta con las cinco
    // cards en escena.
    tl.to({}, { duration: 0.5 }, ENTRADA + FIN);
  }, stage);

  return () => {
    limpiarToggle?.();
    ctx.revert();
  };
}
