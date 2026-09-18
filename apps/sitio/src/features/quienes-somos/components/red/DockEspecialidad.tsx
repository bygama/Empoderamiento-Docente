import Image from "next/image";
import { AREA_PERSONAS, SPECS, type SpecKey } from "./red-datos";

/**
 * El DOCK: espacio fijo y reservado debajo del grafo — nada se superpone. Sin
 * área muestra la pista; con área, las fotos (que vuelan desde el nodo) y la
 * descripción de la especialidad.
 */
export function DockEspecialidad({ area }: { area: SpecKey | null }) {
  return (
    <div className="mx-auto mt-4 flex min-h-[8.5rem] max-w-3xl items-center justify-center">
      {area === null ? (
        <p className="text-gris-texto/70 text-center font-sans text-[0.95rem]">
          Pasá el cursor por una especialidad y mirá quiénes se convocan.
        </p>
      ) : (
        (() => {
          const spec = SPECS.find((s) => s.key === area)!;
          const personas = AREA_PERSONAS[area];
          return (
            <div
              key={area}
              className="border-azul-principal/8 flex w-full items-center gap-6 rounded-2xl border bg-white px-7 py-5 shadow-[0_18px_44px_-22px_rgb(31_45_77/0.25)]"
            >
              {/* Las fotos aterrizan acá (vuelan desde el nodo) */}
              {personas.length > 0 ? (
                <div className="flex shrink-0 -space-x-3">
                  {personas.map((per) => (
                    <span
                      key={per.key}
                      data-dock-av
                      className="relative block h-14 w-14 overflow-hidden rounded-full shadow-[0_8px_20px_-8px_rgb(31_45_77/0.4)] ring-2 ring-white"
                    >
                      <Image src={`/equipo/${per.key}.jpg`} alt={per.nombre} fill sizes="56px" className="object-cover" />
                    </span>
                  ))}
                </div>
              ) : (
                <span
                  data-dock-av
                  className="bg-verde-concepto/10 text-verde-concepto font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[1rem] font-bold"
                >
                  ED
                </span>
              )}
              <div className="min-w-0 text-left">
                <p data-dock-bit className="font-display text-azul-principal text-[1.05rem] leading-tight font-bold">
                  {spec.label}
                </p>
                <p data-dock-bit className="text-gris-texto mt-1 font-sans text-[0.88rem] leading-snug">
                  {spec.d}
                </p>
                <p data-dock-bit className="text-verde-concepto mt-1.5 font-sans text-[0.8rem] font-medium">
                  {personas.length > 0
                    ? personas.map((x) => x.nombre).join(" · ")
                    : "Red en expansión: especialistas según cada proyecto."}
                </p>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
