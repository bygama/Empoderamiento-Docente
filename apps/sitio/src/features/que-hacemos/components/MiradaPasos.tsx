"use client";

import { useRef } from "react";
import type { CSSProperties } from "react";
import { MIRADA, MIRADA_INTRO } from "@/features/que-hacemos/data/areas";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { BandaAliados } from "./mirada-pasos/BandaAliados";
import { crearAchicado } from "./mirada-pasos/coreografia-achicado";
import { crearIndicador } from "./mirada-pasos/coreografia-indicador";
import { crearMirada } from "./mirada-pasos/coreografia-mirada";
import { lugarEnGrupo, POR_GRUPO } from "./mirada-pasos/grupos";
import { IndicadorPasos } from "./mirada-pasos/IndicadorPasos";
import { PanelMirada } from "./mirada-pasos/PanelMirada";

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
 * cabecera. El apilado es CSS puro (`position: sticky`, en `PanelMirada`).
 *
 * EN DOS GRUPOS DE TRES (el usuario, 2026-09-15). Los seis en una sola pila
 * no entraban en una notebook: cinco solapas se comen media pantalla y a la
 * última card le quedaban 14rem. Con grupos de tres se reinician el `top` y el
 * alto —no la lista, que sigue siendo una—, así que el cuarto panel se apoya
 * donde se apoyó el primero y lo tapa, y los tres comidos se quedan trabados
 * detrás en vez de subir (ver `grupos.ts` y las medidas en globals.css).
 * Lo que el apilado de seis daba y esto no —ver el recorrido completo— lo
 * devuelve el paso a paso de la franja (`IndicadorPasos`).
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
 * descartó). La franja mide lo mismo que un grupo trabado, así que se despega
 * con el último; los paneles se acomodan debajo, sin `z-index`, y la banda de
 * aliados cierra subiendo por encima de todo, con «Áreas» detrás (ver el
 * comentario de la banda).
 *
 * En celular no hay apilado, ni franja, ni grupos, ni entrada: el título, los
 * seis paneles y la banda van uno abajo del otro, con su alto natural. Seis
 * paneles pegajosos en un teléfono dejan al pulgar peleando para salir.
 */
export function MiradaPasos() {
  const rootRef = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const limpiarMirada = crearMirada(root);
    const limpiarAchicado = crearAchicado(root);
    const limpiarIndicador = crearIndicador(root);
    return () => {
      limpiarIndicador();
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
      // `data-mirada` es a quien globals.css le cuelga las medidas de la pila,
      // y estas dos variables las cierran: lo que suman las solapas cuando los
      // seis van en una pila y cuando van en grupos de tres. De ahí salen el
      // alto de la última card y el de la pila; cuál de las dos se usa lo
      // decide el alto de la pantalla, en globals.css.
      //
      // Se multiplica ACÁ, con el número ya resuelto, y no en el CSS con
      // `calc((var(--pasos) - 1) * var(--solapa))`: multiplicar una var por
      // otra var es el único patrón de calc que el sitio no usa en ningún otro
      // lado, y si un motor no lo soporta se cae toda la cadena de medidas de
      // una vez (y con ella el apilado, ver los respaldos de PanelMirada).
      data-mirada
      style={
        {
          "--mirada-solapas-pila": `calc(${MIRADA.length - 1} * var(--mirada-solapa))`,
          "--mirada-solapas-grupo": `calc(${POR_GRUPO - 1} * var(--mirada-solapa))`,
        } as CSSProperties
      }
      className="text-azul-principal relative z-20 scroll-mt-28 bg-white lg:-mt-[100svh] lg:-scroll-mt-1 lg:motion-reduce:mt-0 lg:motion-reduce:scroll-mt-28"
    >
      <div className="mx-auto w-full max-w-[88rem] px-5 py-20 md:px-10 md:py-24 lg:pb-0">
        {/* En desktop la franja y la pila van en LA MISMA celda de una
            grilla: la franja no ocupa lugar en el flujo y la pila arranca, por
            su padding, debajo de la banda blanca. */}
        <div className="lg:grid">
          {/* La franja mide, invisible, lo mismo que un grupo trabado: su caja
              baja hasta el pie de los paneles. Sin esto la franja medía 4rem,
              el fondo de la lista la empujaba mucho después que a los paneles,
              y quedaba clavada mientras ellos pasaban por detrás (el usuario,
              2026-09-11: «se queda fixed, eso no tendría que pasar»). Con los
              pies parejos se despega con la pila. No sirve devolver el alto con
              un margen negativo:
              el sticky se acota por la caja CON márgenes, y el pie volvería a
              quedar arriba. La parte transparente no atrapa el mouse. */}
          <header
            data-mirada-tope
            style={{ top: "var(--mirada-tope, 6rem)" }}
            className="lg:pointer-events-none lg:sticky lg:col-start-1 lg:row-start-1 lg:h-[var(--mirada-pila,47.5rem)] lg:self-start"
          >
            <div
              data-mirada-franja
              className="lg:pointer-events-auto lg:flex lg:h-[var(--mirada-titulo,4rem)] lg:items-center lg:bg-white"
            >
              <h2
                data-mirada-titulo
                className="font-display text-[2rem] font-bold tracking-[-0.02em] text-balance md:text-[2.75rem] lg:text-[2.1rem]"
                style={{ lineHeight: 1.1 }}
              >
                {MIRADA_INTRO.titulo}
              </h2>
              <IndicadorPasos />
            </div>
          </header>

          {/* La pila arranca justo debajo de lo que reserva la franja: no hay
              escenario vacío, las cards nacen invisibles y la entrada las
              prende en cascada cuando el título ya viaja.

              Entre panel y panel hay 10rem de aire EN EL FLUJO, que no se ven:
              quedan debajo del panel trabado. Sirven para que cada card
              descanse sola un momento antes de que asome la siguiente (el
              usuario, 2026-09-11: que el scroll sea más suave). Van como `gap`
              de una grilla y NO como margen: el sticky se acota por la caja con
              márgenes, y con margen abajo cada card se despegaba 10rem antes
              que las demás y la banda no llegaba a comerse a la primera.

              El `after` es el COLCHÓN: sin él, el último panel no se traba
              nunca, porque la lista termina justo en su borde y el sticky no
              puede salirse del contenido de su contenedor (el padding no
              cuenta, se probó). Mide lo que la banda de aliados necesita para
              subir desde el pie del viewport hasta el borde de la pila más
              8rem de descanso con la pila completa antes de que la banda
              asome; la banda se mete en este colchón con su margen negativo. */}
          <ol
            data-mirada-pila
            className="mt-12 space-y-4 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:grid lg:gap-y-40 lg:space-y-0 lg:pt-[var(--mirada-franja,5.5rem)] lg:after:block lg:after:h-[calc(100svh-var(--mirada-tope,6rem)-var(--mirada-franja,5.5rem)+8rem)] lg:after:content-['']"
          >
            {MIRADA.map((paso, i) => (
              <PanelMirada
                key={paso.verbo}
                paso={paso}
                numero={i + 1}
                total={MIRADA.length}
                {...lugarEnGrupo(i)}
              />
            ))}
          </ol>
        </div>

        {/* Cierra subiendo por encima del último grupo; el mecanismo está en
            la propia BandaAliados. */}
        <BandaAliados />
      </div>
    </section>
  );
}
