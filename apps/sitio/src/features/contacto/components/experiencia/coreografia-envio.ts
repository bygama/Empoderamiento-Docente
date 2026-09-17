import gsap from "gsap";
import type { FormEvent } from "react";
import { siteConfig } from "@/config/site";
import { panelDe, type Contexto } from "./contexto";

// ── FORMULARIO → CIERRE (mailto + confirmación) ───────────────────────────
export function enviar(c: Contexto, e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const nombre = String(data.get("nombre") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const institucion = String(data.get("institucion") ?? "").trim();
  const pais = String(data.get("pais") ?? "").trim();
  const mensaje = String(data.get("mensaje") ?? "").trim();

  const asunto = `[Web] ${c.temaActivo?.titulo ?? "Consulta"} — ${nombre}`;
  const cuerpo = [
    mensaje,
    "",
    "—",
    `Nombre: ${nombre}`,
    `Email: ${email}`,
    institucion ? `Institución: ${institucion}` : null,
    pais ? `País: ${pais}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  c.setMensajeListo(`${asunto}\n\n${cuerpo}`);
  // mientras no haya backend, abre el correo con todo precargado
  window.location.href = `mailto:${siteConfig.contacto.email}?subject=${encodeURIComponent(
    asunto,
  )}&body=${encodeURIComponent(cuerpo)}`;

  c.setVista("cierre");
  if (c.reduced) {
    gsap.set(panelDe(c, "formulario"), { autoAlpha: 0 });
    gsap.set(panelDe(c, "cierre"), { autoAlpha: 1 });
    return;
  }
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to("[data-campo]", { autoAlpha: 0, y: -12, duration: 0.3, stagger: 0.03, ease: "power2.in" })
    .to(panelDe(c, "formulario"), { autoAlpha: 0, duration: 0.25 }, "-=0.1")
    .set(panelDe(c, "cierre"), { autoAlpha: 1 })
    .fromTo("[data-fin-rule]", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.inOut" })
    .fromTo(
      "[data-fin-bit]",
      { autoAlpha: 0, y: 22 },
      { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1 },
      "-=0.35",
    );
}

// ── CIERRE → APERTURA (otra consulta) ─────────────────────────────────────
export function otraConsulta(c: Contexto) {
  c.setVista("apertura");
  if (c.reduced) {
    gsap.set(panelDe(c, "cierre"), { autoAlpha: 0 });
    gsap.set(panelDe(c, "apertura"), { autoAlpha: 1 });
    return;
  }
  // Mismo desfasaje que tenía "Volver a los temas", en el camino hermano que
  // llega a la MISMA pantalla: la columna izquierda cerraba a 0.8 y el índice
  // de la derecha recién a 1.25. Se sincroniza igual — mismo arranque, misma
  // duración, stagger corto — para que volver al índice se sienta igual venga
  // de donde venga.
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(panelDe(c, "cierre"), { autoAlpha: 0, duration: 0.26, ease: "power2.in" }, 0)
    .set(panelDe(c, "apertura"), { autoAlpha: 1 }, 0.2)
    .fromTo(
      "[data-ap-head], [data-ap-h2]",
      { autoAlpha: 0, y: -16 },
      { autoAlpha: 1, y: 0, duration: 0.43 },
      0.24,
    )
    .fromTo(
      "[data-tema-card]",
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.02 },
      0.24,
    );
}
