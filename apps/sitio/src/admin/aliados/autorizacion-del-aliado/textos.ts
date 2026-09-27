// Qué dice el apartado «Autorización» de la ficha de un aliado, según quién
// mira y cómo está la marca. Aparte del componente para que se lea de una vez.

type Estado = {
  id: string | null;
  puedeAutorizar: boolean;
  quienPuede: string;
  /** La casilla, como está en pantalla. */
  marcado: boolean;
  /** Si la marca está puesta en la base. */
  autorizado: boolean;
  /** Si vale para lo que se autorizaría ahora. */
  alDia: boolean;
  hayQueAutorizar: boolean;
  haySinGuardar: boolean;
};

/** Qué es la marca, o por qué no se puede tocar. */
export function explicacionDe({ id, puedeAutorizar, quienPuede }: Estado): string {
  if (!puedeAutorizar) return `La marca la pone ${quienPuede}, con la nota de dónde consta la autorización: sin ella el logo no se publica nunca.`;
  if (!id) return "Guardá el aliado primero: después se marca la autorización.";
  return "Sin esta marca el logo no se publica nunca, y vale solo para el logo, el nombre y el texto del logo que se autorizan. Ponela solo si la organización autorizó el uso de su logo, y anotá dónde consta.";
}

/** Por qué todavía no se puede autorizar, o `null`. */
export function faltaPara({ marcado, hayQueAutorizar, haySinGuardar }: Estado): string | null {
  if (!marcado) return null;
  if (!hayQueAutorizar) return "Todavía no hay qué autorizar: completá el nombre y el logo y guardá el borrador.";
  if (haySinGuardar) return "Se autoriza lo guardado: guardá primero lo que cambiaste, para ver qué autorizás.";
  return null;
}

/** El texto del botón, o `null` si no hay nada que hacer. */
export function accionDe({ marcado, autorizado, alDia }: Estado): string | null {
  if (marcado) return alDia ? "Guardar la nota" : "Autorizar este logo";
  return autorizado ? "Quitar la autorización" : null;
}
