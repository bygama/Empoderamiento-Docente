import gsap from "gsap";

/**
 * El botón del menú, de rayas a X (readaptación del de nk.studio). Las rayas
 * NO giran: la de arriba se retrae hacia la derecha y la de abajo hacia la
 * izquierda hasta desaparecer, y la X nace de un punto en el centro —con las
 * puntas redondeadas, una X muy chica ES un punto—. Mientras tanto el círculo
 * se vuelve un cuadrado de esquinas redondeadas.
 *
 * Todo se aplica A LA VEZ al botón del Header y a su gemelo del panel
 * (`BotonCerrar`): el filo de la cortina los cruza en plena animación, y de
 * los dos lados del filo tiene que verse el mismo botón, solo que en otro
 * color. La X vive solo en el gemelo: aparece cuando el del Header ya quedó
 * tapado.
 */

// En PÍXELES, y los botones con `rounded-3xl` (1,5rem: la mitad justa de sus
// 3rem, o sea un círculo) en vez de `rounded-full`. No es un detalle: el radio
// de `rounded-full` es `calc(infinity * 1px)`, que Chrome recorta a 3,4e7px
// pero WebKit deja en 3,4e38px. GSAP parte del valor computado y lo convierte
// a la unidad pedida; con ese número la cuenta pierde toda la precisión
// (3,4e38 + (50 − 3,4e38) = 0) y en iPhone el botón en reposo quedaba con
// radio 0: cuadrado. Con un radio finito y la misma unidad que el computado
// no hay conversión que pueda fallar.
const REDONDO = 24;
const CUADRADO = 12;
const FORMA = { duration: 0.15, ease: "power2.out" };
const RETRAER = { scaleX: 0, duration: 0.3, ease: "power2.inOut" };
const NACER = { duration: 0.25, ease: "power3.out" };

// Los dos botones marcan su ícono `Menu` con `data-mnav-rayas`.
const rayasDe = (boton: Element | null) =>
  boton ? gsap.utils.toArray<SVGLineElement>("[data-mnav-rayas] line", boton) : [];

/** Suma el botón a la timeline de la cortina (0,7 s): termina con ella. */
export function sumarBoton(
  tl: gsap.core.Timeline,
  burger: HTMLElement | null,
  gemelo: HTMLElement | null,
) {
  const botones = [burger, gemelo].filter((b) => b !== null);
  const arriba = botones.map((b) => rayasDe(b)[0]);
  const abajo = botones.map((b) => rayasDe(b)[1]);
  const equis = gemelo?.querySelector("[data-mnav-equis]") ?? null;

  // `border-radius` es la ÚNICA propiedad de esta coreografía que no es
  // transform ni opacity (AGENTS §7). Es una excepción decidida con el owner:
  // no mueve el layout —repinta un botón de 3rem durante 0,15 s— y la
  // alternativa que cumple la regla, fundir un círculo con un cuadrado, no
  // se lee como una forma que cambia sino como dos que se pisan.
  tl.fromTo(botones, { borderRadius: REDONDO }, { borderRadius: CUADRADO, ...FORMA }, 0)
    .to(arriba, { transformOrigin: "100% 50%", ...RETRAER }, 0.07)
    .to(abajo, { transformOrigin: "0% 50%", ...RETRAER }, 0.07);
  if (equis) tl.fromTo(equis, { scale: 0 }, { scale: 1, transformOrigin: "50% 50%", ...NACER }, 0.4);
}

/** Sin movimiento no hay timeline: el gemelo queda de entrada en su estado
 *  final, que es el único en el que se lo ve. */
export function botonSinMovimiento(gemelo: HTMLElement | null) {
  if (!gemelo) return;
  gsap.set(gemelo, { borderRadius: CUADRADO });
  gsap.set(rayasDe(gemelo), { scaleX: 0 });
}
