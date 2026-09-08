import { TAMBORES } from "../../data";
import type { Geo } from "./geometria-torre";
import { FotoTambor } from "./FotoTambor";
import { TamborTorre } from "./TamborTorre";
import type { RefsTorre } from "./refs-torre";

type Props = {
  geo: Geo;
  refs: RefsTorre;
};

/**
 * Escena 3D: la torre entera dentro de una perspectiva, con el picado de
 * cámara fijo y, adentro, la torre que se traslada (la escribe `pintar`).
 * Las matrices por tambor las crea al vuelo cada callback-ref.
 */
export function EscenaTorre({ geo, refs }: Props) {
  const { tower, drums, fotos, spans, chips, aros } = refs;
  return (
    <div
      className="relative min-h-0 flex-1"
      style={{ perspective: "1500px", perspectiveOrigin: "50% 42%" }}
    >
      {/* Picado de cámara fijo; adentro, la torre que se traslada. */}
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          transform: "translate(-50%, -46%) rotateX(11deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <div ref={tower} style={{ transformStyle: "preserve-3d" }}>
          {TAMBORES.map((t, i) => (
            <FotoTambor
              key={"foto-" + t.id}
              tambor={t}
              y={i * geo.sp}
              refFoto={(el) => {
                fotos.current[i] = el;
              }}
            />
          ))}
          {TAMBORES.map((t, i) => (
            <TamborTorre
              key={t.id}
              tambor={t}
              i={i}
              geo={geo}
              g={geo.drums[i]}
              refDrum={(el) => {
                drums.current[i] = el;
              }}
              refAro={(k) => (el) => {
                (aros.current[i] ??= [])[k] = el;
              }}
              refChip={(k) => (el) => {
                (chips.current[i] ??= [])[k] = el;
              }}
              refSpan={(j) => (el) => {
                (spans.current[i] ??= [])[j] = el;
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
