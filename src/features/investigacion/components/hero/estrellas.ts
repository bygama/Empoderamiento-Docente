/**
 * Las 13 estrellas del cielo del hero (viewBox 1440x900): son los 13 puntos
 * de la constelación de las láminas ED (constelacion.ts → PUNTOS, mismo
 * índice, mismo color), repartidos por el arco que barre el haz: del cielo,
 * sobre la linterna, hacia el titular a la izquierda. Ninguna sobre el
 * titular ni cerca de los botones: viven en la capa de arriba, así que un
 * punto encima de una letra o al lado de un CTA se lee como error. El naranja
 * —el personaje— es el primero que la luz toca al nacer, junto al faro; lo
 * último que toca es el titular. Al scrollear, bajan en bandada sobre la
 * hoja y se arman en la pregunta (coreografia-historia.ts).
 */
export const ESTRELLAS: ReadonlyArray<readonly [number, number]> = [
  [1100, 92],
  [982, 60],
  [864, 112],
  [742, 72],
  [620, 132],
  [500, 92],
  [402, 182],
  [302, 132],
  [222, 252],
  [642, 252],
  [1000, 332],
  [128, 214],
  [880, 172],
];

/** Tamaño de estrella por estado, como factor sobre PUNTOS[i].r: sin tocar
 *  por la luz, tocada (así se dibujan) e iluminada (dentro del cono). */
export const ESTRELLA = { sinTocar: 0.8, tocada: 0.95, iluminada: 1.35 } as const;
