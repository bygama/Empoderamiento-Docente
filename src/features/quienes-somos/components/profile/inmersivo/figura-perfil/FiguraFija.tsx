import type { Ref } from "react";
import Image from "next/image";
import { cx } from "../estilos";
import type { DatosFigura, Figura } from "./datos-figura";

/**
 * La capa FIJA de la apertura, con `data-portrait-outer` y
 * `data-portrait-mover`, que la coreografía y el overlay leen.
 */
export function FiguraFija({
  datos,
  figura,
  refOuter,
  refMover,
  onCargar,
}: {
  datos: DatosFigura;
  figura: Figura;
  refOuter?: Ref<HTMLDivElement>;
  refMover?: Ref<HTMLDivElement>;
  onCargar?: () => void;
}) {
  const { cutout, cutoutPosition, medidas, apaisado } = datos;

  return (
    <div
      ref={refOuter}
      data-portrait-outer
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 z-[5] hidden h-[min(74vh,700px)] w-[30rem] items-end justify-end lg:flex"
      style={{ right: "max(1.25rem, calc((100vw - 1440px)/2 + 2rem))" }}
    >
      <div
        ref={refMover}
        data-portrait-mover
        className={cx(
          "relative flex h-full w-full items-end justify-end",
          figura === "marco" && "pb-[9vh]",
        )}
      >
        {figura === "marco" ? (
          <div
            className={cx(
              "ring-azul-principal/10 relative overflow-hidden rounded-[1.75rem] shadow-[0_44px_90px_-44px_rgb(31_45_77/0.5)] ring-1",
              apaisado
                ? "h-[min(30vh,280px)] w-[calc(min(30vh,280px)*1.667)]"
                : "h-[min(58vh,520px)] w-[clamp(14rem,21vw,19rem)]",
            )}
          >
            <Image
              src={cutout}
              alt=""
              fill
              sizes={apaisado ? "(min-width: 1024px) 30rem, 0px" : "(min-width: 1024px) 19rem, 0px"}
              onLoad={onCargar}
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
            onLoad={onCargar}
            className="h-full w-auto object-contain object-bottom drop-shadow-[0_18px_44px_rgb(31_45_77/0.12)]"
            style={{
              objectPosition: cutoutPosition,
              maskImage: "linear-gradient(to bottom, #000 86%, rgb(0 0 0 / 0.4) 97%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, #000 86%, rgb(0 0 0 / 0.4) 97%, transparent 100%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
