import { ChevronDown } from "@/components/ui/icons";

/**
 * Una lista del admin (DESIGN.md §11): filas separadas por un divisor, en una
 * caja con el mismo borde. No sabe de ED: cada fila recibe lo que muestra.
 */
export function Lista({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y divide-azul-claro/60 rounded-xl border border-azul-claro/60">{children}</ul>;
}

type PropsDeFila = {
  /** A la izquierda de todo, una imagen chica que la identifica (la portada de un material): decorativa. */
  miniatura?: React.ReactNode;
  /** Lo principal: un nombre, y si hace falta algo al lado en meta. */
  principal: React.ReactNode;
  /** Una línea en meta debajo. */
  detalle?: React.ReactNode;
  /** A la derecha, antes de la acción. */
  insignias?: React.ReactNode;
  /** A la derecha de todo: un link o un botón. */
  accion?: React.ReactNode;
  /** Si llega, la fila va atenuada: sin acción, y esta nota en su lugar. */
  atenuada?: string;
  /** Lo que la fila despliega debajo, con un `details`: sin JavaScript, y se anuncia como botón. */
  desplegable?: { resumen: string; contenido: React.ReactNode };
};

/**
 * Una fila de la `Lista`. Lo principal y el detalle a la izquierda; las
 * insignias y la acción a la derecha, y abajo si no entran. Atenuada, lo
 * principal baja a `gris-texto` (4,83:1) y la nota ocupa el lugar de la
 * acción: no se esconde, se explica. Con miniatura, va a la izquierda de lo
 * principal, y lo principal y el detalle se corren junto a ella; ese bloque
 * crece y parte su texto antes de empujar la acción abajo (los títulos de
 * los materiales son largos), y recién baja si no le quedan 16rem.
 */
export function Fila({ miniatura, principal, detalle, insignias, accion, atenuada, desplegable }: PropsDeFila) {
  const texto = (
    <div className="min-w-0">
      <div className={`font-medium ${atenuada ? "text-gris-texto" : ""}`}>{principal}</div>
      {detalle ? <div className="mt-0.5 text-admin-meta text-gris-texto">{detalle}</div> : null}
    </div>
  );
  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        {miniatura ? (
          <div className="flex min-w-0 flex-1 basis-64 items-center gap-4">
            <div aria-hidden="true" className="shrink-0">
              {miniatura}
            </div>
            {texto}
          </div>
        ) : (
          texto
        )}
        <div className="flex flex-wrap items-center gap-3">
          {insignias}
          {atenuada ? <span className="text-admin-meta text-gris-texto">{atenuada}</span> : accion}
        </div>
      </div>
      {desplegable ? (
        <Desplegable resumen={desplegable.resumen} className="mt-2">
          <div className="pt-1 pl-4">{desplegable.contenido}</div>
        </Desplegable>
      ) : null}
    </li>
  );
}

/**
 * Lo que se despliega debajo de algo (DESIGN.md §11, «Lista», desplegable):
 * un `details`, sin JavaScript y anunciado como botón. El resumen en meta
 * medium `azul-medio` con un chevron que gira. Lo usa la fila de una `Lista`
 * y cualquier bloque que tenga un detalle que no hace falta ver siempre.
 */
export function Desplegable({ resumen, className, children }: { resumen: string; className?: string; children: React.ReactNode }) {
  return (
    <details className={`group/desplegable ${className ?? ""}`}>
      <summary className="-ml-1 inline-flex min-h-8 cursor-pointer list-none items-center gap-1 rounded-sm pr-1 text-admin-meta font-medium text-azul-medio focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio [&::-webkit-details-marker]:hidden">
        <ChevronDown size={16} className="shrink-0 -rotate-90 motion-safe:transition-transform group-open/desplegable:rotate-0" />
        {resumen}
      </summary>
      {children}
    </details>
  );
}
