import { ButtonSecondary } from "@/components/ui/ButtonSecondary";
import { getLenis } from "@/lib/lenis";

// «Ver líneas de acción» viaja con Lenis hasta el ARRANQUE de la torre.
// El salto nativo a #lineas "no llevaba a ningún lado": caía 112px antes
// del arranque (scroll-mt del ancla, pensado para el listado plano) sobre
// el faro casi blanco, y Lenis, si todavía estaba deslizando, lo pisaba
// en el frame siguiente. +4px para que ScrollTrigger dé la zona por
// activa y arranque el armado (en el borde exacto, progreso 0, no lo
// hace). El href queda como semántica y como fallback sin JS.
const irALineas = (e: React.MouseEvent<HTMLAnchorElement>) => {
  const destino = document.getElementById("lineas");
  if (!destino) return;
  e.preventDefault();
  const top = destino.getBoundingClientRect().top + window.scrollY + 4;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(top, { duration: 1.6 });
  else window.scrollTo({ top, behavior: "smooth" });
};

/**
 * S4 · Cierre sobre la noche. Titular pedido por Gastón (VALIDAR con ED);
 * CTA real del proyecto hacia #lineas — en el copy validado es la acción
 * secundaria del hero (la primaria es «Conversemos»), acá va como
 * secundario (transparente + borde) y única acción del plano final:
 * VALIDAR jerarquía con ED. `inert` por defecto: en el fallback está
 * invisible y no debe recibir foco; la coreografía lo quita al montar.
 */
export function CierreFaro() {
  return (
    <div data-esc="cierre" inert className="pointer-events-none absolute inset-0 flex items-center" style={{ opacity: 0 }}>
      <div className="mx-auto w-full max-w-screen-xl px-5 md:px-10">
        {/* Blanco, no navy: el cierre ya no ocurre sobre el amanecer
            sino sobre la noche iluminada por el faro. */}
        {/* Angosto y en tres líneas parejas (text-balance): a 19ch y
            4rem el titular cruzaba el cuadro entero y, con el naranja
            abajo, el cierre pesaba de más (pedido de Mateo,
            2026-09-02). */}
        <p
          className="font-display max-w-[16ch] font-extrabold tracking-[-0.025em] text-balance text-white"
          style={{
            fontSize: "clamp(2.2rem, 1rem + 2.8vw, 3.5rem)",
            lineHeight: 1.08,
            textShadow: "0 2px 40px rgb(6 11 25 / 0.75)",
          }}
        >
          La transformación queda encendida en cada equipo.
        </p>
        {/* Secundario sobre navy (transparente + borde) en vez del
            naranja: sobre la noche el primario era un bloque que
            competía con el titular. Sigue siendo la única acción. */}
        <div data-cta className="pointer-events-auto mt-9" style={{ opacity: 0 }}>
          <ButtonSecondary href="#lineas" variant="dark" withArrow onClick={irALineas}>
            Ver líneas de acción
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
}
