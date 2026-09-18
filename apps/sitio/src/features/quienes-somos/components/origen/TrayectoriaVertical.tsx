import { HITOS } from "./data";

/**
 * Cronología vertical (mobile) del beat 3: misma historia, recorrido de
 * arriba hacia abajo. La línea verde crece con el scroll.
 */
export function TrayectoriaVertical() {
  return (
    <div className="relative mt-16 w-full max-w-[26rem] text-left md:hidden">
      <span
        aria-hidden="true"
        className="bg-azul-claro/20 absolute top-1 bottom-1 left-[7px] w-[2px] rounded-full"
      />
      <span
        data-constv-line
        aria-hidden="true"
        className="bg-verde-concepto absolute top-1 bottom-1 left-[7px] w-[2px] origin-top rounded-full"
      />
      <ol className="m-0 list-none p-0">
        {HITOS.map((h, i) => (
          <li key={h.t} className="relative flex gap-4 pb-6 last:pb-0">
            <span
              data-constv-node
              aria-hidden="true"
              className={`mt-[3px] block h-4 w-4 shrink-0 rounded-full ${
                i === HITOS.length - 1 ? "bg-naranja-accion" : "bg-verde-concepto"
              }`}
            />
            <div data-constv-copy>
              <p className="font-display text-[1.02rem] font-bold text-white">
                {h.t}
              </p>
              <p className="text-azul-claro/80 mt-0.5 font-sans text-[0.84rem] leading-snug">
                {h.d}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
