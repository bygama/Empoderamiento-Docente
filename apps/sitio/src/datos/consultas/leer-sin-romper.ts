// Cómo lee el sitio público de la base sin que la base lo pueda romper (SPEC
// §5 de `work/edicion-de-paginas/`). Lo usan las páginas (`filaDe`) y las
// novedades.

/**
 * Lo que devuelve `consultar`, o `sinBase` si no hay base que consultar. Sin
 * `DATABASE_URL` no llama a nada: el sitio compila y corre sin base (importar
 * `base` no lee el entorno; consultar sin URL sí tiraría). Si la consulta tira
 * durante `next build`, el build falla: la página es estática y lo que no
 * trajo se hornearía en el HTML hasta el próximo publicar (I-1 de la revisión
 * de la edición de páginas). En una visita de verdad se absorbe: un hipo de
 * Neon a mitad de un deploy no puede voltear la visita.
 */
export async function leerSinRomper<T>(quien: string, consultar: () => Promise<T>, sinBase: T): Promise<T> {
  if (!process.env.DATABASE_URL) return sinBase;
  try {
    return await consultar();
  } catch (e) {
    if (process.env.NEXT_PHASE === "phase-production-build") throw e;
    console.error(`${quien}:`, e);
    return sinBase;
  }
}
