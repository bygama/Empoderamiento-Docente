"use client";

import { useRef } from "react";
import type { CSSProperties } from "react";
import { MIRADA, MIRADA_INTRO } from "@/features/que-hacemos/areas";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { BandaAliados } from "./mirada-pasos/BandaAliados";
import { crearAchicado } from "./mirada-pasos/coreografia-achicado";
import { crearMirada } from "./mirada-pasos/coreografia-mirada";
import { ALTO_PILA_REM, PanelMirada, TITULO_REM, TOPE_REM } from "./mirada-pasos/PanelMirada";

/**
 * Cómo trabajamos, en los seis verbos que ED usa para contarse («La mirada
 * ED»: Escuchar, Investigar, Diseñar, Acompañar, Evaluar, Transformar).
 *
 * Va justo después del faro (Gastón, 2026-09-09), cuyo final es el velo
 * blanco del deslumbre: por eso la sección es blanca, y por eso la entrada
 * arranca con el título solo, en el medio de ese blanco. Para que no haya
 * una pantalla de blanco muerto entre la luz y el título, la sección se
 * mete una pantalla debajo del final del faro y pinta por encima (z-20
 * contra su z-10), como hacía la torre de líneas; nace apagada y se prende
 * en el relevo, cuando el faro ya está blanco pleno. El padding superior
 * del cuerpo es el TOPE de la franja: en el relevo la franja cae justo en
 * su lugar de sticky, y el título centrado se mide desde ahí.
 *
 * PANELES APILADOS (2026-09-11). Antes la sección se clavaba a pantalla
 * completa y un mazo de tarjetas aparecía de la nada con GSAP; se cambió por
 * la referencia que trajo el usuario en video (la sección «Our Expertise» de
 * madamagodiva.com): cada verbo es un panel con su color de fondo, y al
 * scrollear el siguiente sube y tapa al actual, que deja a la vista solo su
 * cabecera. Las seis cabeceras se acumulan arriba, en una sola pila, y
 * cuentan el recorrido. El apilado es CSS puro (`position: sticky`, en
 * `mirada-pasos/PanelMirada`).
 *
 * LA ENTRADA (el usuario, 2026-09-11) sí es coreografía, y vive en
 * `mirada-pasos/coreografia-mirada.ts`: apenas se prende la luz el título
 * aparece en el centro por tiempo —no por scroll—, se queda un momento,
 * viaja a la franja de arriba a la izquierda, y mientras viaja las cards
 * entran en cascada debajo. Como la intro de Contacto: corre sola. Y el
 * texto de cada card se achica hacia la cabecera antes de que la siguiente
 * lo tape, por scroll (`mirada-pasos/coreografia-achicado.ts`).
 *
 * El titular va en una FRANJA trabada arriba de la pila, a todo el ancho (el
 * usuario, 2026-09-11: el título «tendría que estar siempre presente», y no
 * «interrumpir el ancho de las cards», así que la columna al costado se
 * descartó). Los paneles se acomodan debajo de la franja, sin `z-index`:
 * nunca se pisan (la pila arranca debajo de la franja y se despegan juntas,
 * ver el comentario sobre la franja) y la banda de aliados tiene que poder
 * taparla. La banda cierra subiendo por encima de todo, con «Áreas» detrás
 * (ver el comentario de la banda).
 *
 * En celular no hay apilado, ni franja, ni entrada: el título, los paneles
 * y la banda van uno abajo del otro, con su alto natural. Seis paneles
 * pegajosos en un teléfono dejan al pulgar peleando para salir.
 */
