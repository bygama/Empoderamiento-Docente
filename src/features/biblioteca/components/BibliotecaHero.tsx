"use client";

import { useRef } from "react";
import gsap from "gsap";
import { Search } from "@/components/ui/icons";
import { CategoriasRail } from "./CategoriasRail";
import { PuntosFaro } from "@/components/ui/PuntosFaro";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Hero de Biblioteca — "Publicaciones y recursos" (sitemap: apertura, ancla a
 * Materiales). El azul-principal va A SANGRE COMPLETA (toda página parte de
 * azul, DESIGN §1) y solo las esquinas INFERIORES se redondean: el bloque se
 * lee como un telón que se levanta sobre el gris-fondo del body — esa es la
 * costura con Destacados. No llega a 100svh: deja asomar la sección
 * siguiente, criterio de los otros heroes del sitio.
 *
 * Contenido en el contenedor estándar (`max-w-screen-xl` + `px-5/px-10`):
 * titular display centrado, bajada, buscador y riel de categorías al pie.
 * Branding:
 *  - Patrón §6 vivo: puntos base tenues + el "haz del faro" que sigue al
 *    cursor y enciende los puntos a su paso (<PuntosFaro />). El glow
 *    superior de azul-claro queda contenido para no lavar el titular.
 *  - Titular blanco con "y recursos" en verde-concepto (verde para conceptos,
 *    DESIGN.md §6).
 *  - Buscador: única acción del bloque → botón naranja (naranja solo CTAs).
 *
 * Entrada — "el faro barre la biblioteca" (~2.2s, un solo gesto): el haz de
 * PuntosFaro barre de izquierda a derecha encendiendo los puntos; el titular
 * sube desde su máscara cuando la luz cruza el centro, el glow superior
 * "queda prendido", la bola azul-medio entra deslizándose traída por el
 * barrido, y bajada + buscador + riel rematan con el haz ya entregado al
 * cursor. Los tiempos de este timeline están ACOPLADOS a las constantes del
 * barrido en PuntosFaro. Sin motion / prefers-reduced-motion: todo visible.
 */
// Enter en el campo y clic en la lupa hacen lo MISMO (hoy, bajar al listado):
// un solo lugar donde cambiarlo cuando el buscador filtre de verdad. Vive en
// el módulo porque no lee props ni estado: adentro se rearmaría por render.
function irAMateriales() {
  document.getElementById("materiales")?.scrollIntoView({ behavior: "smooth" });
}

