// El ancla de cada área en /que-hacemos (`#area-<ancla>`), en el orden de la
// lista: la usan los chips del hero, el índice y el propio artículo. Es
// estructura, no copy —un link compartido a `#area-evaluacion` no puede
// romperse porque alguien cambió el nombre del área—, y de acá sale también
// cuántas áreas son.
export const ANCLAS_DE_AREAS = [
  "desarrollo-profesional",
  "materiales",
  "curriculo",
  "evaluacion",
  "investigacion",
  "fortalecimiento",
  "sistemas",
] as const;

/** El id del artículo de un área, por su lugar en la lista. */
export const idDeArea = (indice: number) => `area-${ANCLAS_DE_AREAS[indice]}`;
