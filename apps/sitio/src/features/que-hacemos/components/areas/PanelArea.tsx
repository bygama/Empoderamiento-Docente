import type { Area } from "@/features/que-hacemos/data/areas";

/**
 * El panel de detalle de cada área: «Qué te llevás» y «Para quién», como una
 * FICHA DE DOS PAÑOS. La separación entre los dos campos es un cambio de
 * superficie —gris a la izquierda, blanco a la derecha— y no una línea: se
 * ve de lejos y no agrega ningún borde nuevo. Lo eligió el usuario el
 * 2026-09-16 entre siete variantes vistas en vivo (rama claude/areas-opciones):
 * antes era una sola caja gris con los dos textos adentro y «Para quién»,
 * que es una sola frase, quedaba flotando.
 *
 * Los dos rótulos van en semibold para leerse como etiquetas, y la respuesta
 * de «Para quién» en medium y un punto más grande que los bullets, que son
 * una enumeración. Apilados en celular, cada paño conserva su fondo.
 */
export function PanelArea({ area }: { area: Area }) {
  const rotulo =
    "font-sans text-[0.78rem] font-semibold tracking-[0.22em] text-gris-texto uppercase";

  return (
    // El min-h es una red y no un relleno: con los bullets en un renglón las
    // siete dan el mismo alto natural, y el piso sólo evita la escalera si
    // mañana un copy crece.
    <div className="border-azul-principal/10 mt-8 overflow-hidden rounded-[1.25rem] border md:mt-9 lg:min-h-[10.5rem]">
      <div className="grid sm:grid-cols-2">
        <div className="bg-gris-fondo p-6 md:p-7">
          <p className={rotulo}>Qué te llevás</p>
          <ul className="mt-3 space-y-2">
            {area.teLlevas.map((t) => (
              <li key={t} className="flex gap-3 font-sans text-[0.98rem] leading-snug">
                <span
                  aria-hidden="true"
                  className="bg-verde-concepto mt-[0.55em] block h-1.5 w-1.5 shrink-0 rounded-full"
                />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 md:p-7">
          <p className={rotulo}>Para quién</p>
          <p className="text-azul-principal mt-3 max-w-[32ch] font-sans text-[1.02rem] leading-snug font-medium">
            {area.paraQuien}
          </p>
        </div>
      </div>
    </div>
  );
}
