"use client";

import { ListaVariable, Seleccion, TextoCorto, type Opcion } from "@ed/kit-admin";
import { errorDe } from "@/admin/campos/errores";
import { firmaDe, TOPES } from "@/features/biblioteca/contenido/modelo";
import { Bloque, type PropsDeBloque } from "./Bloque";
import { autoriaVacia, conOrigen, type AutoriaEnElFormulario } from "./formulario";

/**
 * Quién firma (SPEC §4.1 y §9.2 de `work/biblioteca/`): cada autor con su
 * nombre como figura en la publicación y, si es de ED, la persona del Equipo
 * —de ahí salen sus publicaciones en su perfil—; en orden, hasta 30. Debajo,
 * la firma escrita, solo para lo que no es una lista de nombres: vacía, el
 * sitio une los nombres, y la ayuda dice cómo (DECISIONS, C).
 */
export function AutoresDelMaterial({ form, cambiar, errores, origen, personas }: PropsDeBloque & { personas: readonly Opcion[] }) {
  const error = (camino: string) => errorDe(errores, camino);
  const unidos = firmaDe({ autores: null, autorias: form.autorias });
  return (
    <Bloque id="bloque-autores" titulo="Autores">
      <ListaVariable<AutoriaEnElFormulario>
        nombre="autorias"
        etiqueta="Quién firma"
        etiquetaItem="Autor"
        maximo={TOPES.autores}
        ayuda={conOrigen("En el orden de la publicación. Si es del equipo de ED, elegí su perfil: el material aparece entre sus publicaciones.", origen.autorias)}
        vacia="Todavía no firma nadie: para publicarlo hace falta al menos un autor o una autora."
        valor={form.autorias}
        alCambiar={(v) => cambiar("autorias", v)}
        itemVacio={autoriaVacia}
        claveDe={(a) => a.clave}
        resumenDe={(a) => a.nombre.trim()}
        porItem={(i, a, cambiarAutor) => (
          <div className="@container">
            <div className="grid items-start gap-5 @xl:grid-cols-2">
              <TextoCorto
                nombre={`autorias.${i}.nombre`}
                etiqueta="Nombre"
                ayuda="Como figura en la publicación."
                maximo={TOPES.autor}
                valor={a.nombre}
                alCambiar={(nombre) => cambiarAutor((actual) => ({ ...actual, nombre }))}
                error={error(`autorias.${i}.nombre`)}
              />
              <Seleccion
                nombre={`autorias.${i}.persona`}
                etiqueta="Del Equipo"
                opciones={[{ valor: "", etiqueta: "No, es de afuera" }, ...personas]}
                sinElegir="Elegí una persona"
                valor={a.persona ?? ""}
                alCambiar={(persona) => cambiarAutor((actual) => ({ ...actual, persona: persona || null }))}
                error={error(`autorias.${i}.persona`)}
              />
            </div>
          </div>
        )}
      />
      <TextoCorto
        nombre="autores"
        etiqueta="Cómo se lee la firma, solo si no es una lista de autores"
        ayuda={unidos ? `Vacío, se lee: «${unidos}». Escribila solo si dice otra cosa, como «… (editores)».` : "Vacío, se leen los nombres de arriba, unidos. Escribila solo si dice otra cosa, como «… (editores)»."}
        maximo={TOPES.firma}
        valor={form.autores}
        alCambiar={(v) => cambiar("autores", v)}
        error={error("autores")}
      />
    </Bloque>
  );
}
