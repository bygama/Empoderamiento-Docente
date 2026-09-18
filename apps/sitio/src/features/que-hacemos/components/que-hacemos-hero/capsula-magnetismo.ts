import gsap from "gsap";

/**
 * Cápsula: magnetismo fuerte + olita de letras. El wrapper (campo) tiene
 * padding invisible: ese padding ES el radio amplio desde el que el botón te
 * siente. Capas de transform separadas: x/y del campo, scale del botón
 * (carga), x/y del inner (parallax interno) — nadie pisa a nadie. Solo con
 * hover real. Devuelve la limpieza.
 */
export function crearMagnetismo(campo: HTMLElement, inner: HTMLElement, btn: HTMLElement) {
  if (!window.matchMedia("(hover: hover)").matches) return () => {};

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
}
