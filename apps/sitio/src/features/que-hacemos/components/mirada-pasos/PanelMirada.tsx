import Image from "next/image";
import type { CSSProperties } from "react";
import { MIRADA } from "@/features/que-hacemos/data/areas";

type Paso = (typeof MIRADA)[number];

/**
 * LAS MEDIDAS DE LA PILA NO ESTÁN ACÁ: viven en `globals.css`, como custom
 * properties de `[data-mirada]` —`--mirada-tope`, `--mirada-franja`,
 * `--mirada-solapa`, `--mirada-alto`, `--mirada-pila`—. Tienen que cambiar con
 * el alto de la pantalla (la pila trabada entra en el viewport o no se ve) y
 * las coreografías las leen del DOM, así que las manda un solo lugar. Eran
 * constantes de este archivo hasta el 2026-09-15.
 */

/**
 * Fondos OPACOS y alternados. Cada panel se apoya sobre el anterior, así que
 * un color con transparencia (`bg-x/NN`) dejaría ver el de abajo. Alternar
 * claro y oscuro es lo que hace legible el corte entre un panel y el
 * siguiente; el naranja no aparece (solo CTAs) y el verde queda para la idea
 * fuerza sobre los fondos claros, donde llega a AA (4.79:1 sobre gris-fondo).
 * Sobre azul-claro el verde no alcanza (2.97:1) y la idea va en azul.
 */
const PALETA = [
  // Blanca, no gris (el usuario, 2026-09-11): es la primera sobre la sección
  // blanca, y el borde alcanza para recortarla.
  { fondo: "bg-white text-azul-principal", numero: "text-gris-texto", idea: "text-verde-concepto-texto", texto: "text-azul-principal/80" },
  { fondo: "bg-azul-principal text-white", numero: "text-azul-claro/80", idea: "text-azul-claro", texto: "text-white/85" },
  { fondo: "bg-white text-azul-principal", numero: "text-gris-texto", idea: "text-verde-concepto-texto", texto: "text-azul-principal/80" },
  { fondo: "bg-azul-claro text-azul-principal", numero: "text-azul-principal/70", idea: "text-azul-principal", texto: "text-azul-principal/80" },
  { fondo: "bg-azul-medio text-white", numero: "text-white/75", idea: "text-white", texto: "text-white/85" },
  { fondo: "bg-gris-fondo text-azul-principal", numero: "text-gris-texto", idea: "text-verde-concepto-texto", texto: "text-azul-principal/80" },
] as const;

/**
 * Un paso de «Cómo trabajamos» como panel apilable.
 *
 * En desktop cada panel es `sticky` con un `top` que crece una solapa por
 * paso DENTRO DE SU GRUPO: cuando el siguiente sube y lo tapa, le deja a la
 * vista justo esa franja, la cabecera con el número y el verbo, que mide lo
 * mismo. Los dos grupos usan los mismos `top`, así que el primer panel del
 * segundo grupo se traba donde se trabó el primero del primero, después de
 * haber subido por encima de todo el grupo anterior (ver GrupoMirada). Las cabeceras se acumulan
 * arriba como pestañas de una carpeta y cuentan el recorrido; al terminar la
 * lista, la pila se despega entera y el scroll sigue normal. El apilado es
 * CSS puro; la llegada de cada card (fade y subida) la pone la coreografía
 * de `coreografia-mirada.ts`, nunca una clase: si el JS no corre, se ven.
 *
 * LOS PIES VAN ALINEADOS: cada panel mide una solapa más que el que le
 * sigue, así que trabados todos terminan en la misma línea. Sin eso, al
 * despegarse la pila el último llegaba antes al fondo de la lista y subía
 * por encima de las solapas de los otros, comiéndoselas (el usuario,
 * 2026-09-11: «que ninguna se coma a ninguna»). Con los pies parejos, el
 * fondo de la lista los empuja a todos a la vez y se van juntos.
 *
 * Van en DOS GRUPOS DE TRES (el usuario, 2026-09-15), y a cada grupo se le
 * reinicia el presupuesto de alto: por eso las seis cards miden lo mismo y en
 * una notebook entran enteras, que con los seis en una sola pila no pasaba
 * (globals.css lo explica con los números).
 *
 * `numero` es el paso en el recorrido, de 1 a 6: lo usa el rótulo y el color.
 * `enGrupo` es su lugar dentro del grupo —de eso sale el `top`— y `porGrupo`
 * cuántos son, para saber cuántas solapas le quedan debajo, que es lo que le
 * suma alto.
 *
 * En celular el panel va en flujo normal, con la foto debajo del texto.
 */
