import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Boton } from "../Boton";
import { ENTRADA } from "../clases";

/** Una foto que se puede elegir: su archivo y su texto alternativo. */
export type FotoElegible = { src: string; alt: string };

/** Lo que el control necesita para ofrecer las fotos ya subidas. Llega por prop: el control no sabe de dónde salen. */
export type ElegirFoto = () => Promise<FotoElegible[]>;

/** «Educación» y «educacion» son lo mismo para quien busca. */
const normalizar = (t: string) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Si el alt tiene lo buscado (ya normalizado). Aparte: react-doctor lee el `includes` de un texto como el de una lista. */
function tieneLoBuscado(alt: string, buscado: string): boolean {
  return normalizar(alt).includes(buscado);
}

type Props = {
  /** El del panel: el botón que lo abre lo apunta con `aria-controls`. */
  id: string;
  nombre: string;
  fotos: readonly FotoElegible[];
  /** La que tiene el campo ahora: se marca, para no elegirla de nuevo sin querer. */
  actual: string;
  alElegir: (foto: FotoElegible) => void;
  alCerrar: () => void;
};

/**
 * Elegir una foto ya subida (DESIGN.md §11, «Elegir una foto»): un panel en
 * línea, debajo del campo, y no un modal. Arriba, una caja para filtrar por el
 * texto alternativo y «Cancelar»; debajo, la grilla, cada foto un botón con su
 * alt como nombre. Al abrir, el foco va al filtro; Escape cierra. Quien lo usa
 * le devuelve el foco a lo que lo abrió.
 */
export function ElegirYaSubida({ id, nombre, fotos, actual, alElegir, alCerrar }: Props) {
  const [buscado, setBuscado] = useState("");
  const refFiltro = useRef<HTMLInputElement>(null);
  useEffect(() => refFiltro.current?.focus(), []);
  const filtro = normalizar(buscado.trim());
  const visibles = filtro ? fotos.filter((f) => tieneLoBuscado(f.alt, filtro)) : fotos;
  const idFiltro = `${nombre}-filtro`;

  const alTeclear = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    alCerrar();
  };

  let vacio: string | null = null;
  if (!fotos.length) vacio = "Todavía no hay fotos subidas: subí una con «Elegir foto…».";
  else if (!visibles.length) vacio = `Nada coincide con «${buscado.trim()}».`;

  return (
    <section id={id} aria-label="Las fotos ya subidas" onKeyDown={alTeclear} className="space-y-3 rounded-xl border border-azul-claro/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={idFiltro} className="sr-only">
          Buscar entre las fotos ya subidas
        </label>
        <input
          ref={refFiltro}
          id={idFiltro}
          type="search"
          value={buscado}
          placeholder="Buscar por lo que muestra"
          onChange={(e) => setBuscado(e.target.value)}
          className={`${ENTRADA} min-w-0 flex-1`}
        />
        <Boton variante="terciario" onClick={alCerrar}>
          Cancelar
        </Boton>
      </div>
      {vacio ? <p className="text-admin-meta text-gris-texto">{vacio}</p> : null}
      <ul className="grid max-h-96 grid-cols-2 gap-2 overflow-y-auto p-1 sm:grid-cols-3">
        {visibles.map((f) => (
          <li key={f.src}>
            <button
              type="button"
              onClick={() => alElegir(f)}
              aria-label={`Elegir: ${f.alt || "una foto sin texto alternativo"}${f.src === actual ? " (la de ahora)" : ""}`}
              className={`flex w-full flex-col gap-1 rounded-lg border p-1.5 text-left transition-colors hover:border-azul-medio focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio ${f.src === actual ? "border-azul-principal" : "border-transparent"}`}
            >
              <span className="relative block aspect-4/3 w-full overflow-hidden rounded-md bg-gris-fondo">
                <Image src={f.src} alt="" fill sizes="160px" className="object-cover" />
              </span>
              <span className="line-clamp-2 text-admin-meta text-gris-texto">{f.alt || "Sin texto alternativo"}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
