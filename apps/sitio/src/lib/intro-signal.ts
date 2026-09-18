/**
 * Puente entre el IntroGate y las entradas del Hero y del Navbar.
 *
 * El gate —la pantalla de «Comenzá la experiencia» que se atravesaba con un
 * zoom— se sacó del render el 2026-06-24 y su componente se borró el
 * 2026-09-18. Desde entonces se entra directo al Inicio, así que este módulo
 * responde siempre lo mismo: ya entramos y ya estamos revelados.
 *
 * NO CAMBIA NINGÚN COMPORTAMIENTO respecto de lo que había: `entered` y
 * `revealed` arrancaban en `true` y las únicas funciones que podían moverlos
 * (`markEntered`, `markRevealed`) salían por el `if` de arriba sin hacer nada.
 * Lo que se fue es la maquinaria de suscripción, que nadie podía disparar.
 *
 * Se mantienen las cuatro funciones con su forma porque las llaman la
 * coreografía del Hero y la del Navbar, cada una con su rama de espera y su
 * timeout de salvaguarda. Si algún día vuelve un gate, el estado vuelve acá
 * adentro y los consumidores no se tocan.
 */

/** ¿Ya entramos? Sin gate, siempre. */
export function hasEntered(): boolean {
  return true;
}

/**
 * Registra un callback para el momento de entrada. Sin gate ya entramos, así
 * que corre de inmediato. Devuelve una función de limpieza.
 */
export function onEnter(cb: () => void): () => void {
  cb();
  return () => {};
}

/** ¿El gate ya se fue del todo? Sin gate, siempre. */
export function hasRevealed(): boolean {
  return true;
}

/** Registra un callback para cuando el gate termina. Cleanup en el retorno. */
export function onReveal(cb: () => void): () => void {
  cb();
  return () => {};
}
