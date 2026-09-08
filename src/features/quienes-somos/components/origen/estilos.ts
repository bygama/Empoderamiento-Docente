/**
 * GRILLA COMPARTIDA. La columna de texto y la lámina de fotos nacen del
 * MISMO contenedor que el resto del sitio (`max-w-screen-xl` + `px-5/px-10`,
 * igual que DistintoEd, RedEd o el footer): el borde izquierdo del texto cae
 * en la misma línea que los títulos de las otras secciones y el borde derecho
 * de la foto cierra sobre el mismo margen. 7fr/6fr da a la lectura algo más
 * de aire que a la imagen sin romper el equilibrio de la doble página.
 */
export const GRILLA =
  "mx-auto max-w-screen-xl px-5 md:grid md:grid-cols-[7fr_6fr] md:gap-x-10 md:px-10 lg:gap-x-14";

/**
 * Tipografía de los tres pilares: un solo tamaño para los tres títulos y un
 * solo tamaño para los tres cuerpos. El título RESERVA 3 líneas (`min-height`
 * = 3 × line-height): así el cuerpo arranca siempre a la misma altura y, al
 * cruzarse los beats, lo único que cambia es el contenido — no la caja.
 */
// El tope de 3.2vw / 2.7rem está calibrado sobre la línea más larga de la
// cita ("Estaba a punto de jubilarme." ≈ 13.1em): entra en una sola línea en
// toda la escala md+ con ~6% de aire. Si la cita cambia, revisar este número.
export const PILAR_TITULO =
  "font-display mt-5 font-bold tracking-[-0.02em] text-white [font-size:clamp(1.6rem,6vw,2.4rem)] [line-height:1.12] md:mt-6 md:[font-size:clamp(1.4rem,3.2vw,2.7rem)] md:[min-height:3.36em]";

// La reserva del cuerpo es de 4 líneas en tablet y 3 en desktop: a 768px la
// columna se angosta y el párrafo más largo (03) necesita la cuarta. Si se
// quedara en 3, ese beat desbordaría la caja y correría el bloque entero
// ~14px respecto de los otros dos (el bloque va centrado).
export const PILAR_CUERPO =
  "text-azul-claro/85 mx-auto mt-6 max-w-[46ch] font-sans text-[1rem] leading-[1.65] md:mx-0 md:mt-7 md:text-[1.06rem] md:[min-height:6.6em] lg:[min-height:4.95em]";
