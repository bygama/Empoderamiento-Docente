import { partirResaltado } from "@/lib/contenido/resaltado";
import type { Capitulo } from "./fichas";

/**
 * La bajada de un capítulo con su idea que ordena en negrita navy (la parte
 * entre dobles asteriscos): «capacidad instalada», «con investigación
 * detrás», «un mismo proceso». Mismo criterio que la bajada de Niveles
 * (Gastón, 2026-09-11). Sin marca, la bajada sale lisa.
 */
export function Bajada({ cap, className }: { cap: Capitulo; className: string }) {
  const { antes, clave, despues } = partirResaltado(cap.bajada);
  if (clave === null) return <p className={className}>{antes}</p>;
  return (
    <p className={className}>
      {antes}
      <strong className="text-azul-principal font-semibold">{clave}</strong>
      {despues}
    </p>
  );
}
