import { Banderas } from "./Bandera";
import { nombrarPaises, type Ficha } from "./fichas";

// Desde cuántas banderas el juego ya no entra al lado del nombre del país.
const MUCHAS_BANDERAS = 4;

const PAIS = "font-display text-azul-principal text-[1.05rem] leading-tight font-semibold tracking-[-0.01em]";

/** Con quién y cuándo, en mono: lo que va separado por « · », en renglones. */
function Sello({ sello }: { sello: string }) {
  return (
    <p className="text-gris-texto shrink-0 text-right font-mono text-[0.72rem] leading-relaxed tracking-[0.18em] uppercase">
      {sello.split(" · ").map((parte) => (
        <span key={parte} className="block">
          {parte}
        </span>
      ))}
    </p>
  );
}

/**
 * El encabezado de una ficha. A la izquierda, el lugar de honor: la
 * bandera (o el juego de banderas) con el nombre del país, porque lo
 * internacional toma protagonismo (Gastón, 2026-09-10). Arriba a la
 * derecha SIEMPRE el sello, en mono y en dos renglones, con quién arriba y
 * los años abajo (Gastón, 2026-09-11). El país cede el ancho: si no entra
 * en un renglón al lado de las banderas, baja debajo de ellas. En celular,
 * partido al lado, empujaba la card 14px afuera de la pantalla y la página
 * se corría de costado; y en escritorio, con tres banderas y un sello largo
 * («Escuelas Techint»), quedaba en tres renglones angostos.
 *
 * Con cuatro países o más (Techint Group son siete, Daniela 2026-09-30) el
 * juego no entra al lado del nombre: las banderas van un escalón más
 * chicas, en su fila al lado del sello, y el nombre baja a todo el ancho de
 * la ficha, que es donde entra en dos renglones.
 */
export function EncabezadoFicha({ paises, sello }: Pick<Ficha, "paises" | "sello">) {
  if (paises.length >= MUCHAS_BANDERAS) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between gap-5">
          <Banderas paises={paises} chicas />
          <Sello sello={sello} />
        </div>
        <p className={`${PAIS} mt-2.5 text-balance`}>{nombrarPaises(paises)}</p>
      </div>
    );
  }
  return (
    <div className="relative flex items-start justify-between gap-5">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
        <Banderas paises={paises} />
        <p className={PAIS}>{nombrarPaises(paises)}</p>
      </div>
      <Sello sello={sello} />
    </div>
  );
}