export function PanelMirada({
  paso,
  numero,
  total,
  enGrupo,
  porGrupo,
}: {
  paso: Paso;
  numero: number;
  total: number;
  enGrupo: number;
  porGrupo: number;
}) {
  const tono = PALETA[(numero - 1) % PALETA.length];
  /** Una solapa por cada panel que le queda debajo: con los pies parejos, la
   *  pila entera termina en la misma línea y se despegan todos juntos. */
  const solapa = (n: number) => `${n} * var(--mirada-solapa, 4rem)`;
  const desdeArriba = "var(--mirada-tope, 6rem) + var(--mirada-franja, 5.5rem)";

  return (
    <li
      data-mirada-card
      // LAS CUATRO CUENTAS, ya resueltas: dónde se traba y cuánto mide en cada
      // una de las dos variantes —los seis en una pila, o en grupos de tres—.
      // Cuál se usa lo decide el alto de la pantalla, y eso vive en
      // globals.css, que es donde puede haber una media query.
      //
      // CADA var LLEVA SU RESPALDO, y no por prolijidad: si las medidas no
      // llegan —una hoja vieja en caché, un motor que no resuelve algún
      // calc—, `top` y `height` quedan inválidos, y eso no degrada, MATA: sin
      // `top` el sticky no se traba nunca y sin `height` las seis cards caen a
      // su alto natural, todas iguales y chatas, sin escalera y sin apilado
      // (el usuario, 2026-09-15, con un video donde pasaba justo eso). Con el
      // respaldo, el peor caso es la geometría fija de siempre: la pila anda.
      style={
        {
          "--mirada-card-top-pila": `calc(${desdeArriba} + ${solapa(numero - 1)})`,
          "--mirada-card-top-grupo": `calc(${desdeArriba} + ${solapa(enGrupo)})`,
          "--mirada-card-alto-pila": `calc(var(--mirada-alto, 22rem) + ${solapa(total - numero)})`,
          "--mirada-card-alto-grupo": `calc(var(--mirada-alto, 22rem) + ${solapa(porGrupo - 1 - enGrupo)})`,
        } as CSSProperties
      }
      className={`${tono.fondo} border-azul-principal/10 flex flex-col rounded-[1.25rem] border lg:sticky`}
    >
      <div className="flex shrink-0 items-center gap-5 px-6 py-5 md:px-8 lg:h-[var(--mirada-solapa,4rem)] lg:py-0">
        <p className={`${tono.numero} font-mono text-[0.8rem] tracking-[0.18em]`}>
          0{numero}
        </p>
        <h3 className="font-display text-[1.75rem] font-bold tracking-[-0.02em] lg:text-[2.1rem]">
          {paso.verbo}
        </h3>
      </div>

      {/* Dos columnas parejas: el texto se lleva la mitad izquierda entera
          (el usuario, 2026-09-11: que abarque mejor ese espacio), sin tope
          de ancho, y con la idea fuerza en el tamaño de un subtítulo. En
          desktop el bloque DESCANSA EN EL PIE de la card, con aire hasta la
          cabecera (el usuario, 2026-09-11: más abajo y con más info); cuando
          la card siguiente asoma, `coreografia-achicado.ts` lo achica y lo
          sube hasta la cabecera antes de que lo tapen. Solo transform, y solo
          desde ahí: sin JS el bloque queda en reposo, abajo. */}
      <div className="grid flex-1 gap-8 px-6 pb-6 md:px-8 md:pb-8 lg:min-h-0 lg:grid-cols-2 lg:gap-10">
        <div data-mirada-texto className="lg:self-end">
          <p className={`${tono.idea} font-display text-[1.15rem] font-semibold lg:text-[1.5rem] lg:leading-snug`}>
            {paso.idea}
          </p>
          <p className={`${tono.texto} mt-4 font-sans text-[1rem] leading-relaxed lg:mt-7 lg:text-[1.15rem]`}>
            {paso.texto}
          </p>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] lg:aspect-auto lg:h-full">
          <Image
            src={paso.foto}
            alt={paso.fotoAlt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            // `fotoPos`: dónde anclar el recorte cuando la foto no es apaisada
            // (ver areas.ts); sin él, centrado.
            className={`object-cover ${"fotoPos" in paso ? paso.fotoPos : ""}`}
          />
        </div>
      </div>
    </li>
  );
}
