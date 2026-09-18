import type { Capitulo } from "@/features/que-hacemos/proyectos";

/**
 * La bajada de un capítulo con su idea que ordena en negrita navy
 * (`Capitulo.resaltado`, un tramo literal del texto): «capacidad
 * instalada», «con investigación detrás», «un mismo proceso». Mismo
 * criterio que la bajada de Niveles (Gastón, 2026-09-11). Si el tramo no
 * está en el texto, la bajada sale lisa.
 */
export function Bajada({ cap, className }: { cap: Capitulo; className: string }) {
  const i = cap.resaltado ? cap.bajada.indexOf(cap.resaltado) : -1;
  if (i < 0 || !cap.resaltado) return <p className={className}>{cap.bajada}</p>;
  return (
    <p className={className}>
      {cap.bajada.slice(0, i)}
      <strong className="text-azul-principal font-semibold">{cap.resaltado}</strong>
      {cap.bajada.slice(i + cap.resaltado.length)}
    </p>
  );
}
