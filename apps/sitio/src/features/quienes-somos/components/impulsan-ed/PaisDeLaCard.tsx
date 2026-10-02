import { Bandera } from "@/features/que-hacemos/components/proyectos-aplicaciones/Bandera";
import { banderasDe } from "./banderas-de-pais";

/**
 * El país al pie de una tarjeta del equipo. En celular y tablet lleva su
 * bandera adelante; con dos países van las dos banderas encimadas y sin el
 * texto, que no entra junto a la flecha (decisión de Gastón, 2026-10-01). En
 * computadora, solo el texto, como siempre.
 */
export function PaisDeLaCard({ pais, className }: { pais: string; className: string }) {
  const banderas = banderasDe(pais);
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      {banderas.length > 0 && (
        <span className="flex shrink-0 items-center lg:hidden">
          {banderas.map((clave, i) => (
            <Bandera key={clave} pais={clave} className={"h-[1.15rem] w-auto" + (i > 0 ? " -ml-1" : "")} />
          ))}
        </span>
      )}
      <span className={className + (banderas.length > 1 ? " max-lg:hidden" : "")}>{pais}</span>
    </span>
  );
}
