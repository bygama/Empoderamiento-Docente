import { POLVO } from "./polvo";

/**
 * Capa de fondo del hero (sin fondo propio: el cielo lo pone el envoltorio
 * compartido con la escena del faro). Lleva la luz que se «carga» con el
 * portal, el polvo de estrellas y el trazo de la estrella fugaz.
 */
export function CieloPolvo() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* Luz que se "carga" con el click: sube desde el botón, abajo.
          La elipse está centrada en el BORDE INFERIOR del hero y el span
          sigue una altura entera hacia abajo, sobre la escena del faro.
          Antes terminaba justo en el borde y la section lo recortaba con
          overflow-hidden: durante el viaje automático, cuando el borde
          cruzaba la pantalla, se veía una línea recta —verde arriba,
          noche abajo— partiendo las dos secciones. Mismo tamaño de
          elipse que antes (27.5% de un span del doble de alto = 55% del
          hero), así lo que se ve dentro del hero no cambia. */}
      <span
        data-qh-holdglow
        className="absolute inset-x-0 top-0 -bottom-full opacity-0"
        style={{
          background:
            "radial-gradient(60% 27.5% at 50% 50%, color-mix(in srgb, var(--color-verde-concepto) 26%, transparent), transparent 72%)",
        }}
      />
      {/* Polvo de estrellas del primer viewport + estrella fugaz: detalle
          fino que densifica el arranque (las fotos ya no están). El cielo
          base sigue siendo el compartido con la escena del faro. */}
      <span className="absolute inset-0 overflow-hidden">
        {POLVO.map((e, i) => (
          <span
            key={`p-${i}`}
            className="absolute rounded-full bg-white"
            style={{ left: `${e.x}%`, top: `${e.y}%`, width: e.r, height: e.r, opacity: e.o }}
          />
        ))}
        {/* Trazo de la fugaz: posición/alpha los maneja GSAP. */}
        <span
          data-qh-fugaz
          className="absolute top-0 left-0 h-[1.5px] w-[110px] rounded-full opacity-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.9) 55%, rgba(255,255,255,0.2))",
          }}
        />
      </span>
    </div>
  );
}