export function BibliotecaHero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-bh-word]", { yPercent: 115 });
      gsap.set("[data-bh-glow]", { autoAlpha: 0 });
      gsap.set("[data-bh-bola]", { x: -170, y: 170 });
      gsap.set("[data-bh-rise]", { autoAlpha: 0, y: 24 });
      gsap.set("[data-bh-pill]", { autoAlpha: 0, x: 28 });

      // Tiempos ABSOLUTOS acoplados al barrido del haz (PuntosFaro: delay
      // 0.3 + 1.3s de recorrido, cruza el centro ≈ 0.95s): el titular se
      // revela cuando la luz pasa por detrás, el glow "queda prendido", la
      // bola entra traída por el barrido, y los remates cierran con el haz
      // ya en modo cursor.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-bh-word]", { yPercent: 0, duration: 1, stagger: 0.12 }, 0.75)
        .to("[data-bh-glow]", { autoAlpha: 1, duration: 1, ease: "power2.out" }, 1.0)
        .to("[data-bh-bola]", { x: 0, y: 0, duration: 1 }, 0.9)
        .to("[data-bh-rise]", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, 1.45)
        .to("[data-bh-pill]", { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.05 }, 1.7);
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      className="bg-azul-principal relative isolate flex min-h-[87svh] flex-col overflow-hidden rounded-b-[2rem] pt-28 pb-5 md:rounded-b-[2.75rem] md:pt-32 md:pb-7"
      aria-label="Biblioteca — publicaciones y recursos"
    >
      {/* Fondo: glow de faro contenido + forma plana (manual §6) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span
          data-bh-glow
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 42% at 50% 0%, color-mix(in srgb, var(--color-azul-claro) 24%, transparent), transparent 70%)",
          }}
        />
        <span
          data-bh-bola
          className="bg-azul-medio/25 absolute -bottom-44 -left-36 h-[26rem] w-[26rem] rounded-full"
        />
        {/* Puntos vivos: capa base + haz que sigue al cursor */}
        <PuntosFaro />
      </div>

      {/* ── Titular + bajada + buscador (centrados) ────────────────────── */}
      <div className="mx-auto my-auto flex w-full max-w-screen-xl flex-col items-center px-5 pb-12 text-center md:px-10">
        <h1
          className="font-display font-extrabold tracking-[-0.03em] text-white"
          style={{ fontSize: "clamp(2.75rem, 1.1rem + 7vw, 6.25rem)", lineHeight: 1 }}
        >
          {/* Visible en dos líneas enmascaradas; el sr-only evita que el
              lector las concatene sin espacio ("Publicacionesy recursos"). */}
          <span className="sr-only">Publicaciones y recursos</span>
          <span aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
            <span data-bh-word className="block">
              Publicaciones
            </span>
          </span>
          <span aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
            <span data-bh-word className="text-verde-concepto block">
              y recursos
            </span>
          </span>
        </h1>

        <p
          data-bh-rise
          className="mt-6 max-w-[46ch] font-sans text-[1.02rem] leading-relaxed text-white/85 md:text-[1.15rem]"
        >
          Materiales de investigación y recursos pedagógicos, abiertos y
          listos para llevar al aula.
        </p>

        {/* Buscador — por ahora ancla al futuro listado (#materiales);
            cuando exista el catálogo, pasa a filtrarlo de verdad. */}
        {/* No es un <form>: no hay nada que enviar ni endpoint que responda, y
            un submit cancelado con preventDefault promete un envío que sin JS
            no pasa nunca. <search> es el landmark nativo (mejor que un
            role="search" pegado a un div) y el Enter y la lupa comparten el
            salto. El `flex` de la clase lo saca del display inline que un
            navegador viejo le daría al elemento desconocido. Sin `role`
            explícito: sería redundante sobre `<search>` (react-doctor lo marca)
            y el landmark ya es nativo en Chrome 118 / Safari 17 / Firefox 118
            para arriba. */}
        <search
          data-bh-rise
          className="focus-within:ring-azul-claro/70 mt-9 flex w-full max-w-xl items-stretch gap-1.5 rounded-xl bg-white p-1.5 shadow-[0_24px_60px_-24px_rgb(0_0_0_/_0.45)] focus-within:ring-2"
        >
          <label htmlFor="biblioteca-buscar" className="sr-only">
            Buscar publicaciones y recursos
          </label>
          <input
            id="biblioteca-buscar"
            type="search"
            placeholder="Buscá por título, tema o autora…"
            // El blur ANTES del salto: con un <form> de un solo campo, la
            // tecla Buscar del teclado virtual disparaba el submit implícito,
            // que en iOS y Android además cierra el teclado. Sin form hay que
            // cerrarlo a mano o el teclado tapa justo lo que se acaba de traer.
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.currentTarget.blur();
              irAMateriales();
            }}
            className="text-azul-principal placeholder:text-gris-texto min-w-0 flex-1 bg-transparent px-3.5 font-sans text-[0.98rem] outline-none"
          />
          <button
            type="button"
            aria-label="Buscar"
            onClick={irAMateriales}
            className="bg-naranja-accion flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90"
          >
            <Search size={20} />
          </button>
        </search>
      </div>

      {/* ── Riel de categorías al pie del hero ─────────────────────────── */}
      <div data-bh-rise className="mx-auto w-full max-w-screen-xl px-5 md:px-10">
        <CategoriasRail />
      </div>
    </section>
  );
}
