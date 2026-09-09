import Image from "next/image";
import { cx } from "../estilos";
import type { DatosFigura, Figura } from "./datos-figura";

/**
 * Encabezado de la rama LINEAL. Con recorte va suelta y centrada; con marco
 * va dentro de una caja de proporción fija: 5:3 si es apaisada, 4:5 si no.
 */
export function FiguraLineal({ datos, figura }: { datos: DatosFigura; figura: Figura }) {
  const { cutout, cutoutPosition, fullName, medidas, apaisado } = datos;

  if (figura === "recorte") {
    return (
      <Image
        src={cutout}
        alt={fullName}
        width={medidas.width}
        height={medidas.height}
        className="mx-auto max-h-[52vh] w-auto object-contain"
        style={{ objectPosition: cutoutPosition }}
      />
    );
  }

  return (
    <div
      className={cx(
        "ring-azul-principal/10 relative mx-auto w-full overflow-hidden rounded-[1.5rem] shadow-[0_30px_70px_-36px_rgb(31_45_77/0.45)] ring-1",
        apaisado ? "aspect-[5/3] max-w-[28rem]" : "aspect-[4/5] max-w-[20rem]",
      )}
    >
      <Image
        src={cutout}
        alt={fullName}
        fill
        sizes="(max-width: 768px) 90vw, 20rem"
        className="object-cover"
        style={{ objectPosition: cutoutPosition }}
      />
    </div>
  );
}
