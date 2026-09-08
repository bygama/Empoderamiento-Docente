import gsap from "gsap";
import { panelDe, type Contexto } from "./contexto";
import type { TemaKey } from "./data";

// ── APERTURA → FORMULARIO: crossfade limpio (sin vuelo) ───────────────────
// El índice se disuelve y el formulario entra en cascada. El rail — con su
// ícono y su título del tema — aparece de una, sin que nada vuele: un ícono
// chico cruzando la pantalla se leía como adorno, y el título ya no viajaba.
export function elegirTema(c: Contexto, key: TemaKey, cardEl: HTMLElement) {
  if (c.estado.animando) return;
  c.setTema(key);
  c.setVista("formulario");

  if (c.reduced) {
    gsap.set(panelDe(c, "apertura"), { autoAlpha: 0 });
    gsap.set(panelDe(c, "formulario"), { autoAlpha: 1 });
    return;
  }

  c.estado.animando = true;

  // esperar el re-render para que el rail ya tenga el tema elegido
  requestAnimationFrame(() => {
    const root = c.root;
    if (!root) {
      gsap.set(panelDe(c, "apertura"), { autoAlpha: 0 });
      gsap.set(panelDe(c, "formulario"), { autoAlpha: 1 });
      c.estado.animando = false;
      return;
    }

    const otras = gsap.utils.toArray<HTMLElement>("[data-tema-card]").filter((el) => el !== cardEl);
    const campos = gsap.utils.toArray<HTMLElement>("[data-campo]");

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        c.estado.animando = false;
        root.querySelector<HTMLInputElement>("#ct-nombre")?.focus({ preventScroll: true });
      },
    });

    tl.set(cardEl, { autoAlpha: 0 }, 0)
      // Los campos se apagan YA, en el instante 0. Sin esto el formulario
      // aparecía entero y de golpe sobre el índice todavía visible, y recién
      // a 0.34 se apagaba para volver a entrar en cascada: un doble destello.
      // El `fromTo` de abajo NO alcanza — su estado "from" recién se aplica
      // cuando el tween arranca (0.34), así que entre 0.26 y 0.34 los campos
      // seguían en autoAlpha 1.
      .set(campos, { autoAlpha: 0 }, 0)
      // El índice se va MÁS RÁPIDO que antes (0.4 → 0.28/0.26). Con la salida
      // larga, el formulario empezaba a encenderse a 0.26 mientras el índice
      // todavía estaba a media opacidad: las dos pantallas convivían ~0.14s y
      // se veía el solapamiento. Ahora la izquierda ya está prácticamente
      // afuera cuando la superficie del formulario recién arranca su fade.
      .to(otras, { autoAlpha: 0, y: 10, duration: 0.28, stagger: 0.02 }, 0)
      .to("[data-ap-head], [data-ap-h2]", { autoAlpha: 0, y: -16, duration: 0.26 }, 0)
      .set(panelDe(c, "apertura"), { autoAlpha: 0 }, 0.36)
      // La superficie del formulario (el panel blanco de campos) entra con un
      // fade, no con un `set` duro: apareciendo de golpe encima del índice se
      // veía como una caja blanca cayendo sobre la pantalla anterior.
      .fromTo(
        panelDe(c, "formulario"),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
        0.3,
      )
      .fromTo(
        campos,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.06 },
        0.36,
      );
  });
}

