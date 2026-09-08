import gsap from "gsap";
import { getLenis } from "@/lib/lenis";
import { DURACION_RECORRIDO } from "../tiempos-faro";

/**
 * EL VIAJE NOCTURNO: scroll automático largo hasta ADENTRO del scroll-story
 * del faro — no hasta su borde. Destino: el PRIMER PÁRRAFO de la escena
 * ("Cada contexto educativo presenta…"), en el centro de su ventana de
 * lectura (p≈0.048: entra en 0.012–0.034, quieto hasta 0.078). Antes
 * aterrizaba en el encendido (p≈0.30) y pasaba por encima del párrafo a toda
 * velocidad. Así el faro se enciende con el primer scroll PROPIO del usuario:
 * el botón lleva al principio de la historia, no al medio. Scroll real: el
 * usuario puede frenar con la rueda cuando quiera.
 */
function viajar(reduced: boolean) {
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
  // 0.048 está en unidades de la línea de tiempo del faro, que dura
  // DURACION_RECORRIDO: dividir lo pasa a progreso del runway.
  const destino = top + vh + (faro.offsetHeight - vh * 2) * (0.048 / DURACION_RECORRIDO);
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
}

/**
 * Portal al recorrido (click / hold sobre la cápsula): la máquina
 * idle → cargando → viajando → idle, con la carga en `--carga` y la
 * hinchazón del cuerpo. Sin motion, botón común que salta directo. Devuelve
 * la limpieza.
 */
export function crearPortal(btn: HTMLButtonElement, root: HTMLElement, reduced: boolean) {
  const irAlFaro = () => viajar(reduced);

  // Sin motion: botón común, salta directo.
  if (reduced) {
    btn.addEventListener("click", irAlFaro);
    return () => btn.removeEventListener("click", irAlFaro);
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
    irAlFaro();
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
}
