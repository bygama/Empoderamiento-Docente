import Link from "next/link";
import { Enlace } from "@/components/ui/icons";
import type { Comparticion } from "@/lib/contenido/compartido";
import { EDITOR_DE_PAGINAS } from "./pestanas";

const LINEA = "flex items-start gap-2 text-admin-meta text-azul-principal";
// Subrayado siempre: adentro de una frase, el color solo no alcanza para
// distinguir un link (azul-medio contra azul-principal no llega a 3:1).
const LINK =
  "rounded-sm font-medium text-azul-medio underline underline-offset-2 hover:text-azul-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio";

/** «Las siete áreas» → «las siete áreas», para ir en el medio de una frase. */
const enMinuscula = (texto: string) => texto.charAt(0).toLocaleLowerCase("es") + texto.slice(1);

/**
 * El aviso de una sección compartida (DESIGN.md §11, «Sección compartida»):
 * una línea debajo del título de la sección. Del lado de quien usa, dónde se
 * edita, con el link; del lado de la dueña, quién más lo muestra y que
 * publicar cambia las dos. Describe la sección, no contesta a una acción: no
 * es un aviso con `role`.
 */
export function AvisoDeCompartida({ compartida, pagina }: { compartida: Comparticion; pagina: string }) {
  if (compartida.tipo === "usa") {
    const { que, pagina: duena, seccion } = compartida;
    return (
      <p className={LINEA}>
        <Enlace size={16} className="mt-0.5 shrink-0 text-azul-medio" />
        <span>
          {que} se editan en{" "}
          <Link href={`${EDITOR_DE_PAGINAS}/${duena.slug}#seccion-${seccion.clave}`} className={LINK}>
            {duena.nombre} › {seccion.nombre}
          </Link>
          : las comparten las dos páginas.
        </span>
      </p>
    );
  }
  return (
    <>
      {compartida.paginas.map(({ nombre, que }) => (
        <p key={nombre} className={LINEA}>
          <Enlace size={16} className="mt-0.5 shrink-0 text-azul-medio" />
          <span>
            {nombre} también muestra {enMinuscula(que)}: al publicar {pagina}, cambian las dos páginas.
          </span>
        </p>
      ))}
    </>
  );
}
