"use client";

import { useRef, useState, type ReactNode } from "react";
import { Boton } from "./Boton";
import { resolverCambio, type Cambio } from "./cambio";
import { ChevronAbajo, ChevronArriba, Mas } from "./iconos";

type Props<T> = {
  /** Único en el formulario: arma los ids de los botones y de cada ítem. */
  nombre: string;
  etiqueta: string;
  /** El nombre de cada ítem: «Sección» → «Sección 1», «Agregar sección». */
  etiquetaItem: string;
  /** Cuántos entran como mucho: se ve siempre, y en el tope «Agregar» deja su lugar a la explicación. */
  maximo: number;
  ayuda?: string;
  /** Lo que dice la lista sin ítems: qué significa que esté vacía. */
  vacia: string;
  valor: readonly T[];
  alCambiar: (valor: Cambio<T[]>) => void;
  /** Un ítem vacío, nuevo en cada llamada. */
  itemVacio: () => T;
  /** Una clave estable por ítem (no el índice): así mover o quitar no le cambia el contenido a otro. */
  claveDe: (item: T) => string;
  /** Una línea que lo nombra en su cabecera, al lado del número. */
  resumenDe: (item: T) => string;
  porItem: (indice: number, item: T, cambiar: (valor: Cambio<T>) => void) => ReactNode;
};

// Los botones de mover: solo el ícono, 40 × 40, en `azul-medio` (5,11:1). En
// hover el fondo `azul-claro/30` baja el ícono a 4,36:1, que alcanza para un
// gráfico (3:1, WCAG 1.4.11).
const MOVER =
  "inline-flex size-10 items-center justify-center rounded-lg text-azul-medio transition-colors hover:bg-azul-claro/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio";

/**
 * Ítems que se agregan, se quitan y se mueven, hasta un máximo. Cada ítem es
 * una caja con su número, una línea que lo nombra, «Subir», «Bajar» y
 * «Quitar», y adentro lo que dibuja `porItem`. Se mueve con botones y no
 * arrastrando: el teclado y el lector de pantalla llegan igual, y cada cambio
 * se anuncia. Al agregar, el foco va al primer campo del ítem nuevo; al
 * quitar, a «Agregar».
 */
export function ListaVariable<T>({ nombre, etiqueta, etiquetaItem, maximo, ayuda, vacia, valor, alCambiar, itemVacio, claveDe, resumenDe, porItem }: Props<T>) {
  const [anuncio, setAnuncio] = useState("");
  const refLista = useRef<HTMLOListElement>(null);
  const item = etiquetaItem.toLowerCase();

  // Después de dibujar: el ítem nuevo, o el botón, todavía no existen en este render.
  const enfocar = (buscar: (lista: HTMLOListElement) => HTMLElement | null) =>
    requestAnimationFrame(() => {
      if (refLista.current) buscar(refLista.current)?.focus();
    });

  const agregar = () => {
    alCambiar((actual) => [...actual, itemVacio()]);
    setAnuncio(`Agregaste ${item} ${valor.length + 1}.`);
    enfocar((lista) => lista.querySelector<HTMLElement>(":scope > li:last-child :is(input, textarea, select)"));
  };
  const quitar = (i: number) => {
    alCambiar((actual) => actual.filter((_, j) => j !== i));
    setAnuncio(`Quitaste ${item} ${i + 1}.`);
    enfocar(() => document.getElementById(`${nombre}-agregar`));
  };
  const mover = (i: number, a: number) => {
    const clave = claveDe(valor[i]);
    const [igual, contrario] = a < i ? ["subir", "bajar"] : ["bajar", "subir"];
    alCambiar((actual) => {
      const nuevo = [...actual];
      [nuevo[i], nuevo[a]] = [nuevo[a], nuevo[i]];
      return nuevo;
    });
    setAnuncio(`Moviste ${item} ${i + 1} al lugar ${a + 1}.`);
    // El ítem se movió con su botón, pero en una punta ese botón ya no está: el foco pasa al otro.
    enfocar(() => document.getElementById(`${nombre}-${clave}-${igual}`) ?? document.getElementById(`${nombre}-${clave}-${contrario}`));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="font-display text-admin-seccion font-bold">
          {etiqueta} · {valor.length} de {maximo}
        </p>
        {ayuda ? <p className="mt-1 text-admin-meta text-gris-texto">{ayuda}</p> : null}
      </div>
      {valor.length === 0 ? <p className="text-admin-meta text-gris-texto">{vacia}</p> : null}
      <ol ref={refLista} className="space-y-3">
        {valor.map((actual, i) => {
          const resumen = resumenDe(actual);
          const numero = `${etiquetaItem} ${i + 1}`;
          return (
            <li key={claveDe(actual)} className="rounded-xl border border-azul-claro/60">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-azul-claro/60 py-1 pr-2 pl-4">
                <p className="min-w-0 truncate text-admin-meta font-medium">
                  {numero}
                  {resumen ? <span className="text-gris-texto"> · {resumen}</span> : null}
                </p>
                <div className="flex items-center gap-1">
                  {i > 0 ? (
                    <button id={`${nombre}-${claveDe(actual)}-subir`} type="button" aria-label={`Subir ${item} ${i + 1}`} title="Subir" onClick={() => mover(i, i - 1)} className={MOVER}>
                      <ChevronArriba size={20} />
                    </button>
                  ) : null}
                  {i < valor.length - 1 ? (
                    <button id={`${nombre}-${claveDe(actual)}-bajar`} type="button" aria-label={`Bajar ${item} ${i + 1}`} title="Bajar" onClick={() => mover(i, i + 1)} className={MOVER}>
                      <ChevronAbajo size={20} />
                    </button>
                  ) : null}
                  <Boton variante="destructivo" aria-label={`Quitar ${item} ${i + 1}`} onClick={() => quitar(i)}>
                    Quitar
                  </Boton>
                </div>
              </div>
              <div className="@container p-4">
                {porItem(i, actual, (cambio) =>
                  // Contra la lista más fresca (`actual`), no contra `valor` de este render: lo que resuelve tarde no pisa otro ítem.
                  alCambiar((lista) => lista.map((x, j) => (j === i ? resolverCambio(cambio, x) : x))),
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {valor.length < maximo ? (
        <Boton id={`${nombre}-agregar`} variante="secundario" onClick={agregar}>
          <Mas size={16} />
          Agregar {item}
        </Boton>
      ) : (
        <p className="text-admin-meta text-gris-texto">
          Llegaste al tope de {maximo}: para agregar, primero hay que quitar.
        </p>
      )}
      <span className="sr-only" aria-live="polite">
        {anuncio}
      </span>
    </div>
  );
}
