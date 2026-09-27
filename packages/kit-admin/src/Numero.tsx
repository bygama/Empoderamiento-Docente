/** Cuántos de algo esperan, y qué son, para decirlo: «3» y «sin leer». */
export type Cuenta = { cuantos: number; que: string };

/**
 * El número de una entrada de la sidebar o de una pestaña (DESIGN.md §11,
 * «El número»): una pastilla en el tono fuerte de las insignias, porque pide
 * atención. Se ve el número y se anuncia la frase entera («(3 sin leer)»),
 * como el punto que marca una entrada de la sidebar. Con 0 no hay nada que
 * decir y no se dibuja; de 100 para arriba, «99+». No sabe de ED.
 */
export function Numero({ cuantos, que }: Cuenta) {
  if (cuantos <= 0) return null;
  return (
    <>
      <span
        aria-hidden="true"
        className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-azul-principal px-1.5 text-admin-meta font-medium text-white tabular-nums"
      >
        {cuantos > 99 ? "99+" : cuantos}
      </span>
      <span className="sr-only">
        ({cuantos} {que})
      </span>
    </>
  );
}
