import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { crearCielo, type Cielo } from "./cielo";
import { crearEncendidoMovil, ubicarEstrellas, type EncendidoMovil } from "./encendido";
import { aFabrica, partes, recordarEstrellas } from "./partes";
import { agregarPasos } from "./pasos";
import { agregarSalida, T } from "./salida";
import { agregarVuelo } from "./vuelo";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Cuánto scroll dura la escena, en altos de pantalla (además del primero). */
const LVH_DE_SCROLL = 430;
export const ALTO_PISTA_LVH = 100 + LVH_DE_SCROLL;
/** Desde cuándo la hoja ya está bajo el logo del header: el nav pasa a día. */
const HOJA_BAJO_EL_LOGO = T.HOJA + 0.5;

/** Lo que comparten los tramos de la escena. */
export type Piezas = {
  acto: HTMLElement[];
  hoja: HTMLElement;
  /** El wrapper del faro de celular, que baja girando. */
  linterna: HTMLElement;
  haces: SVGGElement;
  halo: SVGCircleElement;
  vidrio: SVGGElement;
  chispa: SVGGElement;
  circulos: SVGCircleElement[];
  lineas: SVGLineElement[];
  cielo: Cielo;
  encendido: EncendidoMovil;
  /** De dónde nace la chispa (la lámpara) y adónde flota, en unidades del cielo. */
  chispaSale: { lx: () => number; ly: () => number; fx: () => number; fy: () => number };
};

/**
 * El hero de Investigación bajo `lg`, en UNA escena pegajosa: el encendido al
 * cargar (encendido.ts) y, al scrollear, la misma historia de escritorio —el
 * hero cede, el faro se apaga y se hunde, la hoja 01 sube, las estrellas
 * bajan en bandada y se arman en la pregunta, y corren los cuatro pasos—. La
 * sección es `sticky` dentro de su pista (`[data-hero-pista]`, que da el
 * recorrido): sin pin de ScrollTrigger, que en un celular tironea cuando la
 * barra del navegador cambia el alto.
 *
 * El timeline no lleva `invalidateOnRefresh`: los valores función se vuelven
 * a medir en `alRefrescar`, que corre DENTRO de este contexto. Con la opción
 * de ScrollTrigger los tweens se reinicializan durante el refresh, y si ese
 * refresh lo dispara otro gsap.context de la página quedan anotados en él
 * (ver `aFabrica` en partes.ts).
 */
export function crearEscenaMovil(zona: HTMLElement, pista: HTMLElement) {
  const p = partes(zona);
  if (!p) return () => {};
  aFabrica(p);
  const devolverEstrellas = recordarEstrellas(p.circulos);
  const cielo = crearCielo({ zona, titulo: p.titulo, botones: p.botones, acto: p.acto[0], destino: p.destino, hoja: p.hoja });
  ubicarEstrellas(p.circulos, cielo);
  let restaurar = () => {};
  let alRefrescar = () => {};

  const ctx = gsap.context(() => {
    const encendido = crearEncendidoMovil({ raiz: p.linterna, titulo: p.titulo, botones: p.botones, estrellas: p.circulos });
    restaurar = encendido.restaurar;
    const ql = gsap.utils.selector(p.linterna);
    const qh = gsap.utils.selector(p.hoja);
    const lineas = p.q<SVGLineElement>("[data-hero-arista]");
    const chispa = p.q<SVGGElement>("[data-hero-chispa]")[0];
    /** El foco de la lámpara con el faro en su lugar (se descuenta lo hundido). */
    const lampara = () => {
      const r = encendido.nucleo.getBoundingClientRect();
      const hundido = Number(gsap.getProperty(p.linterna, "y"));
      return cielo.desdePantalla(r.left + r.width / 2, r.top + r.height / 2 - hundido);
    };

    // ── Estado pre-paint: la hoja bajo el piso, aristas sin dibujar, aparato
    //    oculto, chispa sin nacer. Los puntos ya están: son las estrellas.
    gsap.set(p.hoja, { autoAlpha: 1, yPercent: 100, y: 12 });
    gsap.set(lineas, { autoAlpha: 0 });
    gsap.set(chispa, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });
    gsap.set(qh("[data-riel]"), { autoAlpha: 0 });
    gsap.set(qh("[data-verbo]"), { yPercent: 110, y: 0 });
    gsap.set(qh("[data-frase]"), { autoAlpha: 0 });
    gsap.set(qh("[data-riel-relleno]"), { scaleX: 0 });
    zona.dataset.navTema = "noche";

    let tomado = false;
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      // La luz se devuelve cuando el TIMELINE llega al tope, no el scroll:
      // con scrub el timeline llega después, y un vaivén que arranca antes
      // se queda con el haz a medio camino.
      onUpdate: () => {
        zona.dataset.navTema = tl.time() > HOJA_BAJO_EL_LOGO ? "dia" : "noche";
        if (tomado && tl.time() === 0) {
          tomado = false;
          encendido.retomar();
        }
      },
      scrollTrigger: {
        trigger: pista,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          if (!tomado && self.progress > 0.001) {
            tomado = true;
            encendido.completar();
          }
        },
      },
    });
    const piezas: Piezas = {
      acto: p.acto,
      hoja: p.hoja,
      linterna: p.linterna,
      haces: ql<SVGGElement>("[data-linterna-haces]")[0],
      halo: ql<SVGCircleElement>("[data-linterna-halo]")[0],
      vidrio: ql<SVGGElement>("[data-linterna-vidrio]")[0],
      chispa,
      circulos: p.circulos,
      lineas,
      cielo,
      encendido,
      chispaSale: { lx: () => lampara().x, ly: () => lampara().y, fx: () => lampara().x - 22, fy: () => lampara().y - 38 },
    };
    agregarSalida(tl, piezas);
    agregarVuelo(tl, piezas);
    agregarPasos(tl, piezas);

    // Tras un refresh (rotación, fuentes) el cielo cambió de medida: los
    // tweens vuelven a evaluar sus valores función y se renderizan donde
    // estaban; en el tope las estrellas se reubican a mano (ahí ningún tween
    // las dibuja), y lo que sale de un proxy se vuelve a proyectar. Primero
    // se REBOBINA: invalidar a mitad de camino deja a cada tween tomando
    // como partida lo que ya había movido, y después no vuelve.
    alRefrescar = () => {
      cielo.olvidar();
      const en = tl.time();
      tl.time(0, true).invalidate();
      ubicarEstrellas(p.circulos, cielo);
      if (en > 0) tl.time(en, true);
      encendido.remedir();
      encendido.luz.apuntar();
      encendido.luz.girar();
    };
  }, zona);

  const oir = () => ctx.add(alRefrescar);
  ScrollTrigger.addEventListener("refresh", oir);
  return () => {
    ScrollTrigger.removeEventListener("refresh", oir);
    ctx.revert();
    cielo.limpiar();
    restaurar();
    devolverEstrellas();
    delete zona.dataset.navTema;
  };
}