export function MiradaPasos() {
  const rootRef = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const limpiarMirada = crearMirada(root);
    const limpiarAchicado = crearAchicado(root);
    return () => {
      limpiarAchicado();
      limpiarMirada();
    };
  }, []);

  return (
    // El ancla cae 4px pasado el borde y no en el borde exacto: ahí
    // ScrollTrigger todavía no da la zona por activa y la entrada no
    // arranca (mismo detalle que el CTA del faro, ver CierreFaro).
    <section
      ref={rootRef}
      id="como-trabajamos"
      data-indice="Cómo trabajamos"
      className="text-azul-principal relative z-20 scroll-mt-28 bg-white lg:-mt-[100svh] lg:-scroll-mt-1 lg:motion-reduce:mt-0 lg:motion-reduce:scroll-mt-28"
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-24 lg:pb-0">
        {/* En desktop la franja y la pila van en LA MISMA celda de una grilla:
            la franja no ocupa lugar en el flujo y la pila arranca, por su
            padding, debajo de la banda blanca. */}
        <div className="lg:grid">
          {/* La franja mide, invisible, lo mismo que la pila trabada: su caja
              baja hasta el pie de los paneles. Sin esto la franja medía 4rem,
              el fondo de la lista la empujaba mucho después que a los
              paneles, y quedaba clavada mientras ellos pasaban por detrás (el
              usuario, 2026-09-11: «se queda fixed, eso no tendría que
              pasar»). Con los pies parejos se despega con la pila. No sirve
              devolver el alto con un margen negativo: el sticky se acota por
              la caja CON márgenes, y el pie volvería a quedar arriba. La
              parte transparente no atrapa el mouse. */}
          <header
            style={
              {
                top: `${TOPE_REM}rem`,
                "--alto-franja": `${ALTO_PILA_REM}rem`,
              } as CSSProperties
            }
            className="lg:pointer-events-none lg:sticky lg:col-start-1 lg:row-start-1 lg:h-[var(--alto-franja)] lg:self-start"
          >
            <div
              data-mirada-franja
              className="lg:pointer-events-auto lg:flex lg:h-16 lg:items-center lg:bg-white"
            >
              <h2
                data-mirada-titulo
                className="font-display text-[2rem] font-bold tracking-[-0.02em] text-balance md:text-[2.75rem] lg:text-[2.1rem]"
                style={{ lineHeight: 1.1 }}
              >
                {MIRADA_INTRO.titulo}
              </h2>
            </div>
          </header>

          {/* La pila arranca justo debajo de lo que reserva la franja: no
              hay escenario vacío, las cards nacen invisibles y la entrada
              las prende en cascada cuando el título ya viaja.

              Entre panel y panel hay 10rem de aire EN EL FLUJO, que no se ven:
              quedan debajo del panel trabado. Sirven para que cada card
              descanse sola un momento antes de que asome la siguiente (el
              usuario, 2026-09-11: que el scroll sea más suave), y para que en
              el relevo con el faro la segunda todavía no toque a la primera.
              Van como `gap` de una grilla y NO como margen: el sticky se
              acota por la caja con márgenes, y con margen abajo cada card se
              despegaba 10rem antes que las demás y la banda no llegaba a
              comerse a la primera. Trabados, los paneles se apoyan uno sobre
              otro y el corte lo hace el cambio de color.

              El `after` es el COLCHÓN: sin él, el último panel no se traba
              nunca, porque la lista termina justo en su borde y el sticky no
              puede salirse del contenido de su contenedor (el padding no
              cuenta, se probó). Mide lo que la banda de aliados necesita para
              subir desde el pie del viewport hasta el borde de la pila (100svh
              menos tope y franja, 11.5rem) más 8rem de descanso con la pila
              completa antes de que la banda asome. La banda se mete en este
              colchón con su margen negativo (ver abajo). */}
          <ol
            data-mirada-pila
            style={{ "--franja": `${TITULO_REM}rem` } as CSSProperties}
            className="mt-12 space-y-4 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:grid lg:gap-y-40 lg:space-y-0 lg:pt-[var(--franja)] lg:after:block lg:after:h-[calc(100svh-3.5rem)] lg:after:content-['']"
          >
            {MIRADA.map((paso, i) => (
              <PanelMirada key={paso.verbo} paso={paso} indice={i} total={MIRADA.length} />
            ))}
          </ol>
        </div>

        {/* Cierra subiendo por encima de la pila; el mecanismo está en la
            propia BandaAliados. */}
        <BandaAliados />
      </div>
    </section>
  );
}
