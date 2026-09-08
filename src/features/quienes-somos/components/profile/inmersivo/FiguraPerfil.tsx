import type { Ref } from "react";
import Image from "next/image";
import type { Profile } from "@/features/quienes-somos/data/equipo";
import { cx } from "./estilos";

type Figura = NonNullable<Profile["figura"]>;

type Props = {
  profile: Profile;
  /** Tratamiento de la fotografía (ver `Profile.figura`). */
  figura: Figura;
  /**
   * Dónde aparece: la capa FIJA de la apertura (con `data-portrait-outer` y
   * `data-portrait-mover`, que la coreografía y el overlay leen), el CIERRE
   * (reaparece integrada a la convergencia) o el encabezado de la rama LINEAL.
   */
  modo: "fija" | "cierre" | "lineal";
  refOuter?: Ref<HTMLDivElement>;
  refMover?: Ref<HTMLDivElement>;
  refCierre?: Ref<HTMLDivElement>;
  /** Solo en `fija`: el camino se recalcula cuando la figura ya midió. */
  onCargar?: () => void;
};

/**
 * Las tres apariciones de la figura. Con recorte va parada sobre el borde
 * inferior y sin rectángulo; con foto normal va enmarcada y flotando (una
 * foto rectangular "apoyada en el piso" se lee como un error de recorte).
 * Sin foto (`figura: "sin"`) no renderiza nada.
 *
 * El marco recorta con `object-cover` sobre una caja de proporción fija, así
 * que va con `fill`; el recorte manda el alto por CSS y deja el ancho en
 * `auto`, así que necesita las medidas reales del archivo (`cutoutSize`).
 */
export function FiguraPerfil({ profile, figura, modo, refOuter, refMover, refCierre, onCargar }: Props) {
  if (figura === "sin" || !profile.cutout) return null;
  const { cutout, cutoutPosition, fullName } = profile;
  const medidas = profile.cutoutSize ?? { width: 1200, height: 1600 };

  if (modo === "lineal") {
    return figura === "recorte" ? (
      <Image
        src={cutout}
        alt={fullName}
        width={medidas.width}
        height={medidas.height}
        className="mx-auto max-h-[52vh] w-auto object-contain"
        style={{ objectPosition: cutoutPosition }}
      />
    ) : (
      <div className="ring-azul-principal/10 relative mx-auto aspect-[4/5] w-full max-w-[20rem] overflow-hidden rounded-[1.5rem] shadow-[0_30px_70px_-36px_rgb(31_45_77/0.45)] ring-1">
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

  if (modo === "cierre") {
    return (
      <div
        ref={refCierre}
        aria-hidden="true"
        className={cx(
          "pointer-events-none absolute right-[3%] hidden lg:block",
          figura === "marco" ? "bottom-[9%] h-[min(36vh,320px)]" : "bottom-0 h-[min(48vh,440px)]",
        )}
      >
        {figura === "marco" ? (
          <div className="ring-azul-principal/10 relative h-full w-[calc(min(36vh,320px)*0.8)] overflow-hidden rounded-[1.4rem] opacity-95 shadow-[0_34px_70px_-40px_rgb(31_45_77/0.45)] ring-1">
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
          <div className="ring-azul-principal/10 relative h-[min(58vh,520px)] w-[clamp(14rem,21vw,19rem)] overflow-hidden rounded-[1.75rem] shadow-[0_44px_90px_-44px_rgb(31_45_77/0.5)] ring-1">
            <Image
              src={cutout}
              alt=""
              fill
              sizes="(min-width: 1024px) 19rem, 0px"
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
