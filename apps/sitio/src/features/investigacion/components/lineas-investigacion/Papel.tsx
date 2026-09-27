import Link from "next/link";
import { alClicVerCaso } from "@/features/investigacion/casos/abrir-caso";
import { ClipPapel, FlechaManuscrita, SubrayadoMarcador } from "@/features/investigacion/casos/Garabatos";
import { ROTULO_MICRO } from "@/features/investigacion/casos/tintes";
import type { Lineas } from "@/features/investigacion/contenido/lineas";
import { ConResaltado } from "../ConResaltado";

/** Una línea de la mesa: su nombre y su pregunta, con la parte que subraya el marcador entre dobles asteriscos. */
type Linea = Lineas["lineas"][number];

/**
 * La mesa de trabajo: seis papeles sobre la carpeta, de TRES materiales que
 * rotan (hoja con clip, nota adhesiva con cinta, ficha de archivo), cada
 * uno dos veces y nunca dos iguales seguidos, apoyados con un giro leve
 * alternado. La variedad es material, no de contenido: la pregunta va
 * siempre en Manrope, al mismo tamaño; el manuscrito queda para las
 * anotaciones (el número de las fichas, la flecha de las notas) y el
 * marcador subraya la clave. Si se sacan los papeles, la información es
 * idéntica.
 */
const MATERIALES = ["hoja", "nota", "ficha"] as const;
const GIROS = [
  "lg:-rotate-[0.8deg]",
  "lg:rotate-[0.6deg]",
  "lg:-rotate-[0.5deg]",
  "lg:rotate-[0.7deg]",
  "lg:-rotate-[0.6deg]",
  "lg:rotate-[0.5deg]",
] as const;

/** Cinta adhesiva translúcida, como la de las láminas de los casos. */
function Cinta({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute h-6 w-20 border border-white/70 bg-white/35 shadow-sm ${className}`}
    />
  );
}

/** La clave de la pregunta, subrayada a marcador (doble pasada, temblor humano). */
function subrayada(clave: string) {
  return (
    <span className="relative whitespace-nowrap">
      {clave}
      <SubrayadoMarcador className="text-verde-concepto pointer-events-none absolute inset-x-0 -bottom-[0.18em] h-[0.5em] w-full" />
    </span>
  );
}

/**
 * Un papel de la mesa: el material cambia, la pregunta no. `caso` es el slug
 * del expediente que la muestra en acción; lo pone la carpeta, por el lugar
 * de la línea en la lista.
 */
export function Papel({ linea, caso, indice }: { linea: Linea; caso: string; indice: number }) {
  const material = MATERIALES[indice % 3];
  const numero = String(indice + 1).padStart(2, "0");
  // Tres tonos que se distinguen entre sí y de la carpeta (que es
  // azul-claro): la hoja blanca, la nota en un azul más claro que la carpeta
  // y la ficha en el gris del sitio, con borde.
  const superficie = {
    hoja: "bg-white bg-grain-light rounded-[4px] pt-9",
    nota: "bg-[color-mix(in_srgb,var(--color-azul-claro)_42%,white)] bg-grain-light rounded-[3px] pt-10",
    ficha: "bg-gris-fondo bg-grain-light rounded-[2px] border border-azul-principal/15 pt-8",
  }[material];
  return (
    <li
      data-linea
      className={`text-azul-principal relative px-7 pb-7 shadow-[0_22px_50px_-26px_rgb(31_45_77/0.55),0_2px_6px_-2px_rgb(31_45_77/0.2)] lg:px-8 ${superficie} ${GIROS[indice] ?? ""}`}
    >
      {material === "hoja" && (
        <ClipPapel className="text-azul-principal/45 absolute -top-3 right-7 h-11 w-6" />
      )}
      {material === "nota" && <Cinta className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />}

      {/* Número: mono en la hoja y la nota; a mano en la ficha (la única
          anotación manuscrita de ese papel). */}
      {material === "ficha" ? (
        <span aria-hidden="true" className="font-hand text-azul-medio absolute top-3 right-6 text-[2rem] leading-none">
          {numero}
        </span>
      ) : null}
      <div className="flex items-center gap-3">
        <span
          className={`font-display text-verde-concepto-texto text-[1.05rem] font-bold tabular-nums ${material === "ficha" ? "sr-only" : ""}`}
        >
          {numero}
        </span>
        <span className={`${ROTULO_MICRO} text-gris-texto/80`}>{linea.nombre}</span>
      </div>
      <h3 className="font-display mt-4 text-[1.32rem] leading-[1.24] font-bold tracking-[-0.015em] text-balance lg:text-[1.42rem]">
        {material === "nota" && (
          <FlechaManuscrita className="text-verde-concepto float-left mt-1 mr-2 h-5 w-8 rotate-[12deg]" />
        )}
        <ConResaltado texto={linea.pregunta} resaltar={subrayada} />
      </h3>
      {/* Al caso que la muestra en acción: en la misma página desliza hasta
          la pila y abre el expediente (abrir-caso.ts); el href es el link
          directo del caso, por si se abre en otra pestaña. */}
      <Link
        href={`#${caso}`}
        onClick={alClicVerCaso(caso)}
        aria-label={`Ver en acción: ${linea.nombre}`}
        className="group text-azul-principal hover:bg-azul-principal focus-visible:outline-verde-concepto mt-5 inline-flex items-center gap-2 rounded-full border border-current px-3 py-1.5 text-[0.78rem] font-medium transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Ver en acción
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">
          →
        </span>
      </Link>
    </li>
  );
}
