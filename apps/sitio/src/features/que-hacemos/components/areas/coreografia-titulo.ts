import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * EL TÍTULO ATERRIZA (Gastón, 2026-09-16). «Áreas de especialización» entra
 * grande y solo, centrado en la pantalla —la puerta de la sección—, y con
 * un pin corto viaja en diagonal y se encoge hasta su lugar de rótulo en la
 * columna izquierda. Mientras aterriza, el riel del índice se dibuja de un
 * trazo, los siete ítems se desprenden debajo uno por uno y recién entonces
 * la columna de los artículos sube por debajo (toda: si solo se escondiera
 * el Área 01, la 02 asomaba bajo el título grande): título, lista, contenido.
 *
 * Es UN solo elemento, el h2 real, movido con transform (FLIP): el lugar
 * final es el que tiene en el layout, medido, así que aterriza exacto y si
 * la ventana cambia se vuelve a medir (invalidateOnRefresh + valores por
 * función). La escala va sobre el texto y no sobre el font-size —cambiar el
 * tamaño de letra al scrollear tiembla y desplaza lo de al lado— y sin
 * will-change a propósito: sin él Chrome vuelve a rasterizar el texto en la
 * escala grande y se lee nítido cuando está quieto.
 *
 * QUÉ SE PINNEA, y por qué no la sección: la columna del índice es sticky,
 * y GSAP deja al elemento pinneado con un translateY del largo del pin
 * cuando el pin termina; un sticky adentro de un ancestro transformado se
 * calcula sin el transform y se dibuja con él, así que el índice quedaba
 * 560 px más abajo de donde pega (medido 2026-09-16). Se pinnea entonces la
 * COLUMNA DE LOS ARTÍCULOS —la otra celda de la grilla— disparada por la
 * celda del índice al llegar arriba: en ese punto la caja sticky ya está
 * pegada a 0, así que el lugar del título no se mueve en todo el pin, y el
 * espaciador del pin alarga la fila de la grilla, con lo que el sticky del
 * índice también dura lo que tiene que durar.
 *
 * La medición no depende del scroll: al arrancar el pin la caja sticky
 * está en 0, así que la posición del título en pantalla es su offset
 * dentro de la caja. Se mide en onRefreshInit, con el transform que la
 * propia escena le dejó ya limpio: limpiarlo ADENTRO de un valor por
 * función corrompía la caché de transform de GSAP en plena inicialización
 * (quedaba scaleX 3 con scaleY 1 y el título tirado al pie). Lo que se
 * centra es la TINTA del texto (un Range sobre el contenido), no la caja
 * del h2: la caja es el ancho de la columna y el texto, ragged, es más
 * angosto.
 *
 * El SSR y el celular muestran el frame final (el título en su lugar).
 */

/** Cuánto crece el título en la puerta (1.5rem → 4.5rem). */
const ESCALA = 3;
/** Alto del pin, en pantallas: corto, la sección ya es larga con siete áreas. */
const RECORRIDO = 0.7;
/** Ventanas del timeline (0..1). */
const T = {
  viaje: { desde: 0.12, hasta: 0.82 },
  riel: { desde: 0.4, hasta: 0.68 },
  indice: { desde: 0.5, hasta: 0.95 },
  articulo: { desde: 0.62, hasta: 1 },
};

type Escena = {
  titulo: HTMLElement;
  /** La celda del índice en la grilla (estática): dispara el pin al llegar arriba. */
  celda: HTMLElement;
  /** La caja sticky que contiene el título y el índice. */
  caja: HTMLElement;
  /** La columna de los artículos: es lo que se pinnea y lo que se funde al final. */
  articulos: HTMLElement;
  /** Los artículos, que suben al final. NO la columna: al soltar el pin GSAP
   *  deja la columna con un translateY del largo del pin, y un tween de `y`
   *  sobre ella lo pisaba (la columna saltaba 560 px, medido 2026-09-16). */
  piezas: HTMLElement[];
  riel: HTMLElement;
  items: HTMLElement[];
};

export function crearAterrizaje({ titulo, celda, caja, articulos, piezas, riel, items }: Escena) {
  /** Desplazamiento desde el lugar del título hasta el centro de la
   *  pantalla, ya escalado (transform-origin arriba a la izquierda). */
  const medir = () => {
    gsap.set(titulo, { clearProps: "transform" });
    const b = caja.getBoundingClientRect();
    const t = titulo.getBoundingClientRect();
    const rango = document.createRange();
    rango.selectNodeContents(titulo);
    const tinta = rango.getBoundingClientRect();
    // Al arrancar el pin la caja sticky está pegada a 0: el título queda en
    // pantalla en su offset dentro de la caja. La tinta escala desde la
    // esquina de la caja del h2 (transform-origin 0 0). El ancho es el del
    // documento, sin la barra de scroll.
    const enPantallaY = t.top - b.top;
    return {
      x: document.documentElement.clientWidth / 2 - t.left - (tinta.left - t.left + tinta.width / 2) * ESCALA,
      y: window.innerHeight / 2 - enPantallaY - (tinta.top - t.top + tinta.height / 2) * ESCALA,
    };
  };
  let medida = { x: 0, y: 0 };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: celda,
      pin: articulos,
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * RECORRIDO)}`,
      scrub: 0.5,
      // Explícito: cuando el padre del pin es flex o grid, GSAP apaga el
      // espaciado por defecto, y sin espaciador la columna saltaba 560 px al
      // soltarse (medido 2026-09-16). Con él, la fila de la grilla crece lo
      // que dura el pin y la columna vuelve al flujo sin salto.
      pinSpacing: true,
      invalidateOnRefresh: true,
      onRefreshInit: () => {
        medida = medir();
      },
    },
  });

  gsap.set(titulo, { transformOrigin: "0 0" });
  tl.fromTo(
    titulo,
    { x: () => medida.x, y: () => medida.y, scale: ESCALA },
    { x: 0, y: 0, scale: 1, duration: T.viaje.hasta - T.viaje.desde, ease: "power2.inOut" },
    T.viaje.desde,
  );
  tl.fromTo(
    riel,
    { scaleY: 0, transformOrigin: "50% 0" },
    { scaleY: 1, duration: T.riel.hasta - T.riel.desde, ease: "power1.out" },
    T.riel.desde,
  );
  tl.fromTo(
    items,
    { autoAlpha: 0, x: -10 },
    {
      autoAlpha: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out",
      stagger: (T.indice.hasta - T.indice.desde - 0.2) / Math.max(1, items.length - 1),
    },
    T.indice.desde,
  );
  tl.fromTo(
    articulos,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: T.articulo.hasta - T.articulo.desde, ease: "power2.out" },
    T.articulo.desde,
  );
  tl.fromTo(
    piezas,
    { y: 48 },
    { y: 0, duration: T.articulo.hasta - T.articulo.desde, ease: "power2.out" },
    T.articulo.desde,
  );

  return tl;
}
