"use client";

import { Casilla, Parrafo, Seleccion, TextoCorto, type Cambio } from "@ed/kit-admin";
import { errorDe } from "@/admin/campos/errores";
import type { Firmado } from "@/datos/consultas/ficha-de-persona";
import { TIPOS } from "@/features/biblioteca/contenido/modelo";
import { TOPES } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import type { PublicacionEnElFormulario } from "../formulario";

type Props = {
  /** El camino del ítem en el esquema: `recorrido.etapas.2.publicaciones.0`. */
  camino: string;
  publicacion: PublicacionEnElFormulario;
  cambiar: (cambio: Cambio<PublicacionEnElFormulario>) => void;
  firmados: readonly Firmado[];
  errores: Readonly<Record<string, string>>;
};

const ORIGENES = [
  { valor: "biblioteca", etiqueta: "De la Biblioteca" },
  { valor: "sin-link", etiqueta: "Sin link, fuera de la Biblioteca" },
] as const;

/** La misma publicación con el otro origen: conserva lo que es del perfil y empieza de cero lo demás. */
function conOrigen(p: PublicacionEnElFormulario, origen: string): PublicacionEnElFormulario {
  const delPerfil = { clave: p.clave, detalle: p.detalle, conceptos: p.conceptos, destacada: p.destacada };
  if (origen === p.origen) return p;
  return origen === "biblioteca" ? { ...delPerfil, origen: "biblioteca", material: "" } : { ...delPerfil, origen: "sin-link", titulo: "", tipo: "", anio: "" };
}

/**
 * Una publicación de una etapa (SPEC §5.1 de `work/equipo/`): un material que
 * la persona firma en la Biblioteca, o una pieza sin link escrita acá. La
 * regla, dicha en el campo: con link, va a la Biblioteca.
 */
export function PublicacionDeLaEtapa({ camino, publicacion: p, cambiar, firmados, errores }: Props) {
  const error = (campo: string) => errorDe(errores, `${camino}.${campo}`);
  return (
    <div className="space-y-5">
      <Seleccion
        nombre={`${camino}.origen`}
        etiqueta="De dónde viene"
        ayuda="Con link, va a la Biblioteca y se elige de ahí; sin link, se escribe acá."
        opciones={ORIGENES}
        sinElegir="Elegí de dónde viene"
        valor={p.origen}
        alCambiar={(origen) => cambiar((actual) => conOrigen(actual, origen))}
        error={error("origen")}
      />
      {p.origen === "biblioteca" ? (
        <Seleccion
          nombre={`${camino}.material`}
          etiqueta="Material"
          ayuda={
            firmados.length
              ? "Lo que firma en la Biblioteca: el título, el año, el tipo y el link salen de ahí."
              : "Todavía no firma nada en la Biblioteca: agregalo con «Agregar en Biblioteca», abajo, y volvé."
          }
          opciones={firmados.map((m) => ({ valor: m.id, etiqueta: `${m.titulo}${m.anio ? ` (${m.anio})` : ""}${m.publicado ? "" : " · oculto en la Biblioteca"}` }))}
          sinElegir="Elegí un material"
          valor={p.material}
          alCambiar={(material) => cambiar((actual) => (actual.origen === "biblioteca" ? { ...actual, material } : actual))}
          error={error("material")}
        />
      ) : (
        <>
          <TextoCorto nombre={`${camino}.titulo`} etiqueta="Título" maximo={TOPES.tituloDePublicacion} valor={p.titulo} alCambiar={(titulo) => cambiar((a) => (a.origen === "sin-link" ? { ...a, titulo } : a))} error={error("titulo")} />
          <div className="@container">
            <div className="grid items-start gap-5 @xl:grid-cols-2">
              <Seleccion
                nombre={`${camino}.tipo`}
                etiqueta="Tipo"
                ayuda="El de la Biblioteca: en la tarjeta se lee como artículo, libro o materiales."
                opciones={TIPOS.map((t) => ({ valor: t, etiqueta: t }))}
                sinElegir="Elegí un tipo"
                valor={p.tipo}
                alCambiar={(v) => cambiar((a) => (a.origen === "sin-link" ? { ...a, tipo: TIPOS.find((t) => t === v) ?? "" } : a))}
                error={error("tipo")}
              />
              <TextoCorto nombre={`${camino}.anio`} etiqueta="Año" ayuda="El año, o un período: «2015 – 2017»." maximo={TOPES.anioDePublicacion} valor={p.anio} alCambiar={(anio) => cambiar((a) => (a.origen === "sin-link" ? { ...a, anio } : a))} error={error("anio")} />
            </div>
          </div>
        </>
      )}
      <TextoCorto
        nombre={`${camino}.detalle`}
        etiqueta="Detalle"
        ayuda={p.origen === "biblioteca" ? "La línea de abajo del título: con quién y dónde («Con Karla Gómez · RELIME»). Vacía, se lee dónde se publicó." : "La línea de abajo del título: con quién y dónde, o de qué libro es el capítulo."}
        maximo={TOPES.detalleDePublicacion}
        valor={p.detalle}
        alCambiar={(detalle) => cambiar((a) => ({ ...a, detalle }))}
        error={error("detalle")}
      />
      <Parrafo
        nombre={`${camino}.conceptos`}
        etiqueta="Conceptos"
        ayuda={`Opcional: los que trabaja la pieza, uno por renglón y hasta ${TOPES.conceptos}. Van como etiquetas.`}
        maximo={TOPES.conceptos * (TOPES.concepto + 1)}
        valor={p.conceptos}
        alCambiar={(conceptos) => cambiar((a) => ({ ...a, conceptos }))}
        error={error("conceptos")}
      />
      <Casilla nombre={`${camino}.destacada`} etiqueta="Destacada" ayuda="Una por etapa: va con más peso, y en «Concepto» es la pieza que se muestra." valor={p.destacada} alCambiar={(destacada) => cambiar((a) => ({ ...a, destacada }))} error={error("destacada")} />
    </div>
  );
}
