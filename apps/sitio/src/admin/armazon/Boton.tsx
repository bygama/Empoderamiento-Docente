import Link from "next/link";
import { claseDeBoton, type Variante } from "@ed/kit-admin";

// El botón vive en el kit, con los controles que lo usan
// (work/novedades-y-kit/DECISIONS, A).
// Se va con la mudanza de armazon al kit.
export { Boton } from "@ed/kit-admin";

type PropsDeEnlace = { variante: Variante } & React.ComponentProps<typeof Link>;

/** Un link con cara de botón (DESIGN.md §11): navega, no hace. */
export function BotonEnlace({ variante, className, ...props }: PropsDeEnlace) {
  return <Link {...props} className={`${claseDeBoton(variante)} ${className ?? ""}`} />;
}
