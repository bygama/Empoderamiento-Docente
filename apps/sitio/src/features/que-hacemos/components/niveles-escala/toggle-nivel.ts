import gsap from "gsap";

/**
 * Click en una card cerrada → se despliega para leerla; otro click la vuelve a
 * cerrar. El estado se infiere del alto real (quien haya movido la card por
 * scroll manda hasta el próximo click). Devuelve la limpieza de los listeners.
 */
export function instalarToggle(cards: HTMLElement[]) {
  const limpiadores: Array<() => void> = [];
  cards.forEach((card) => {
    const cuerpo = card.querySelector<HTMLElement>("[data-collapse]");
    const icono = card.querySelector<HTMLElement>("[data-collapse-icon]");
    const mas = card.querySelector<HTMLElement>("[data-nivel-mas]");
    if (!cuerpo || !icono) return;
    const alternar = () => {
      const abierto = cuerpo.offsetHeight > 4;
      gsap.to([cuerpo, icono], {
        height: abierto ? 0 : "auto",
        autoAlpha: abierto ? 0 : 1,
        duration: 0.45,
        ease: "power2.inOut",
        // Un click arriba de otro mata el tween anterior: sin estados
        // colgados a mitad de apertura.
        overwrite: "auto",
      });
      card.setAttribute("aria-expanded", String(!abierto));
      if (mas) mas.style.transform = abierto ? "" : "rotate(45deg)";
    };
    const teclado = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        alternar();
      }
    };
    card.addEventListener("click", alternar);
    card.addEventListener("keydown", teclado);
    limpiadores.push(() => {
      card.removeEventListener("click", alternar);
      card.removeEventListener("keydown", teclado);
    });
  });
  return () => limpiadores.forEach((fn) => fn());
}
