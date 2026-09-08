"use client";

import { TAMBORES } from "../data";
import { ZONA_SVH } from "./torre/geometria-torre";
import { useRefsTorre } from "./torre/refs-torre";
import { useTorreViva } from "./torre/useTorreViva";
import { CapasEscenario } from "./torre/CapasEscenario";
import { EscenarioTorre } from "./torre/EscenarioTorre";
import { FallbackTorre } from "./torre/FallbackTorre";

/**
 * La torre de tambores — el "espiral" de Qué hacemos (referencia Noomo).
 *
 * Todo el contenido de la página vive en una torre de cilindros de texto:
 * cada tambor lleva su nombre envuelto alrededor (rebanado en caracteres
 * posicionados con rotateY(θ)·translateZ(R), CSS 3D puro, sin WebGL). El
 * scroll hace dos cosas a la vez: TRASLADA la torre verticalmente (viajás de
 * tambor en tambor, viendo asomar el siguiente desde abajo) y hace GIRAR
 * cada tambor sobre su eje, cada uno con su desfase para que no roten en
 * bloque. La cara trasera se ve espejada y "esmerilada" (color transparent +
 * text-shadow — filter blur a 60fps pincharía).
 *
 * Geometría: radio ÚNICO para toda la torre (es una sola torre, como la
 * referencia); cada tambor ajusta tamaño de letra y repeticiones del nombre
 * para que su vuelta cierre exacta en esa circunferencia.
 *
 * Los textos de apoyo (título oficial + frase verde + detalle) NO viajan con
 * los tambores: viven en ranuras fijas al pie y se cruzan (crossfade +
 * textContent, sin re-render de React) cuando cambia el tambor activo. La
 * FOTO sí viaja: cuelga del centro de su tambor y sube con la torre, con un
 * parallax leve que la deja un toque atrás. Probamos apilarlas quietas en el
 * eje de cámara y encenderlas por distancia, pero sin recorrido el cambio de
 * imagen se lee como un parpadeo.
 *
 * Performance: solo se pintan los tambores en cuadro (los demás quedan
 * visibility:hidden); por frame se escriben ~2 transforms + las opacidades
 * de las rebanadas visibles.
 *
 * Mobile / touch / prefers-reduced-motion: bloques planos apilados.
 *
 * Piezas (`torre/`): geometría y constantes en `geometria-torre.ts`, los
 * refs en `refs-torre.ts`, el enrollado de las letras en
 * `enrollado-torre.ts`, el pintor (dueño de ocultos / activo / fijado) en
 * `pintar-torre.ts`, el armado con su bloqueo de scroll en `armado-torre.ts`
 * y el cableado con los ScrollTriggers en `useTorreViva.ts`; el markup en
 * CapasEscenario, EscenarioTorre (rieles, EscenaTorre con TamborTorre y
 * FotoTambor, ApoyoTorre) y FallbackTorre.
 */
export function TorreLineas() {
  const refs = useRefsTorre();
  const { zone, stage, superficie, velo, niebla } = refs;
  const { live, geo, saltarA } = useTorreViva(refs);

  return (
    <section
      id="recorrido"
      // Se mete una pantalla debajo del final del faro y pinta POR ENCIMA
      // (z-20 contra su z-10): la zona arranca justo donde el faro termina
      // en blanco, y durante ese solape el escenario del faro sale de cuadro
      // tapado por este. El relevo, el velo blanco y el armado del tambor
      // están explicados en `armado-torre.ts`.
      // Solo en lg + con motion, que es donde existe el runway del faro.
      className={
        "relative " +
        (live
          ? // Va POR ENCIMA del faro (z-20 contra su z-10) y sin fondo propio:
            // así el escenario se funde ENCIMA de la luz del deslumbre en vez
            // de que la luz se corra como una cortina. El gris de base lo pone
            // el body; la superficie real la trae el escenario (data-fondo).
            "z-20 lg:-mt-[100svh] lg:motion-reduce:mt-0"
          : "bg-gris-fondo")
      }
      aria-label="Líneas de acción"
    >
      {/* Grilla de puntos §6 — solo en el fallback plano: cuando la torre
          anima, la trama viaja dentro del escenario (data-fondo) para que
          aparezca junto con él sobre la luz del faro. */}
      {!live && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle,color-mix(in_srgb,var(--color-azul-principal)_22%,transparent)_1.1px,transparent_1.6px)] [background-size:22px_22px]"
        />
      )}

      {/* Contenido real para lectores de pantalla: la torre es decorativa. */}
      <ul className="sr-only">
        {TAMBORES.map((t) => (
          <li key={t.id}>
            <h3>{t.titulo}</h3>
            <p>{t.frase}</p>
            <p>{t.detalle}</p>
          </li>
        ))}
      </ul>

      <div
        ref={zone}
        className="relative"
        // Estaciones + arranque (ver ARRANQUE_SVH): cada estación conserva
        // sus SVH_POR_TAMBOR de scroll.
        style={live ? { height: `${ZONA_SVH}svh` } : undefined}
      >
        <div
          ref={stage}
          className={
            live ? "sticky top-0 flex h-[100svh] flex-col overflow-clip" : "flex flex-col"
          }
          aria-hidden={live || undefined}
        >
          {live && (
            <CapasEscenario
              refSuperficie={superficie}
              refVelo={velo}
              refNiebla={(i) => (el) => {
                niebla.current[i] = el;
              }}
            />
          )}

          {live && geo ? (
            <EscenarioTorre geo={geo} refs={refs} onSaltar={saltarA} />
          ) : (
            <FallbackTorre />
          )}
        </div>
      </div>
    </section>
  );
}
