import Image from "next/image";
import type { MaterialDelSitio } from "@/features/biblioteca/contenido/material";
import { estiloDeFoco } from "@/lib/contenido/fotos";
import { esPortadaTipografica, estiloDe } from "./estilo-de-tipo";

/** El ancho del texto dentro de la tarjeta (100 menos el relleno de los dos lados) y lo que ocupa una letra de Manrope 800, en partes del cuerpo. */
const ANCHO_UTIL = 83;
const ANCHO_DE_LETRA = 0.62;

/** El tope por el largo del título: más largo, más chico, para que entre en el alto. */
function topePorLargo(largo: number): number {
  if (largo <= 30) return 13.5;
  if (largo <= 50) return 11.5;
  if (largo <= 80) return 9.4;
  if (largo <= 120) return 8;
  return 6.8;
}

/**
 * El tamaño del título de la tarjeta, en `cqw` (centésimas del ancho de la
 * tarjeta): la misma portada va en la fila de la intro, en la pila y en la
 * baraja del celular, y el título tiene que llenarla en las tres. Dos topes:
 * el del largo del título y el de su palabra más larga, que tiene que entrar
 * entera en un renglón —las palabras no se cortan con guion («conoci-miento»
 * en una portada se lee desprolijo)—.
 */
function tamanoDelTitulo(titulo: string): string {
  const palabraMasLarga = Math.max(...titulo.split(/\s+/).map((p) => p.length));
  const porPalabra = ANCHO_UTIL / (ANCHO_DE_LETRA * palabraMasLarga);
  return `${Math.min(topePorLargo(titulo.length), porPalabra).toFixed(2)}cqw`;
}

type PortadaDeMaterialProps = {
  material: MaterialDelSitio;
  /**
   * `tarjeta`: el título grande (Destacados). `miniatura`: solo el tipo y el
   * año (la fila del catálogo, donde el título ya está al lado y en una
   * portada de 120 px no se leía).
   */
  variante: "tarjeta" | "miniatura";
  /** El `sizes` de la imagen, para un material con portada propia. */
  sizes: string;
};

/**
 * La portada de un material, dibujada en código con el color, el ícono y el
 * nombre de su tipo (`estilo-de-tipo.ts`). Llena a su contenedor, que es quien
 * da la proporción y las esquinas. Un material con una portada propia —una
 * foto que cargó el equipo— muestra esa foto.
 */
export function PortadaDeMaterial({ material: m, variante, sizes }: PortadaDeMaterialProps) {
  if (!esPortadaTipografica(m.portada.src)) {
    return <Image src={m.portada.src} alt="" fill sizes={sizes} className="object-cover" style={estiloDeFoco(m.portada.foco)} />;
  }
  const { Icon, singular, fondo, velo, acento, borde } = estiloDe(m.tipo);
  const tarjeta = variante === "tarjeta";
  return (
    // Todo en <span>: la portada también va adentro de un <button> (la baraja).
    // El contenedor de las medidas `cqw` es el de afuera; el de adentro las usa.
    <span aria-hidden="true" lang="es" className="@container absolute inset-0 block">
      <span
        className={`absolute inset-0 flex flex-col text-left ${fondo} ${borde ? "ring-azul-principal/15 ring-1 ring-inset" : "ring-1 ring-white/10 ring-inset"} ${tarjeta ? "p-[8.5cqw]" : "justify-between p-3"}`}
      >
        {velo ? <span className={`absolute inset-0 ${velo}`} /> : null}
        <span className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle,currentColor_1.1px,transparent_1.6px)] [background-size:18px_18px]" />
        {tarjeta ? (
          <>
            <span className={`relative flex items-center gap-[3.5cqw] font-mono font-medium tracking-[0.14em] uppercase ${acento}`} style={{ fontSize: "4.6cqw" }}>
              <Icon className="h-[7.5cqw] w-[7.5cqw] shrink-0" />
              {singular}
            </span>
            <span className="font-display relative mt-auto block font-extrabold tracking-[-0.02em] text-balance break-words" style={{ fontSize: tamanoDelTitulo(m.titulo), lineHeight: 1.1 }}>
              {m.titulo}
            </span>
            <span className="relative mt-[6cqw] flex items-end justify-between gap-[4cqw] border-t border-current/20 pt-[4.5cqw] font-mono font-medium tracking-[0.08em] uppercase opacity-80" style={{ fontSize: "4.2cqw", lineHeight: 1.35 }}>
              <span className="line-clamp-2 text-balance">{m.autores}</span>
              <span className="shrink-0">{m.anio}</span>
            </span>
          </>
        ) : (
          <>
            <Icon className={`relative h-8 w-8 ${acento}`} />
            <span className="relative block">
              <span className="font-display block text-[1rem] leading-tight font-extrabold tracking-[-0.01em]">{singular}</span>
              <span className="mt-1 block font-mono text-[0.68rem] tracking-[0.12em] opacity-75">{m.anio}</span>
            </span>
          </>
        )}
      </span>
    </span>
  );
}
