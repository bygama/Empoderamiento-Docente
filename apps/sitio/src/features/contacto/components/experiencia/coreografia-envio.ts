import gsap from "gsap";
import type { FormEvent } from "react";
import { contar } from "@/lib/contadores/contar";
import { enviarFormulario } from "@/lib/formularios/enviar";
import { panelDe, pasarA, type Contexto } from "./contexto";

const sinRespuesta = (correo: string) => `No pudimos enviar tu mensaje. Revisá tu conexión y probá de nuevo, o escribinos a ${correo}.`;

// ── FORMULARIO → CIERRE (envío + confirmación) ────────────────────────────
// El mensaje viaja a /api/contacto, que lo guarda para el admin. Con
// `{ ok: true }` sigue la transición al cierre de siempre; si no, se queda en
// el formulario, con lo tipeado, y el error dice qué pasó. `correo` es el de
// Ajustes › Datos del sitio, para el error sin respuesta.
export async function enviar(c: Contexto, e: FormEvent<HTMLFormElement>, correo: string) {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const campo = (clave: string) => String(data.get(clave) ?? "").trim();
  c.setEnvio({ enviando: true, error: null });
  const respuesta = await enviarFormulario(
    "/api/contacto",
    {
      tema: c.temaActivo?.key,
      nombre: campo("nombre"),
      email: campo("email"),
      institucion: campo("institucion"),
      pais: campo("pais"),
      mensaje: campo("mensaje"),
      // El campo trampa: una persona lo deja vacío.
      web: campo("web"),
    },
    sinRespuesta(correo),
  );
  c.setEnvio({ enviando: false, error: respuesta.ok ? null : respuesta.error });
  if (!respuesta.ok) return;
  // Una suma por día, aparte del mensaje: el origen no viaja con él
  // (work/metricas-completas/SPEC.md §5.3).
  contar("contacto-envio");

  pasarA(c, "formulario", "cierre");
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
  pasarA(c, "cierre", "apertura");
  // Sin esto el foco cae al <body> cuando termina la transición: quien
  // navega por teclado (o lector de pantalla) queda en la nada.
  const enfocarPrimerTema = () =>
    c.root?.querySelector<HTMLElement>("[data-tema-card]")?.focus({ preventScroll: true });

  if (c.reduced) {
    gsap.set(panelDe(c, "cierre"), { autoAlpha: 0 });
    gsap.set(panelDe(c, "apertura"), { autoAlpha: 1 });
    enfocarPrimerTema();
    return;
  }

  // Mismo desfasaje que tenía "Volver a los temas", en el camino hermano que
  // llega a la MISMA pantalla: la columna izquierda cerraba a 0.8 y el índice
  // de la derecha recién a 1.25. Se sincroniza igual — mismo arranque, misma
  // duración, stagger corto — para que volver al índice se sienta igual venga
  // de donde venga.
  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: enfocarPrimerTema });
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
