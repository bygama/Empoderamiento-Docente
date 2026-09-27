// Lo programado del sitio: cada cosa que corre sola una vez por día es una
// tarea, y el cron es uno solo (ADR-0011). No sabe de ED: la lista de tareas
// la arma la app y la corre `correrTareas`.

export type ResultadoDeTarea = { ok: boolean; detalle: string };

export type Tarea = {
  /** Única: es lo que queda en cada corrida y con lo que se busca «la última de esta tarea». */
  clave: string;
  /** Cómo se lee en el admin. */
  nombre: string;
  /** Qué hace. Si tira o no termina a tiempo, el corredor la da por fallida. */
  correr: () => Promise<ResultadoDeTarea>;
  /**
   * La clave de una tarea que tiene que terminar, bien o mal, antes de que
   * esta empiece: la que lee lo que otra copia. Va antes en la lista.
   */
  despuesDe?: string;
};

/**
 * La lista de tareas, verificada: dos tareas con la misma clave se pisarían
 * el historial, y una que espera a otra que no está antes en la lista no
 * empezaría nunca. Eso se descubre al cargar el módulo, no en una corrida.
 */
export function definirTareas(tareas: readonly Tarea[]): readonly Tarea[] {
  const vistas = new Set<string>();
  for (const { clave, despuesDe } of tareas) {
    if (vistas.has(clave)) throw new Error(`Hay dos tareas con la clave «${clave}»: cada una necesita la suya.`);
    if (despuesDe && !vistas.has(despuesDe)) throw new Error(`«${clave}» espera a «${despuesDe}», que tiene que ir antes en la lista.`);
    vistas.add(clave);
  }
  return tareas;
}
