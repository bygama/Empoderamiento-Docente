import { Bandera } from "@/features/que-hacemos/components/proyectos-aplicaciones/Bandera";
import type { PersonaDelSitio as Persona } from "@/features/quienes-somos/contenido/perfil-del-sitio";
import { resumenDePaises } from "./banderas-de-pais";

/**
 * El cierre del equipo en celular y tablet: la red, contada. Las banderas de
 * los países del equipo, cuántas personas y cuántos países son, y un punto
 * verde que baja con el scroll hacia el faro del footer (lo anima
 * `coreografia-equipo.ts`). En computadora sigue el cierre de siempre, la
 * línea con su nodo: esto no se dibuja desde `lg`.
 */
export function CierreDelEquipo({ personas }: { personas: readonly Persona[] }) {
  const { cuantos, banderas } = resumenDePaises(personas.map((p) => p.pais));
  return (
    <div className="mt-16 flex flex-col items-center text-center lg:hidden">
      <span className="flex items-center">
        {banderas.map((clave, i) => (
          <Bandera key={clave} pais={clave} className={"h-7 w-auto" + (i > 0 ? " -ml-1.5" : "")} />
        ))}
      </span>
      <p className="text-azul-claro/80 mt-4 font-mono text-[0.72rem] font-medium tracking-[0.22em] uppercase">
        {personas.length} personas · {cuantos} {cuantos === 1 ? "país" : "países"}
      </p>
      <span data-cierre-rastro aria-hidden="true" className="relative mt-7 block h-24 w-px">
        <span data-cierre-linea className="from-verde-concepto/60 absolute inset-0 block origin-top bg-gradient-to-b to-transparent" />
        <span
          data-cierre-punto
          className="bg-verde-concepto absolute -top-[5px] -left-[4.5px] block h-2.5 w-2.5 rounded-full shadow-[0_0_0_6px_rgb(31_154_120/0.16)]"
        />
      </span>
    </div>
  );
}
