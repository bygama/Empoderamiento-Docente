import type { Ref } from "react";
import Image from "next/image";
import { cx } from "../estilos";
import type { DatosFigura, Figura } from "./datos-figura";

/**
 * Alto y apoyo de la caja del cierre. Vive fuera del componente a propósito:
 * son tres casos excluyentes y adentro se leían como un ternario anidado.
 */
function cajaDelCierre(figura: Figura, apaisado: boolean) {
  if (apaisado) return "bottom-[9%] h-[min(24vh,220px)]";
  if (figura === "marco") return "bottom-[9%] h-[min(36vh,320px)]";
  return "bottom-0 h-[min(48vh,440px)]";
}

/** La figura en el CIERRE: reaparece integrada a la convergencia. */
export function FiguraCierre({
  datos,
  figura,
  refCierre,
}: {
  datos: DatosFigura;
  figura: Figura;
  refCierre?: Ref<HTMLDivElement>;
}) {
  const { cutout, cutoutPosition, medidas, apaisado } = datos;

  return (
    <div
      ref={refCierre}
      aria-hidden="true"
      className={cx(
        "pointer-events-none absolute right-[3%] hidden lg:block",
        cajaDelCierre(figura, apaisado),
      )}
    >
      {figura === "marco" ? (
        <div
          className={cx(
            "ring-azul-principal/10 relative h-full overflow-hidden rounded-[1.4rem] opacity-95 shadow-[0_34px_70px_-40px_rgb(31_45_77/0.45)] ring-1",
            apaisado ? "w-[calc(min(24vh,220px)*1.667)]" : "w-[calc(min(36vh,320px)*0.8)]",
          )}
        >
          <Image
            src={cutout}
            alt=""
            fill
            sizes="256px"
            className="object-cover"
            style={{ objectPosition: cutoutPosition }}
          />
        </div>
      ) : (
        <Image
          src={cutout}
          alt=""
          width={medidas.width}
          height={medidas.height}
          className="h-full w-auto object-contain object-bottom opacity-90"
          style={{
            maskImage: "linear-gradient(to bottom, #000 84%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 84%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}
