import gsap from "gsap";
import { HAZ_VERBO } from "../preguntas-faro";
import { BEATS, despues, DURACION_RECORRIDO, FIN_PREGUNTAS, PASO_PREGUNTA } from "../tiempos-faro";
import type { Camara } from "./camara-faro";
import { GIRO } from "./haz-faro";

/**
 * El recorrido S0–S5 sobre la línea de tiempo (ver el mapa en el
 * compositor). Las posiciones son UNIDADES DE LA LÍNEA DE TIEMPO, no
 * progreso 0–1. La rotación del haz no vive acá: la pone `crearHaces` por
 * frame; acá van la cámara, las opacidades y los textos.
 */
export function armarEscenas(tl: gsap.core.Timeline, { cam, entrada }: Camara) {
  /* ── S0 · Silencio ──────────────────────────────────────────────── */
  // La frase SE QUEDA. Entraba en 0.012 y ya se iba en 0.078: plena
  // apenas 0.044 (≈27vh, un envión de rueda) y casi nadie la leía.
  // Ahora vive hasta 0.15 —el mundo empieza a entrar (S1, 0.1) con la
  // frase todavía en pantalla— y se va antes del encendido (0.21).
  tl.fromTo("[data-esc='0']", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.03, ease: "sine.out" }, 0.012)
    .to("[data-esc='0']", { autoAlpha: 0, y: -16, duration: 0.035, ease: "sine.in" }, 0.15);

  /* ── S1 · Aproximación + encendido ──────────────────────────────── */
  tl.to(cam, { z: 80, duration: 0.2, ease: "power1.inOut" }, 0.1);
  // El mundo entra por los bordes mientras avanzamos.
  tl.to("[data-capa='marMedio']", { autoAlpha: 1, duration: 0.08, ease: "none" }, 0.1)
    .to(entrada, { marMedio: 0, duration: 0.1, ease: "power2.out" }, 0.1)
    .to(entrada, { foreground: 0, duration: 0.12, ease: "power2.out" }, 0.16);
  // Encendido con peso: chispa → núcleo → halo → haz → espejo.
  tl.to("[data-nucleo]", { autoAlpha: 1, scale: 1.6, duration: 0.008, ease: "power3.in" }, 0.21)
    .to("[data-nucleo]", { scale: 1, duration: 0.015 }, 0.218)
    .to("[data-linterna]", { opacity: 1, duration: 0.012 }, 0.212)
    .to("[data-halo]", { autoAlpha: 1, scale: 1, duration: 0.028 }, 0.216)
    // (Solo la opacidad: la rotación del haz, también su asentado de −8
    // a −2 al prender, la pone `girar`. Ver ahí por qué.)
    .fromTo("[data-haz='izq']", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.035, ease: "power1.out" }, 0.226)
    .to("[data-espejo]", { autoAlpha: 1, duration: 0.04 }, 0.235);
  // La luz atraviesa la zona del titular y el mensaje emerge con ella.
  tl.to("[data-mensaje]", { autoAlpha: 1, duration: 0.012, ease: "none" }, 0.262)
    .to("[data-mensaje]", { clipPath: "inset(-8% 0% -8% 0)", duration: 0.05, ease: "power1.inOut" }, 0.262)
    // …y deja el concepto encendido: el subrayado verde de «procesos».
    .fromTo("[data-mensaje] mark", { backgroundSize: "0% 0.14em" }, { backgroundSize: "100% 0.14em", duration: 0.022, ease: "power1.inOut" }, 0.318)
    .to("[data-mensaje]", { autoAlpha: 0, y: -26, duration: 0.028, ease: "power2.in" }, 0.372);

  /* ── S2 · Método: un verbo por momento ──────────────────────────── */
  const beats = BEATS;
  // Desplazamientos laterales de cámara: el encuadre respira y el faro
  // cambia de lado del cuadro. Van atados a los beats (se mueve justo
  // antes de la pregunta que cambia de lado) con la misma duración de
  // siempre: al estirar S2 se alargan las lecturas, no los paneos.
  tl.to(cam, { x: -70, duration: 0.06, ease: "power1.inOut" }, beats[0] - 0.005)
    .to(cam, { x: 120, duration: 0.08, ease: "power1.inOut" }, beats[2] - 0.024)
    .to(cam, { x: 60, duration: 0.06, ease: "power1.inOut" }, beats[3] + 0.002)
    .to(cam, { x: 0, duration: 0.06, ease: "power1.inOut" }, beats[4] + 0.005)
    // …y sigue avanzando, repartido a lo largo del tramo, hasta el
    // contrapicado que llega con la última pregunta.
    .to(cam, { z: 380, duration: beats[3] - beats[0] - 0.06, ease: "power1.inOut" }, beats[0] + 0.04)
    .to(cam, { z: 600, duration: PASO_PREGUNTA + 0.03, ease: "power1.inOut" }, beats[3] + 0.002);

  // La rotación del haz hacia cada pregunta vive en haz-faro.ts.
  beats.forEach((t, i) => {
    const { lado } = HAZ_VERBO[i];
    const otro = lado === "izq" ? "der" : "izq";
    const prev = i > 0 ? HAZ_VERBO[i - 1] : null;
    // La rotación la pone `girar` por frame; acá solo el crossfade de
    // opacidad cuando la luz cambia de óptica, con los tiempos de GIRO.
    if (prev && prev.lado !== lado) {
      tl.to(`[data-haz='${otro}']`, { autoAlpha: 0, duration: GIRO.salida, ease: "sine.in" }, t - GIRO.antesSalida)
        .to(`[data-haz='${lado}']`, { autoAlpha: 1, duration: GIRO.entrada, ease: "sine.inOut" }, t - GIRO.antesEntrada);
    }
    // Consecuencia: el agua se enciende donde el haz llega…
    tl.to(`[data-verbo-punto='${i}']`, { autoAlpha: 1, duration: 0.02 }, t + 0.018)
      // …la pregunta toma la escena (entrada y salida de 0.03: con
      // 0.016 un scroll rápido las hacía parpadear)…
      .fromTo(`[data-verbo-txt='${i}'] [data-v]`, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.03, ease: "sine.out" }, t + 0.02)
      // …y la luz pinta el concepto: el subrayado verde de la palabra
      // clave se dibuja cuando el haz ya está sobre ella. Largo (0.12 ≈
      // 74vh de scroll): con 0.04 se pintaba en un parpadeo.
      .fromTo(`[data-verbo-txt='${i}'] mark`, { backgroundSize: "0% 0.12em" }, { backgroundSize: "100% 0.12em", duration: 0.12, ease: "sine.inOut" }, t + 0.05);
    // …y al ceder deja una idea encendida (rastro verde) en el agua.
    const fin = i < 4 ? beats[i + 1] - 0.03 : FIN_PREGUNTAS;
    tl.to(`[data-verbo-txt='${i}'] [data-v]`, { autoAlpha: 0, y: -16, duration: 0.03, ease: "sine.in" }, fin)
      .to(`[data-verbo-punto='${i}']`, { autoAlpha: 0.22, duration: 0.02 }, fin)
      .to(`[data-rastro='${i}']`, { autoAlpha: 0.6, duration: 0.014 }, fin + 0.004);
  });
  /* ── S4 · Cierre EN LA NOCHE ────────────────────────────────────────
     Antes acá amanecía (dos velos de alba, estrellas apagándose y el haz
     retirándose) y el plano final quedaba sobre fondo marfil. Ahora la
     noche NO cede: es el faro el que ilumina el cierre, igual que en el
     resto de las ilustraciones del sitio. Los velos y la bruma quedan en
     el DOM pero no se animan; el haz se queda encendido barriendo el
     primer plano y la lámpara sube a plena en vez de bajar a mínima. */
  // Posiciones de acá en adelante: las originales, corridas por
  // `despues` (ver CORRIMIENTO).
  tl.to(cam, { z: -260, duration: 0.1, ease: "power1.inOut" }, despues(0.862))
    .to(cam, { y: 0, duration: 0.08, ease: "power1.inOut" }, despues(0.862));
  tl.to("[data-verbo-punto]", { autoAlpha: 0, duration: 0.03, ease: "none" }, despues(0.866))
    // El haz sigue vivo: abre un poco y baña la zona del titular (el
    // giro a −46° lo hace `girar`; acá solo la opacidad).
    .to("[data-haz='izq']", { autoAlpha: 1, duration: 0.04, ease: "none" }, despues(0.862))
    // La linterna queda a plena: es la única fuente de luz del plano.
    .to("[data-halo]", { autoAlpha: 1, duration: 0.05 }, despues(0.88))
    .to("[data-nucleo]", { autoAlpha: 1, duration: 0.05 }, despues(0.88));
  // Entra apenas se va la ultima pregunta (0.73). Al retirar el bloque
  // de niveles quedaba un hueco de ~0.14 sin nada — casi una pantalla de
  // scroll muerto antes del remate.
  tl.fromTo("[data-esc='cierre']", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.03 }, despues(0.762))
    .fromTo("[data-esc='cierre'] [data-cta]", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.022 }, despues(0.79));

  /* ── S5 · Deslumbre → puente con la torre ────────────────────────────
     El faro gira hacia la cámara: el haz se abre y viene de frente, la
     linterna crece y el foco radial tapa la escena hasta dejar la
     pantalla en blanco. La torre de líneas (fondo claro) se arma desde
     ese blanco, así el corte noche→día deja de ser un salto seco.
     El titular sale ANTES de que el blanco lo alcance: leerlo mientras
     se lava daría un gris ilegible a mitad de camino. */
  // El RAYO se apaga en cuanto el titular terminó de aparecer: ya cumplió
  // su función de guiar la lectura. La luz no desaparece — se concentra
  // en la linterna, y de ahí sale el flash.
  tl.to("[data-haz='izq'], [data-haz='der']", { autoAlpha: 0, duration: 0.05, ease: "power2.in" }, despues(0.906))
    // El titular sale antes de que el blanco lo alcance.
    .to("[data-esc='cierre']", { autoAlpha: 0, duration: 0.035, ease: "none" }, despues(0.958))
    // ── La luz que CRECE es la del propio faro ──────────────────────
    // No se agregan luces nuevas: se escala el halo y el núcleo que la
    // linterna ya tiene. Están dibujados en el SVG, en la punta exacta,
    // así que nacen del lugar correcto por construcción — con capas
    // aparte había que adivinar la posición (y quedaban como manchas
    // sueltas al costado del faro, además de sumar luces que no existen).
    // svgOrigin en el foco: crecen desde la lámpara, no desde su centro.
    .to(
      "[data-halo]",
      { scale: 46, duration: 0.088, ease: "power2.in" },
      despues(0.912),
    )
    .to(
      "[data-nucleo]",
      { scale: 30, duration: 0.084, ease: "power2.in" },
      despues(0.916),
    )
    // El mar del frente SE QUEMA con la luz: está DELANTE del faro
    // (Z 300 contra 620), así que el halo crece por detrás y quedaría
    // recortado sobre el blanco. Sobreexponerlo es lo que pasa de verdad
    // cuando una fuente inunda el cuadro.
    // (El muelle y el foreground ya no existen — ver FaroEscena.)
    .to(
      "[data-capa='marMedio']",
      { autoAlpha: 0, duration: 0.072, ease: "power2.in" },
      despues(0.924),
    );

  // VELO BLANCO. El halo y el núcleo crecen desde la lámpara, pero su
  // gradiente radial nunca llega a blanco en los bordes: a p=1 el cuadro
  // quedaba en una bruma gris azulada con la torre, el horizonte y un
  // punto brillante todavía visibles, y la torre de líneas se fundía
  // encima de eso. El velo es uniforme y va sobre la escena: remata la
  // sobreexposición para que al final del runway la pantalla SEA blanca.
  // De ese blanco nace la torre (TorreLineas arranca con su propio velo
  // blanco y lo disuelve por tiempo). Como es un plano uniforme, no
  // puede despegarse de la linterna: no vuelve la "segunda esfera".
  // Sube largo y en seno (no acelerando hasta el final): el blanco llega
  // como una sobreexposición que crece, no como un golpe.
  tl.to("[data-velo-blanco]", { opacity: 1, duration: 0.07, ease: "sine.inOut" }, despues(0.93));

  // Sin círculo de flash aparte: ESE era la "segunda esfera" que
  // aparecía corrida a la izquierda del faro. Estaba anclado a una
  // posición medida una sola vez (onStart) mientras la cámara seguía
  // moviendo la escena, así que se despegaba de la linterna. El halo y
  // el núcleo, al vivir dentro del SVG, viajan con la cámara y no
  // pueden despegarse: encandilan solos.
  // Cierra la línea en su duración total: es lo que ScrollTrigger reparte
  // sobre el runway.
  tl.set({}, {}, DURACION_RECORRIDO);
}
