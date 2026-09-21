import gsap from "gsap";

// Mismo sostén que el intro de escritorio (coreografia-intro.ts): la marca
// viaja a su lugar cuando el hero termina de asentarse, junto con los botones.
const SOSTEN_MS = 3200;
// Pasado este scroll el nombre se cierra y queda el logo solo: sobre el
// contenido, el renglón liviano molesta menos. Arriba de todo, vuelve.
const UMBRAL_NOMBRE = 40;
// Aire mínimo entre la marca centrada y el botón del menú. En pantallas muy
// angostas la marca no entra centrada sin tocarlo: se corre lo justo.
const AIRE_BOTON = 12;

/**
 * INTRO DE LA MARCA EN CELULAR Y TABLET (< lg, solo en el Inicio). El logo con
 * su nombre arrancan CENTRADOS arriba —en el mismo eje que la pila de fotos del
 * hero— y, cuando el hero se asienta, viajan a la izquierda, que es donde viven.
 * Después el nombre acompaña al scroll: visible arriba de todo, cerrado al bajar.
 *
 * Solo `transform` y `opacity`: la marca ya está maquetada a la izquierda y se
 * la corre al centro midiendo. El ancho del nombre no se anima: se pone y se
 * saca de un saque con el nombre ya invisible, para que el link no deje un área
 * tocable fantasma sobre el contenido.
 */
export function crearIntroMarcaMovil(nav: HTMLElement) {
  let reloj: number | undefined;
  let viajo = false;
  let abierto = true;
  let quitarScroll = () => {};

  const ctx = gsap.context(() => {
    const marca = nav.querySelector<HTMLElement>("[data-nav-marca]");
    const nombre = nav.querySelector<HTMLElement>("[data-nav-word]");
    const boton = nav.querySelector<HTMLElement>("[data-nav-burger]");
    if (!marca || !nombre) return;

    const ponerNombre = (visible: boolean) => {
      if (visible === abierto) return;
      abierto = visible;
      if (visible) gsap.set(nombre, { width: "auto", marginLeft: 12 });
      // `ctx.add`: estos tweens nacen después, desde un evento, y el contexto
      // solo se lleva en la limpieza lo que se crea adentro suyo.
      ctx.add(() => {
        gsap.to(nombre, {
          autoAlpha: visible ? 1 : 0,
          x: visible ? 0 : -8,
          duration: 0.3,
          ease: "power2.out",
          overwrite: true,
          onComplete: () => {
            if (!visible) gsap.set(nombre, { width: 0, marginLeft: 0 });
          },
        });
      });
    };

    const viajar = () => {
      if (viajo) return;
      viajo = true;
      window.clearTimeout(reloj);
      ctx.add(() => {
        gsap.to(marca, { x: 0, duration: 0.8, ease: "power3.inOut" });
      });
    };

    const alScrollear = () => {
      // Quien ya se puso a bajar no espera al sostén: la marca se va a su lugar.
      viajar();
      ponerNombre(window.scrollY < UMBRAL_NOMBRE);
    };

    gsap.set(nombre, { width: "auto", autoAlpha: 1, marginLeft: 12, x: 0 });

    if (window.scrollY > UMBRAL_NOMBRE) {
      // Recargaste a mitad de página: sin intro, directo al estado de lectura.
      viajo = true;
      abierto = false;
      gsap.set(nombre, { width: 0, marginLeft: 0, autoAlpha: 0, x: -8 });
    } else {
      const caja = marca.getBoundingClientRect();
      const alCentro = window.innerWidth / 2 - (caja.left + caja.width / 2);
      const tope = boton
        ? boton.getBoundingClientRect().left - AIRE_BOTON - caja.right
        : alCentro;
      gsap.set(marca, { x: Math.max(0, Math.min(alCentro, tope)) });
      reloj = window.setTimeout(viajar, SOSTEN_MS);
    }

    window.addEventListener("scroll", alScrollear, { passive: true });
    quitarScroll = () => window.removeEventListener("scroll", alScrollear);
  }, nav);

  return () => {
    window.clearTimeout(reloj);
    quitarScroll();
    ctx.revert();
  };
}
