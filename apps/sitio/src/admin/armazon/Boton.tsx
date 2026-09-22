import Link from "next/link";
import { claseDeBoton, type Variante } from "./clases";

type PropsDeBoton = {
  variante: Variante;
  /** Está sobre `azul-principal` (DESIGN.md §11, la columna «sobre azul»). */
  sobreAzul?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Un botón del admin, en una de las cuatro variantes de DESIGN.md §11. No se
 * deshabilita para explicar algo: solo mientras corre una acción, y el que
 * corre lo dice («Guardando…») y lleva `aria-busy`, que lo deja a opacidad
 * plena mientras los demás esperan.
 */
export function Boton({ variante, sobreAzul = false, type = "button", className, ...props }: PropsDeBoton) {
  return <button type={type} {...props} className={`${claseDeBoton(variante, sobreAzul)} ${className ?? ""}`} />;
}

type PropsDeEnlace = { variante: Variante } & React.ComponentProps<typeof Link>;

/** Un link con cara de botón: navega, no hace. */
export function BotonEnlace({ variante, className, ...props }: PropsDeEnlace) {
  return <Link {...props} className={`${claseDeBoton(variante)} ${className ?? ""}`} />;
}
