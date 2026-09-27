import type { Largo } from "./largo";

/**
 * La cuenta de caracteres, al lado de la etiqueta y fuera del `label`: así su
 * nombre accesible no cambia en cada tecla, y la cuenta se anuncia aparte por
 * `aria-describedby`. Pasado el tope (un dato viejo) va en rojo, como el
 * borde; al tope o pasado lo recomendado, en azul: el naranja es solo para la
 * acción.
 */
export function Contador({ nombre, cuenta, largo }: { nombre: string; cuenta: number; largo: Largo }) {
  const color = largo.excedido ? "text-rojo-error" : largo.alTope || largo.pasado ? "font-medium text-azul-principal" : "text-gris-texto";
  return (
    <span id={`${nombre}-contador`} className={`text-admin-meta ${largo.visible ? "" : "sr-only"} ${color}`}>
      {cuenta}/{largo.contra}
    </span>
  );
}

/**
 * Lo que va debajo de un campo de texto: el aviso de largo recomendado (en
 * azul, como el contador: es un aviso, no un error), el error del último
 * guardado (en rojo) y el anuncio de que se llegó al tope.
 */
export function PieDelCampo({ nombre, largo, aviso, error }: { nombre: string; largo: Largo; aviso?: string; error?: string }) {
  return (
    <>
      {largo.pasado && aviso ? (
        <p id={`${nombre}-recomendado`} className="mt-1 text-admin-meta font-medium text-azul-principal">
          {aviso}
        </p>
      ) : null}
      {error ? (
        <p id={`${nombre}-error`} className="mt-1 text-admin-meta text-rojo-error">
          {error}
        </p>
      ) : null}
      {/* maxLength corta la tecla en silencio: sin esto, quien edita no entiende por qué dejó de escribir. */}
      {/* El span vive siempre en el DOM y solo cambia el texto: si naciera junto con el texto, el lector de pantalla puede no llegar a anunciarlo. */}
      <span className="sr-only" aria-live="polite">
        {largo.alTope ? "Llegaste al máximo de caracteres." : ""}
      </span>
    </>
  );
}
