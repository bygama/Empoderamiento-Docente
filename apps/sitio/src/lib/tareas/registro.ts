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
};

/**
 * La lista de tareas, verificada: dos tareas con la misma clave se pisarían
 * el historial, y eso se descubre al cargar el módulo, no en una corrida.
 */
export function definirTareas(tareas: readonly Tarea[]): readonly Tarea[] {
  const vistas = new Set<string>();
  for (const { clave } of tareas) {
    if (vistas.has(clave)) throw new Error(`Hay dos tareas con la clave «${clave}»: cada una necesita la suya.`);
    vistas.add(clave);
  }
  return tareas;
}
