/** El rótulo de un nivel del masthead («Dirección general», «Dirección»): mono, verde, con su guion. */
export function KickerRotulo({ children }: { children: React.ReactNode }) {
  return (
    <p
      data-reveal
      className="text-verde-concepto flex items-center gap-3 font-mono text-[0.7rem] font-medium tracking-[0.22em] uppercase"
    >
      <span aria-hidden="true" className="bg-verde-concepto/60 block h-px w-7" />
      {children}
    </p>
  );
}