// ── FORMULARIO → APERTURA (cambiar de tema, sin perder lo tipeado) ────────
// La vuelta es el ESPEJO EXACTO de la ida, no otra animación que casualmente
// va para el otro lado. Antes no lo era y se notaba en tres cosas:
//
//  · No solapaba. La cadena `.to().set().fromTo()` apagaba el formulario
//    ENTERO (0,35s) y recién después encendía la apertura: en el medio había
//    un frame con la pantalla vacía. La ida sí solapa (el formulario entra a
//    0,28 mientras el índice todavía se está yendo hasta 0,42), así que la
//    vuelta enciende la apertura a 0,26 — antes de que el formulario termine
//    de irse. Por eso ahora todo va en posiciones ABSOLUTAS y no encadenado.
//
//  · El formulario se iba como una sola masa (autoAlpha del panel) cuando en
//    la ida los campos entran uno por uno. Ahora salen escalonados y hacia
//    abajo: deshacen literalmente el gesto con el que entraron (y: 18 → 0).
//
//  · Duraba ~1,3s contra los ~1,08s de la ida. Ahora las dos miden ~1,02s.
//
// Los `y` de origen son los mismos a los que cada pieza se fue en la ida
// (head arriba, tarjetas abajo): cada cosa vuelve por donde salió.
export function cambiarTema(c: Contexto) {
  if (c.estado.animando) return;
  const root = c.root;
  c.setVista("apertura");

  // El foco vuelve a la tarjeta del tema que estaba elegido: el botón que se
  // apretó ("Volver a los temas") desaparece con el formulario, y sin esto el
  // foco se cae al <body> — quien navega por teclado queda en la nada y tiene
  // que tabular desde el principio. Vale para los dos caminos, con animación
  // y sin ella.
  const volverElFoco = () =>
    root
      ?.querySelectorAll<HTMLButtonElement>("[data-tema-card]")
      [c.temaIdx]?.focus({ preventScroll: true });

  if (c.reduced) {
    gsap.set(panelDe(c, "formulario"), { autoAlpha: 0 });
    gsap.set(panelDe(c, "apertura"), { autoAlpha: 1 });
    volverElFoco();
    return;
  }

  c.estado.animando = true;

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      c.estado.animando = false;
      volverElFoco();
    },
  });

  tl.to(
    "[data-campo]",
    { autoAlpha: 0, y: 12, duration: 0.24, stagger: 0.02, ease: "power2.in" },
    0,
  )
    // La superficie del formulario (el panel blanco de campos) NO es un
    // [data-campo] — el rail navy sí lo es, pero la caja blanca es el
    // contenedor. Si se la apagara con un `set` duro, la superficie se
    // cortaría de golpe mientras sus campos todavía se están yendo. Por eso
    // se va con un tween propio, que arranca cuando los primeros campos ya
    // se disolvieron.
    .to(panelDe(c, "formulario"), { autoAlpha: 0, duration: 0.28, ease: "power2.in" }, 0.12)
    // El solape: la apertura ya está encendida mientras el formulario termina
    // de irse. Acá es donde antes había un frame en blanco.
    .set(panelDe(c, "apertura"), { autoAlpha: 1 }, 0.2)
    // Las DOS columnas ATERRIZAN JUNTAS. Antes la izquierda (rayita,
    // "Hablemos.", frase y foto) cerraba a 0.75 y el índice de la derecha
    // recién a 1.04: casi 300ms de diferencia, que es lo que se veía como
    // "la izquierda rápido y la derecha lenta".
    //
    // No alcanza con darles el mismo arranque y la misma duración: la
    // izquierda entra SIN stagger (todas sus piezas caen a la vez) mientras
    // las tarjetas escalonan, así que la izquierda cerraría primero. Por eso
    // su duración es más larga que la de una tarjeta suelta (0.43 vs 0.35):
    // el excedente es justo el stagger acumulado del índice.
    //
    // Toda la vuelta se acortó de ~0.85 a ~0.67 (los temas aparecen antes y
    // más rápido), moviendo el conjunto en bloque para no romper ese
    // aterrizaje simultáneo.
    .fromTo(
      "[data-ap-head], [data-ap-h2]",
      { autoAlpha: 0, y: -16 },
      { autoAlpha: 1, y: 0, duration: 0.43 },
      0.24,
    )
    .fromTo(
      "[data-tema-card]",
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.02 },
      0.24,
    );
}
