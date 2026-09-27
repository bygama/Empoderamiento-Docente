import Image from "next/image";
import type { KeyboardEvent, MouseEvent } from "react";
import type { Cambio } from "../cambio";
import { posicionDelFoco, type ValorDeFoto } from "../foto";

// Cuánto mueve cada pulsación de flecha, en fracción de la caja (0..1): un
// paso fino y uno grande con Shift, como un slider de dos ejes.
const PASO_FOCO = 0.05;
const PASO_FOCO_GRANDE = 0.25;

const MARCO = "relative block aspect-4/3 w-full max-w-xs overflow-hidden rounded-lg border border-gris-texto";

type Props = {
  valor: ValorDeFoto;
  alCambiar: (valor: Cambio<ValorDeFoto>) => void;
  pendiente: boolean;
  /** Con foco, la miniatura es el control que lo elige; sin foco (un logo, una lámina), la foto entera y nada más. */
  conFoco: boolean;
};

const redondear = (n: number) => Number(Math.min(1, Math.max(0, n)).toFixed(3));

/**
 * La miniatura de la foto del campo. Con foco, el punto se elige con un clic
 * sobre ella o con las flechas del teclado (Shift para el paso grande); el
 * marco es siempre 4/3 y no el de cada lugar donde va la foto: el recorte real
 * se ve en la vista previa. Sin foco, la foto va entera, porque no se recorta.
 */
export function MiniaturaConFoco({ valor, alCambiar, pendiente, conFoco }: Props) {
  if (!conFoco) {
    return (
      <div className={`${MARCO} bg-gris-fondo`}>
        <Image src={valor.src} alt={valor.alt} fill sizes="320px" className="object-contain p-3" />
      </div>
    );
  }

  const elegirFoco = (e: MouseEvent<HTMLButtonElement>) => {
    // Enter o espacio disparan un click con clientX/clientY en 0 (detail 0):
    // restado contra la caja da negativo, y el clamp lo llevaría a la
    // esquina superior izquierda. Comprobado en un navegador real (Chromium,
    // evento isTrusted), no es un supuesto. Por eso ese click se ignora acá
    // y el teclado mueve el foco por su lado, con moverFoco.
    if (e.detail === 0) return;
    const caja = e.currentTarget.getBoundingClientRect();
    const foco = { x: redondear((e.clientX - caja.left) / caja.width), y: redondear((e.clientY - caja.top) / caja.height) };
    // Updater, no un valor plano: si esto corre justo después de que una
    // subida resuelva pero antes de que React confirme ese cambio, un valor
    // plano armado contra el `valor` de este render pisaría el `src` nuevo.
    alCambiar((actual: ValorDeFoto) => ({ ...actual, foco }));
  };

  // Con el teclado: las flechas mueven el foco de a un paso (Shift, uno grande).
  const moverFoco = (e: KeyboardEvent<HTMLButtonElement>) => {
    const paso = e.shiftKey ? PASO_FOCO_GRANDE : PASO_FOCO;
    const dx = e.key === "ArrowLeft" ? -paso : e.key === "ArrowRight" ? paso : 0;
    const dy = e.key === "ArrowUp" ? -paso : e.key === "ArrowDown" ? paso : 0;
    if (dx === 0 && dy === 0) return;
    e.preventDefault();
    const foco = { x: redondear(valor.foco.x + dx), y: redondear(valor.foco.y + dy) };
    alCambiar((actual: ValorDeFoto) => ({ ...actual, foco }));
  };

  return (
    <>
      <button
        type="button"
        onClick={elegirFoco}
        onKeyDown={moverFoco}
        disabled={pendiente}
        aria-label="Punto de foco: tocá la miniatura o usá las flechas"
        className={`${MARCO} cursor-crosshair focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <Image src={valor.src} alt={valor.alt} fill sizes="320px" className="object-cover" style={{ objectPosition: posicionDelFoco(valor.foco) }} />
        <span
          aria-hidden="true"
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-verde-concepto shadow"
          style={{ left: `${valor.foco.x * 100}%`, top: `${valor.foco.y * 100}%` }}
        />
      </button>
      {/* Nada que ver, todo que oír: anuncia dónde quedó el foco después de moverlo, con mouse o teclado. */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">{`Foco en ${posicionDelFoco(valor.foco)}`}</span>
      <p className="text-admin-meta text-gris-texto">Tocá lo importante o usá las flechas: ahí se centra el recorte.</p>
    </>
  );
}
