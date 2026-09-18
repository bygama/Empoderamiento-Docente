type Props = {
  /** Texto a romper en caracteres. */
  text: string;
};

/**
 * Rompe un string en spans por caracter (cada uno con `data-char` para que
 * GSAP lo anime con stagger letra por letra), pero AGRUPA cada palabra en
 * un wrapper `inline-block` que el navegador trata como una unidad atómica:
 * así el salto de línea solo ocurre ENTRE palabras y nunca parte una palabra
 * (evita el "l / a" en los títulos). Los espacios quedan como nodos de texto
 * normales entre palabras, que sí son puntos de quiebre válidos.
 */
export function SplitChars({ text }: Props) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, wi) => (
        <span key={wi}>
          {/* La palabra es una caja que no se parte */}
          <span className="inline-block">
            {Array.from(word).map((char, ci) => (
              <span key={ci} data-char className="inline-block">
                {char}
              </span>
            ))}
          </span>
          {/* Espacio entre palabras = punto de quiebre permitido */}
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
