"use client";

import { useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { getLenis } from "@/lib/lenis";
import { useIsomorphicLayoutEffect } from "@/lib/hooks/useIsomorphicLayoutEffect";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

// ── Polvo de estrellas del primer viewport ─────────────────────────────────
// El cielo real lo pinta el fondo compartido + la escena del faro (detrás);
// esta capa fina y tenue vive solo en el hero: densifica el arranque ahora
// que las fotos flotantes no están. LCG determinista (misma constelación en
// server y client — Math.random rompería la hidratación).
const POLVO = (() => {
  let s = 20260828;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  return Array.from({ length: 46 }, () => ({
    x: rnd() * 100,
    y: rnd() * 100,
    r: 0.6 + rnd() * 1.1,
    o: 0.08 + rnd() * 0.22,
  }));
})();

/**
 * Hero de Qué hacemos — pantalla completa (100svh) a sangre, sin bordes
 * redondeados, todo centrado en el medio: titular, bajada y el botón portal
 * (referencia Ink). Fondo atmosférico propio, "NOCHE DE FARO" — distinto
 * de Biblioteca/Novedades (que comparten la grilla de PuntosFaro): navy
 * que oscurece hacia arriba, HORIZONTE DE LUZ azul abajo (el faro debajo
 * del horizonte, a punto de encenderse — el click del portal lo enciende
 * en verde encima), CIELO ESTRELLADO disperso (constelación determinista,
 * algunas titilan) y EL HAZ DEL FARO GIRANDO: un cono ancho (~48°)
 * y muy tenue (pico 6%) da la vuelta cada 18s — no se ve un rayo, la
 * zona del cielo que toca respira un poco más de luz. Titular: "Generamos y /
 * transformamos." (antes "No formamos. / Transformamos."; se cambió a
 * pedido de Gastón el 2026-09-01). PENDIENTE validar titular exacto con ED.
 *
 * SIN escena de fotos: las imágenes flotantes competían con el titular y
 * adelantaban lo que la torre muestra mejor. En su lugar el primer viewport
 * gana un POLVO de estrellas finas y una ESTRELLA FUGAZ ocasional (una
 * sola, cada ~9-13s, sutil) — vida sin protagonismo. El cielo de fondo es
 * el compartido con la escena del faro (page.tsx): un solo cielo.
 *
 * Entrada: el haz barre encendiendo los puntos y las dos líneas suben desde
 * su máscara cuando la luz cruza el centro (~0.95s, constantes de PuntosFaro).
 * Sin motion: todo visible y quieto.
 *
 * MOUSE-PARALLAX (misma fórmula que el hero del home): un solo RAF con lerp
 * setea --qhx/--qhy (-1..1 desde el centro del viewport) sobre la section.
 * Cada capa los multiplica por su profundidad: el contenido sigue LEVEMENTE
 * al cursor (+), el fondo (glow/bola) se desplaza en contra (-) para dar
 * profundidad. Amplitudes chicas (≤18px) — acompaña, no marea. Solo con
 * puntero fino (hover:hover); sin motion no hay parallax.
 *
 * ESTRUCTURA (referencia Ink): titular blanco con "transformamos." teñido
 * de celeste y subrayado verde (el marcador de concepto en versión
 * subrayado) → bajada → CÁPSULA DE LUZ VERDE (el portal).
 *
 * Portal al recorrido — cápsula de luz: vidrio verde con halo que respira,
 * deliberadamente distinta del CTA naranja del sitio (esto no es un CTA de
 * conversión: es el interactivo del hero). Juguetona: magnetismo fuerte
 * desde un radio amplio con retorno elástico, parallax interno del texto,
 * olita de letras y flecha en hover. Click Y hold encienden: apretar
 * hincha el cuerpo (squash gomoso) mientras la luz interna crece con la
 * carga (~1.1s); soltar antes = click, la carga restante se acelera
 * (~0.4s). Al completar: pop elástico, la luz verde inunda desde abajo y
 * arranca el VIAJE NOCTURNO: un scroll automático largo (~4s, easing
 * cinematográfico) que atraviesa la noche y entra al scroll-story del faro
 * hasta dejarlo ENCENDIDO (p≈0.30 de su timeline). Como es scroll real, el
 * usuario puede frenarlo o seguirlo a su ritmo. El hover aviva la brasita
 * (carga al 15%) como affordance. NO es una puerta: scrollear de largo
 * sigue funcionando siempre. Teclado (click sintético) carga rápido; con
 * prefers-reduced-motion la cápsula queda quieta y el click salta directo.
 */
export function QueHacemosHero() {
  const rootRef = useRef<HTMLElement | null>(null);
  const holdRef = useRef<HTMLButtonElement | null>(null);
  const campoRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-qh-word]", { yPercent: 115 });
      gsap.set("[data-qh-underline]", { scaleX: 0 });
      // El celeste entra desde la DERECHA (cruzado con el subrayado, que se
      // dibuja desde la izquierda).
      gsap.set("[data-qh-pintura]", { clipPath: "inset(0% 0% 0% 100%)" });
      gsap.set("[data-qh-rise]", { autoAlpha: 0, y: 24 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-qh-word]", { yPercent: 0, duration: 1, stagger: 0.12 }, 0.75)
        // El subrayado se dibuja de izquierda a derecha cuando el titular
        // ya está arriba — el gesto del marcador — y la palabra se tiñe de
        // celeste con un barrido cruzado, desde la derecha.
        .to("[data-qh-underline]", { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, 1.7)
        .to("[data-qh-pintura]", { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power3.inOut" }, 1.7)
        .to("[data-qh-rise]", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, 1.45);
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  // ── Mouse-parallax del hero ────────────────────────────────────────────
  // RAF único con lerp (EASE bajo = trailing suave). Solo actualiza CSS vars;
  // las capas mueven vía transform con calc() — GSAP nunca toca esos nodos,
  // así que no hay pelea de transforms.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let started = false;
    const clamp = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);
    const onMove = (e: MouseEvent) => {
      tx = clamp((e.clientX / window.innerWidth - 0.5) * 2);
      ty = clamp((e.clientY / window.innerHeight - 0.5) * 2);
      started = true;
    };
    const EASE = 0.07; // más bajo = más retardo (muy smooth, sin exagerar)
    const tick = () => {
      cx += (tx - cx) * EASE;
      cy += (ty - cy) * EASE;
      if (started) {
        root.style.setProperty("--qhx", cx.toFixed(4));
        root.style.setProperty("--qhy", cy.toFixed(4));
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // ── Estrella fugaz ocasional ───────────────────────────────────────────
  // UNA sola, cada ~9-13s, arriba del cielo (nunca sobre el titular), rápida
  // y tenue: vida, no espectáculo. Solo client y solo con motion — la
  // aleatoriedad vive en el effect, así que no toca la hidratación.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const fugaz = root.querySelector<HTMLElement>("[data-qh-fugaz]");
    if (!fugaz) return;

    let tl: gsap.core.Timeline | null = null;
    let primera = true;
    const lanzar = () => {
      const W = window.innerWidth;
      const x0 = W * (0.12 + Math.random() * 0.6);
      const y0 = window.innerHeight * (0.06 + Math.random() * 0.2);
      const largo = 180 + Math.random() * 140;
      // La primera sale pronto (~4s, con la entrada ya asentada); las
      // siguientes respetan la cadencia lenta.
      tl = gsap
        .timeline({ delay: primera ? 4 : 9 + Math.random() * 4, onComplete: lanzar })
        .set(fugaz, { x: x0, y: y0, rotation: 24, autoAlpha: 0 })
        .to(fugaz, { autoAlpha: 0.55, duration: 0.18, ease: "power1.in" })
        .to(fugaz, { x: x0 + largo, y: y0 + largo * 0.45, duration: 0.75, ease: "power2.out" }, 0)
        .to(fugaz, { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, 0.5);
      primera = false;
    };
    lanzar();

    return () => {
      tl?.kill();
      gsap.set(fugaz, { autoAlpha: 0 });
    };
  }, [reduced]);

  // ── Cápsula: magnetismo fuerte + olita de letras ───────────────────────
  // El wrapper (campo) tiene padding invisible: ese padding ES el radio
  // amplio desde el que el botón te siente. Capas de transform separadas:
  // x/y del campo, scale del botón (carga), x/y del inner (parallax
  // interno) — nadie pisa a nadie.
  useIsomorphicLayoutEffect(() => {
    const campo = campoRef.current;
    const inner = innerRef.current;
    const btn = holdRef.current;
    if (!campo || !inner || !btn || reduced) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    const mover = (e: MouseEvent) => {
      const r = campo.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(campo, { x: dx * 0.35, y: dy * 0.35, duration: 0.5, ease: "power2.out" });
      // El interior se mueve un poco más que la cáscara → peso.
      gsap.to(inner, { x: dx * 0.12, y: dy * 0.12, duration: 0.5, ease: "power2.out" });
    };
    const volver = () => {
      gsap.to([campo, inner], { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,0.35)" });
    };
    // Olita: cada letra sube y baja en secuencia, una pasada por entrada.
    const olita = () => {
      gsap.fromTo(
        "[data-qh-letra]",
        { y: 0 },
        { y: -5, duration: 0.16, ease: "power2.out", stagger: 0.022, yoyo: true, repeat: 1, overwrite: true },
      );
    };

    campo.addEventListener("mousemove", mover);
    campo.addEventListener("mouseleave", volver);
    btn.addEventListener("pointerenter", olita);
    return () => {
      campo.removeEventListener("mousemove", mover);
      campo.removeEventListener("mouseleave", volver);
      btn.removeEventListener("pointerenter", olita);
      gsap.killTweensOf([campo, inner]);
    };
  }, [reduced]);

  // ── Portal al recorrido (click / hold sobre la cápsula) ────────────────
  useIsomorphicLayoutEffect(() => {
    const btn = holdRef.current;
    const root = rootRef.current;
    if (!btn || !root) return;

    // EL VIAJE NOCTURNO: scroll automático largo hasta ADENTRO del
    // scroll-story del faro — no hasta su borde. Destino: el PRIMER
    // PÁRRAFO de la escena ("Cada contexto educativo presenta…"), en el
    // centro de su ventana de lectura (p≈0.048: entra en 0.012–0.034,
    // quieto hasta 0.078). Antes aterrizaba en el encendido (p≈0.30) y
    // pasaba por encima del párrafo a toda velocidad. Así el faro se
    // enciende con el primer scroll PROPIO del usuario: el botón lleva al
    // principio de la historia, no al medio. Scroll real: el usuario puede
    // frenar con la rueda cuando quiera.
    const viajar = () => {
      const faro = document.getElementById("faro");
      if (!faro) return;
      if (reduced) {
        faro.scrollIntoView({ behavior: "auto" });
        return;
      }
      // El ScrollTrigger del faro arranca en `top+=100svh` (su runway
      // empieza una pantalla antes, oculto detrás de este hero): el mapeo
      // de progreso descuenta esa pantalla en ambos extremos.
      const top = faro.getBoundingClientRect().top + window.scrollY;
      const vh = window.innerHeight;
      const destino = top + vh + (faro.offsetHeight - vh * 2) * 0.048;
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(destino, {
          duration: 3,
          easing: (t: number) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
        });
      } else {
        window.scrollTo({ top: destino, behavior: "smooth" });
      }
    };

    // Sin motion: botón común, salta directo.
    if (reduced) {
      btn.addEventListener("click", viajar);
      return () => btn.removeEventListener("click", viajar);
    }

    const holdGlow = root.querySelector<HTMLElement>("[data-qh-holdglow]");
    const prog = { v: 0 };
    let tween: gsap.core.Tween | null = null;
    // idle → cargando (dedo abajo o click acelerando) → viajando → idle.
    let fase: "idle" | "cargando" | "viajando" = "idle";

    // La carga vive en --carga (glow interno, borde y halo la leen desde
    // CSS) y en la hinchazón del cuerpo (squash: más ancho que alto).
    const pintar = () => {
      btn.style.setProperty("--carga", prog.v.toFixed(4));
      if (fase === "cargando") {
        gsap.set(btn, { scaleX: 1 + prog.v * 0.14, scaleY: 1 + prog.v * 0.1 });
      }
      if (holdGlow) holdGlow.style.opacity = String(prog.v * 0.9);
    };
    pintar();

    // Carga completa: pop físico, flash de luz y viaje; la cápsula se
    // descarga mientras viajamos.
    const fuego = () => {
      fase = "viajando";
      viajar();
      if (holdGlow) {
        gsap.fromTo(
          holdGlow,
          { opacity: 0.9 },
          { opacity: 0, duration: 1.4, ease: "power2.out", delay: 0.15 },
        );
      }
      // Pop: se pasa un pelo y vuelve con rebote gomoso.
      gsap
        .timeline()
        .to(btn, { scaleX: 1.18, scaleY: 1.14, duration: 0.16, ease: "power2.out" })
        .to(btn, { scaleX: 1, scaleY: 1, duration: 0.9, ease: "elastic.out(1,0.4)" });
      gsap.to(prog, {
        v: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "power2.out",
        onUpdate: () => btn.style.setProperty("--carga", prog.v.toFixed(4)),
        onComplete: () => {
          fase = "idle";
        },
      });
    };

    // Carga el resto en `dur` (escalado por lo que falta) y fuego.
    const cargar = (dur: number, ease: string) => {
      tween?.kill();
      tween = gsap.to(prog, {
        v: 1,
        duration: dur * (1 - prog.v),
        ease,
        onUpdate: pintar,
        onComplete: fuego,
      });
    };

    // Dedo abajo: carga lenta (el gesto de "encender manteniendo"); la
    // hinchazón progresiva la maneja pintar() con la misma prog.v.
    const abajo = (e: PointerEvent) => {
      if (fase !== "idle") return;
      fase = "cargando";
      // Capturar el puntero mantiene el hold vivo aunque el dedo derive un
      // poco; si el navegador lo rechaza (puntero ya soltado), da igual.
      try {
        btn.setPointerCapture?.(e.pointerId);
      } catch {
        /* noop */
      }
      cargar(1.1, "none");
    };
    // Soltó antes de completar: fue un click — la carga restante se acelera.
    const arriba = () => {
      if (fase !== "cargando") return;
      cargar(0.4, "power2.in");
    };
    // Cancelación real del puntero (no un release): se desinfla suave.
    const cancelar = () => {
      if (fase !== "cargando") return;
      fase = "idle";
      tween?.kill();
      tween = gsap.to(prog, { v: 0, duration: 0.35, ease: "power2.out", onUpdate: pintar });
      gsap.to(btn, { scaleX: 1, scaleY: 1, duration: 0.4, ease: "power2.out" });
    };
    // Teclado: el click llega con detail 0, sin pointerdown previo.
    const teclado = (e: MouseEvent) => {
      if (e.detail === 0 && fase === "idle") {
        fase = "cargando";
        cargar(0.5, "power2.in");
      }
    };

    // Hover: la brasita se aviva apenas (affordance de "esto se enciende");
    // el movimiento en hover lo ponen el magnetismo y la olita.
    const entrar = () => {
      if (fase !== "idle") return;
      tween?.kill();
      tween = gsap.to(prog, { v: 0.15, duration: 0.35, ease: "power2.out", onUpdate: pintar });
    };
    const salir = () => {
      if (fase !== "idle") return;
      tween?.kill();
      tween = gsap.to(prog, { v: 0, duration: 0.4, ease: "power2.out", onUpdate: pintar });
    };

    btn.addEventListener("pointerdown", abajo);
    btn.addEventListener("pointerup", arriba);
    btn.addEventListener("pointercancel", cancelar);
    btn.addEventListener("click", teclado);
    btn.addEventListener("pointerenter", entrar);
    btn.addEventListener("pointerleave", salir);
    return () => {
      tween?.kill();
      btn.removeEventListener("pointerdown", abajo);
      btn.removeEventListener("pointerup", arriba);
      btn.removeEventListener("pointercancel", cancelar);
      btn.removeEventListener("click", teclado);
      btn.removeEventListener("pointerenter", entrar);
      btn.removeEventListener("pointerleave", salir);
    };
  }, [reduced]);

  return (
    <section
      ref={rootRef}
      className="relative z-20 isolate flex min-h-svh flex-col justify-center overflow-hidden pt-24 pb-12 text-white"
      aria-label="Qué hacemos"
      style={
        {
          "--qhx": "0",
          "--qhy": "0",
          // Sin fondo propio: lo pone el envoltorio compartido con la
          // escena del faro (ver app/que-hacemos/page.tsx), para que no haya
          // costura entre los dos cielos.
        } as CSSProperties
      }
    >
      {/* SIN FONDO PROPIO. Antes esta sección tenía sus propias capas —
          resplandor de horizonte, cielo estrellado y un haz girando— que la
          hacían distinta de la escena del faro que viene abajo y marcaban
          una línea horizontal en la junta. Ahora el cielo lo pone
          únicamente el envoltorio compartido (app/que-hacemos/page.tsx) y
          las dos secciones se leen como una sola.
          Se conserva el glow verde del botón: es respuesta a la interacción,
          no decorado de fondo. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Luz que se "carga" con el click: sube desde el botón, abajo. */}
        <span
          data-qh-holdglow
          className="absolute inset-0 opacity-0"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 100%, color-mix(in srgb, var(--color-verde-concepto) 26%, transparent), transparent 72%)",
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

      <div
        className="relative z-10 mx-auto flex w-full max-w-screen-xl flex-col items-center px-5 text-center will-change-transform md:px-10"
        style={{
          // Sigue al mouse y ADEMÁS se inclina apenas hacia él (mira al
          // cursor) — mismos signos que useTilt: rotateY con x, rotateX
          // contra y. Ángulos chicos para que acompañe sin marear.
          transform:
            "perspective(1000px) translate3d(calc(var(--qhx, 0) * 10px), calc(var(--qhy, 0) * 8px), 0) rotateY(calc(var(--qhx, 0) * 2.6deg)) rotateX(calc(var(--qhy, 0) * -2.1deg))",
        }}
      >
        <h1
          className="font-display font-extrabold tracking-[-0.03em] text-white [text-shadow:0_2px_30px_rgb(15_21_40/0.55)]"
          style={{ fontSize: "clamp(2.75rem, 1.1rem + 7vw, 6.25rem)", lineHeight: 1.04 }}
        >
          <span className="sr-only">Generamos y transformamos.</span>
          <span aria-hidden="true" className="block overflow-hidden pb-[0.08em]">
            <span data-qh-word className="block">
              Generamos y
            </span>
          </span>
          <span aria-hidden="true" className="block overflow-hidden pb-[0.14em]">
            <span data-qh-word className="block">
              {/* Marcador verde de la marca, en versión subrayado (ref Ink):
                  se dibuja de izquierda a derecha en la entrada, y a la vez
                  una copia en azul-claro (el celeste de la paleta, §1) se
                  revela con clip-path DESDE LA DERECHA — barrido cruzado:
                  el subrayado va y el color viene. Sin motion: celeste
                  directo (el clip solo lo setea GSAP). */}
              <span className="relative inline-block">
                transformamos.
                <span aria-hidden="true" data-qh-pintura className="text-azul-claro absolute inset-0">
                  transformamos.
                </span>
                <span
                  data-qh-underline
                  className="bg-verde-concepto absolute right-[0.04em] -bottom-[0.04em] left-[0.02em] h-[0.045em] origin-left rounded-full"
                />
              </span>
            </span>
          </span>
        </h1>

        <p
          data-qh-rise
          className="mt-6 max-w-[56ch] font-sans text-[1.05rem] leading-relaxed text-white/85 md:text-[1.2rem]"
        >
          Generamos escenarios de aprendizaje pensados para cada contexto y
          sostenidos en investigación, que transforman la relación con la
          matemática escolar.
        </p>

        {/* Portal al recorrido: CÁPSULA DE LUZ VERDE — vidrio con halo que
            respira. Click u hold la cargan: el cuerpo se hincha y la luz
            interna crece (--carga alimenta glow/borde/halo desde CSS); al
            completar, pop gomoso + flood verde + viaje a la torre.
            Scrollear sigue funcionando siempre — atajo, no puerta. */}
        <div data-qh-rise className="mt-10 md:mt-12">
          {/* Campo magnético: el padding invisible es el radio de sensado. */}
          <div ref={campoRef} className="-m-10 inline-block p-10">
            <button
              ref={holdRef}
              type="button"
              aria-label="Entrar al recorrido de lo que hacemos"
              className="group border-verde-concepto/45 bg-verde-concepto/12 focus-visible:outline-verde-concepto relative inline-flex cursor-pointer touch-none items-center justify-center rounded-full border px-10 py-[1.15rem] font-sans text-[1rem] font-medium text-white outline-none backdrop-blur-sm select-none focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ "--carga": 0 } as CSSProperties}
            >
              {/* Halo exterior que respira (CSS puro, compositor). */}
              <span
                aria-hidden="true"
                className="absolute -inset-px rounded-full motion-safe:animate-[qh-halo-respira_3.4s_ease-in-out_infinite]"
                style={{
                  boxShadow:
                    "0 0 24px 2px color-mix(in srgb, var(--color-verde-concepto) 50%, transparent)",
                }}
              />
              {/* Halo + borde encendidos por la carga. */}
              <span
                aria-hidden="true"
                className="border-verde-concepto absolute -inset-px rounded-full border"
                style={{
                  opacity: "var(--carga, 0)",
                  boxShadow:
                    "0 0 46px 12px color-mix(in srgb, var(--color-verde-concepto) 65%, transparent), inset 0 0 34px color-mix(in srgb, var(--color-verde-concepto) 40%, transparent)",
                }}
              />
              {/* Glow interno: brasita en reposo, llena la cápsula al cargar. */}
              <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-full">
                <span
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(85% 95% at 50% 108%, color-mix(in srgb, var(--color-verde-concepto) 55%, transparent), transparent 75%)",
                    opacity: "calc(0.35 + var(--carga, 0) * 0.65)",
                  }}
                />
                <span
                  className="bg-verde-concepto/45 absolute inset-0"
                  style={{ opacity: "var(--carga, 0)" }}
                />
              </span>
              {/* Contenido: letras sueltas para la olita + flecha que aparece
                  en hover. El aria-label del botón lee por todos. */}
              <span ref={innerRef} aria-hidden="true" className="relative flex items-center">
                {"Entrá al recorrido".split("").map((ch, i) => (
                  <span key={i} data-qh-letra className="inline-block whitespace-pre">
                    {ch}
                  </span>
                ))}
                <span className="inline-block w-0 -translate-x-1 opacity-0 transition-all duration-300 ease-out group-hover:w-[1.1em] group-hover:translate-x-1 group-hover:opacity-100">
                  ↓
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
