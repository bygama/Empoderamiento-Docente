"use client";

import { ListaVariable, Seleccion, TextoCorto } from "@ed/kit-admin";
import { errorDe } from "@/admin/campos/errores";
import { COLORES, TOPES } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import type { PropsDelRecorrido } from "./bloques";
import { categoriaVacia } from "./vacios";

type Categoria = PropsDelRecorrido["recorrido"]["categorias"][number];

/** Los tres acentos, dichos por lo que significan (DESIGN.md: el color es un acento, nunca un fondo). */
export const OPCIONES_DE_COLOR = [
  { valor: "verde", etiqueta: "Verde · el aula, los conceptos" },
  { valor: "azul", etiqueta: "Azul · la investigación" },
  { valor: "naranja", etiqueta: "Naranja · la transformación (poco)" },
] as const;

/** El color elegido, con su tipo, o vacío si no es uno de los tres. */
export const colorDe = (v: string) => COLORES.find((c) => c === v) ?? "";

/**
 * Las categorías del recorrido: el índice vivo que acompaña la lectura de las
 * etapas (SPEC §4.1). Cada etapa se ordena en una; la clave es fija y no se
 * ve, así cambiar el nombre no desarma las etapas.
 */
export function CategoriasDelRecorrido({ recorrido, cambiar, errores }: PropsDelRecorrido) {
  return (
    <ListaVariable<Categoria>
      nombre="recorrido.categorias"
      etiqueta="Categorías"
      etiquetaItem="Categoría"
      maximo={TOPES.categorias}
      ayuda="El índice que acompaña el recorrido: cada etapa se ordena en una, y se enciende al leerla."
      vacia="Sin categorías no se puede publicar: cada etapa necesita una."
      valor={recorrido.categorias}
      alCambiar={(v) => cambiar("categorias", v)}
      itemVacio={categoriaVacia}
      claveDe={(c) => c.clave}
      resumenDe={(c) => c.etiqueta.trim()}
      porItem={(i, c, cambiarCategoria) => (
        <div className="@container">
          <div className="grid items-start gap-5 @xl:grid-cols-2">
            <TextoCorto
              nombre={`recorrido.categorias.${i}.etiqueta`}
              etiqueta="Nombre"
              maximo={TOPES.categoria}
              valor={c.etiqueta}
              alCambiar={(etiqueta) => cambiarCategoria((actual) => ({ ...actual, etiqueta }))}
              error={errorDe(errores, `recorrido.categorias.${i}.etiqueta`)}
            />
            <Seleccion
              nombre={`recorrido.categorias.${i}.color`}
              etiqueta="Color"
              opciones={OPCIONES_DE_COLOR}
              sinElegir="Elegí un color"
              valor={c.color}
              alCambiar={(v) => cambiarCategoria((actual) => ({ ...actual, color: colorDe(v) }))}
              error={errorDe(errores, `recorrido.categorias.${i}.color`)}
            />
          </div>
        </div>
      )}
    />
  );
}
