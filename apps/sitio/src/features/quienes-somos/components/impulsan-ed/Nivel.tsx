/**
 * Un nivel de la jerarquía: raíl con el encabezado a la izquierda, grilla a la
 * derecha. El encabezado dejó de ser una etiqueta mínima — la volanta numerada
 * y el título anuncian el cambio de nivel ANTES de que aparezcan las personas.
 *
 * `spine` decide cómo entra y sale el trazo vertical: "entra" baja desde las
 * direcciones (arranca transparente), "sale" se disuelve hacia el nodo de
 * cierre. Los tramos de niveles consecutivos se encuentran a mitad del margen,
 * así que la vertebral se lee como UNA línea continua.
 */
export function Nivel({
  volanta,
  titulo,
  spine,
  revealY,
  revealDur,
  revealStagger,
  children,
}: {
  /** Qué hace el grupo (mono, arriba). Antes decía «Nivel 0N»: con número
   *  se leía como pirámide, y esto es una red (Gastón, 2026-09-10). */
  volanta: string;
  /** Quiénes son, en horizontal: «Quienes lideran…», «Quienes facilitan…». */
  titulo: string;
  spine: "entra" | "sale";
  revealY: string;
  revealDur: string;
  revealStagger: string;
  children: React.ReactNode;
}) {
  const entra = spine === "entra";
  return (
    <div
      data-team-group
      data-reveal-y={revealY}
      data-reveal-dur={revealDur}
      data-reveal-stagger={revealStagger}
      data-reveal-scale="0.985"
      className="relative mt-20 grid gap-x-14 gap-y-9 lg:grid-cols-[20rem_minmax(0,1fr)]"
    >
      {/* Columna vertebral. Va detrás del nodo del encabezado y se dibuja con el
          scroll (scaleY desde arriba): la conexión llega antes que la gente. */}
      <span
        aria-hidden="true"
        data-spine
        className="pointer-events-none absolute left-[8.5px] hidden w-px lg:block"
        style={{
          top: entra ? "-5rem" : "-2.5rem",
          bottom: entra ? "-2.5rem" : "-3rem",
          background: entra
            ? "linear-gradient(to bottom, transparent, rgb(255 255 255 / 0.16) 9%, rgb(255 255 255 / 0.16))"
            : "linear-gradient(to bottom, rgb(255 255 255 / 0.16), rgb(255 255 255 / 0.16) 80%, transparent)",
        }}
      />

      <header data-reveal className="relative self-start pl-9">
        {/* Nodo del nivel sobre la vertebral — rima con el nodo de cierre. */}
        <span
          aria-hidden="true"
          className="absolute top-[0.28rem] left-0 grid h-[18px] w-[18px] place-items-center"
        >
          <span className="border-verde-concepto/35 col-start-1 row-start-1 block h-[18px] w-[18px] rounded-full border" />
          <span className="bg-verde-concepto col-start-1 row-start-1 block h-1.5 w-1.5 rounded-full" />
        </span>
        <p className="text-verde-concepto font-mono text-[0.68rem] font-medium tracking-[0.24em] uppercase">
          {volanta}
        </p>
        <h4 className="font-display mt-2.5 text-[1.32rem] leading-[1.2] font-bold text-white">
          {titulo}
        </h4>
        <span aria-hidden="true" className="mt-5 block h-px w-16 bg-white/18" />
      </header>

      {children}
    </div>
  );
}
