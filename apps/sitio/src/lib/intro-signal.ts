/**
 * Puente liviano entre el IntroGate y el Hero para coordinar la inmersión:
 * cuando el gate arranca el zoom-through (nos "adentramos"), avisa, y el Hero
 * dispara su entrada en ese mismo instante — así el Inicio cobra vida mientras
 * lo atravesamos, en lugar de aparecer ya armado. Estado en memoria (cliente).
 */
// Sin IntroGate (removido 2026-06-24): se entra directo, así que por defecto
// ya estamos "adentro" → los consumidores (Hero, Header) animan en el mount.
// Si se reincorpora el gate, volver `entered`/`revealed` a `false`.
let entered = true;
const listeners = new Set<() => void>();

/** El gate llama esto al iniciar el zoom-through. */
export function markEntered(): void {
  if (entered) return;
  entered = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}

/** ¿Ya entramos? (true si no hubo gate o ya se atravesó). */
export function hasEntered(): boolean {
  return entered;
}

/**
 * Registra un callback para el momento de entrada. Si ya entramos, se ejecuta
 * de inmediato. Devuelve una función de limpieza.
 */
export function onEnter(cb: () => void): () => void {
  if (entered) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// ── "Revealed": el gate ya terminó del todo (overlay fuera, página visible) ──
// Lo usa el Navbar para que su intro coreografiada se vea YA con la página
// revelada (su animación es corta y, atada a markEntered, quedaba tapada por
// el zoom del gate).
let revealed = true; // sin gate: ya revelado (ver nota arriba).
const revealListeners = new Set<() => void>();

/** El gate llama esto cuando termina el zoom-through (página revelada). */
export function markRevealed(): void {
  if (revealed) return;
  revealed = true;
  revealListeners.forEach((cb) => cb());
  revealListeners.clear();
}

/** ¿El gate ya se fue del todo? (true si no hubo gate). */
export function hasRevealed(): boolean {
  return revealed;
}

/** Registra un callback para cuando el gate termina. Cleanup en el retorno. */
export function onReveal(cb: () => void): () => void {
  if (revealed) {
    cb();
    return () => {};
  }
  revealListeners.add(cb);
  return () => revealListeners.delete(cb);
}
