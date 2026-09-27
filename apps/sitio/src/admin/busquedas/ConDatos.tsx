import type { FilaDeBusquedas, ResumenDeBusquedas } from "@/datos/consultas/busquedas";
import { nombreDelPais } from "@/lib/busquedas/paises";
import { Cifra } from "@/admin/armazon/Cifra";
import { cifras, motivo, rutaDe } from "./formato";
import { Seccion, type FilaDeSeccion } from "./Seccion";

const filasDe = (filas: readonly FilaDeBusquedas[], nombre: (valor: string) => string): FilaDeSeccion[] =>
  filas.map((f) => ({ clave: f.valor, principal: nombre(f.valor), detalle: cifras(f) }));

const tal = (valor: string) => valor;

/**
 * Búsquedas con datos: los tres números del período, «Casi nos encuentran»
 * (lo que se puede mejorar, por eso va primero) y las tres listas. Páginas y
 * Países van lado a lado desde `lg`: son cortas y se leen juntas.
 */
export function ConDatos({ resumen }: { resumen: ResumenDeBusquedas }) {
  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <Cifra etiqueta="Clics desde Google" valor={resumen.clics} variacion={resumen.variacionClics} />
        <Cifra etiqueta="Veces que apareció el sitio" valor={resumen.impresiones} variacion={resumen.variacionImpresiones} />
        {resumen.posicion !== null ? <Cifra etiqueta="Puesto promedio" valor={Math.round(resumen.posicion * 10) / 10} /> : null}
      </div>
      <Seccion
        id="casi-nos-encuentran"
        titulo="Casi nos encuentran"
        explicacion="Búsquedas donde un empujón cambia algo: el sitio aparece al pie de la primera página o en la segunda, o se ve mucho y se toca poco."
        filas={resumen.casi.map((c) => ({ clave: c.valor, principal: c.valor, detalle: motivo(c) }))}
        vacio={{ titulo: "Nada por ahora", texto: "Ninguna búsqueda está entre los puestos 8 y 20, ni se ve mucho sin que la toquen." }}
      />
      <Seccion
        id="lo-que-buscaron"
        titulo="Lo que buscaron"
        explicacion="Lo que escribió la gente en Google antes de llegar. Google oculta las búsquedas que hace muy poca gente, así que esta lista puede sumar menos que el total."
        filas={filasDe(resumen.consultas, tal)}
        vacio={{ titulo: "Todavía no hay búsquedas para mostrar", texto: "Google no muestra las búsquedas que hace muy poca gente, para cuidar su privacidad." }}
      />
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-6">
        <Seccion
          id="paginas"
          titulo="Páginas"
          explicacion="Adónde llegó la gente desde Google."
          filas={filasDe(resumen.paginas, rutaDe)}
          vacio={{ titulo: "Todavía ninguna página", texto: "Ninguna página del sitio apareció en Google en estos 28 días." }}
        />
        <Seccion
          id="paises"
          titulo="Países"
          explicacion="Desde dónde buscaron."
          filas={filasDe(resumen.paises, nombreDelPais)}
          vacio={{ titulo: "Todavía ningún país", texto: "Google todavía no dice desde dónde buscaron en estos 28 días." }}
        />
      </div>
    </div>
  );
}
