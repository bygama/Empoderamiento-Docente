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
 * INTRO DE LA MARCA EN CELULAR Y TABLET (< lg, solo en el Inicio). La marca se
 * presenta en tres tiempos, CENTRADA arriba —en el mismo eje que la pila de
 * fotos del hero—: primero el logo solo; después el nombre se destapa desde
 * atrás suyo mientras el logo se corre lo justo para que el conjunto siga
 * centrado; y cuando el hero se asienta, todo viaja a la izquierda, que es
 * donde vive. Los dos primeros van ENCIMADOS al fade de la pila de fotos, que
 * era tiempo muerto: el orden se lee (logo, nombre, fotos) sin alargar el intro.
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
  let centrar: gsap.core.Tween | undefined;

  const ctx = gsap.context(() => {
    const marca = nav.querySelector<HTMLElement>("[data-nav-marca]");
    const nombre = nav.querySelector<HTMLElement>("[data-nav-word]");
    const boton = nav.querySelector<HTMLElement>("[data-nav-burger]");
    const letras = nav.querySelector<HTMLElement>("[data-nav-word-in]");
    const logo = nav.querySelector<HTMLElement>("[data-nav-logo]");
    if (!marca || !nombre || !letras || !logo) return;

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
      // Si la presentación sigue en curso se le saca solo el corrimiento —haya
      // arrancado o no—; el fade del logo y el destape del nombre terminan.
      centrar?.kill();
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
      const centrada = Math.max(0, Math.min(alCentro, tope));
      // Con el logo solo, el conjunto se corre medio nombre a la derecha para
      // que lo centrado sea el logo. Mientras tanto el link no recibe toques:
      // su caja —con el nombre todavía tapado— llega hasta encima del botón.
      const logoSolo = alCentro + (caja.width - logo.getBoundingClientRect().width) / 2;
      centrar = gsap.fromTo(marca, { x: logoSolo }, { x: centrada, duration: 0.7, ease: "power3.inOut" });
      gsap
        .timeline()
        .set(marca, { pointerEvents: "none" })
        .fromTo(marca, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0)
        .add(centrar, 0.35)
        .fromTo(letras, { xPercent: -100 }, { xPercent: 0, duration: 0.7, ease: "power3.inOut" }, 0.35)
        .fromTo(letras, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0.4)
        .set(marca, { pointerEvents: "auto" });
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
