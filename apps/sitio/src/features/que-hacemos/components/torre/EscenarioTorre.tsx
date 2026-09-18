import { TAMBORES } from "../../data";
import { NUMEROS, type Geo } from "./geometria-torre";
import type { RefsTorre } from "./refs-torre";
import { RielEstaciones } from "./RielEstaciones";
import { RielProgreso } from "./RielProgreso";
import { EscenaTorre } from "./EscenaTorre";
import { ApoyoTorre } from "./ApoyoTorre";

type Props = {
  geo: Geo;
  refs: RefsTorre;
  onSaltar: (i: number) => void;
};

/** El escenario con la torre viva: rótulo, los dos rieles, la escena 3D y los apoyos. */
export function EscenarioTorre({ geo, refs, onSaltar }: Props) {
  const { rotulo, nav, rail, rielDer, fill, pct, apoyo, titulo, frase, detalle } = refs;
  return (
    <>
      {/* ── Rótulo de presentación sobre la línea (solo en el armado) ── */}
      <p
        ref={rotulo}
        aria-hidden="true"
        className="text-azul-principal/70 pointer-events-none absolute top-[12%] left-1/2 z-20 flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.18em] whitespace-nowrap uppercase"
        style={{ opacity: 0, transform: "translate(-50%, 0px)" }}
      >
        <span aria-hidden="true" className="bg-verde-concepto inline-block h-px w-8" />
        {NUMEROS[TAMBORES.length] ?? TAMBORES.length} líneas de acción
        <span aria-hidden="true" className="bg-verde-concepto inline-block h-px w-8" />
      </p>

      <RielEstaciones
        refNav={nav}
        refBoton={(i) => (el) => {
          rail.current[i] = el;
        }}
        onSaltar={onSaltar}
      />

      <RielProgreso refRiel={rielDer} refFill={fill} refPct={pct} />

      <EscenaTorre geo={geo} refs={refs} />

      <ApoyoTorre refApoyo={apoyo} refTitulo={titulo} refFrase={frase} refDetalle={detalle} />
    </>
  );
}
