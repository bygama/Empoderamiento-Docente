import Image from "next/image";
import type { CSSProperties } from "react";
import { MIRADA } from "@/features/que-hacemos/areas";

type Paso = (typeof MIRADA)[number];

/**
 * LAS MEDIDAS DE LA PILA NO ESTÁN ACÁ: viven en `globals.css`, como custom
 * properties de `[data-mirada]` —`--mirada-tope`, `--mirada-franja`,
 * `--mirada-solapa`, `--mirada-alto`, `--mirada-pila`—. Las leen el CSS de
 * este archivo y también las coreografías, así que las manda un solo lugar.
 * Eran constantes de este archivo hasta el 2026-09-15.
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
 * paso: cuando el siguiente sube y lo tapa, le deja a la vista justo esa
 * franja, la cabecera con el número y el verbo, que mide lo mismo. Las cabeceras se acumulan
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
 * Los seis van en UNA pila (el usuario, 2026-09-11: «así se ven las 6»), y
 * la pila entera tiene que entrar en pantalla trabada: tope + franja del
 * título + cinco solapas + el último panel = 53.5rem, que son 856px. Por eso
 * la solapa y el alto base son más chicos que cuando eran dos pilas de tres.
 *
 * `indice` numera el paso (rótulo, color y cuánto baja el `top`); `total`
 * dice cuántos vienen después, que es lo que le suma alto.
 *
 * En celular el panel va en flujo normal, con la foto debajo del texto.
 */
export function PanelMirada({
  paso,
  indice,
  total,
}: {
  paso: Paso;
  indice: number;
  total: number;
}) {
  const tono = PALETA[indice % PALETA.length];
  const solapasDebajo = total - 1 - indice;

  return (
    <li
      data-mirada-card
      style={
        {
          top: `calc(var(--mirada-tope) + var(--mirada-franja) + ${indice} * var(--mirada-solapa))`,
          "--alto": `calc(var(--mirada-alto) + ${solapasDebajo} * var(--mirada-solapa))`,
        } as CSSProperties
      }
      className={`${tono.fondo} border-azul-principal/10 flex flex-col rounded-[1.25rem] border lg:sticky lg:h-[var(--alto)]`}
    >
      <div className="flex shrink-0 items-center gap-5 px-6 py-5 md:px-8 lg:h-[var(--mirada-solapa)] lg:py-0">
        <p className={`${tono.numero} font-mono text-[0.8rem] tracking-[0.18em]`}>
          0{indice + 1}
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
            className="object-cover"
          />
        </div>
      </div>
    </li>
  );
}
