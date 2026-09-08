import type { ItemDestacado } from "../../data/materiales";

/** Índice lateral sticky (solo desktop): marca el artículo en foco y navega. */
export function IndiceDestacados({
  items,
  activo,
  onIr,
}: {
  items: ReadonlyArray<ItemDestacado>;
  activo: number;
  onIr: (i: number) => void;
}) {
  return (
    <aside className="hidden lg:sticky lg:top-[24svh] lg:block lg:self-start">
      <nav aria-label="Índice de destacados">
        <p className="bg-white/10 px-3.5 py-2 font-mono text-[0.66rem] tracking-[0.14em] text-white/50 uppercase">
          Destacados
        </p>
        <ul>
          {items.map(({ titulo, rotulo }, i) => (
            <li key={titulo} className="border-b border-white/12">
              <button
                type="button"
                aria-current={activo === i}
                onClick={() => onIr(i)}
                className={`w-full px-3.5 py-3 text-left font-mono text-[0.78rem] tracking-[0.1em] uppercase transition-colors duration-300 ${
                  activo === i
                    ? "text-azul-principal bg-white"
                    : "text-white/65 hover:text-white"
                }`}
              >
                {rotulo}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
