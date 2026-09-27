"use client";

import { Casilla, Parrafo, Seleccion, TextoCorto } from "@ed/kit-admin";
import { LARGO_MAXIMO } from "@ed/db/slug";
import { Bloque } from "@/admin/armazon/Bloque";
import { ESTADOS, TOPES } from "@/features/investigacion/contenido/modelo-de-casos";
import type { PropsDeBloque } from "./tipos";

type Props = PropsDeBloque & { ayudaDeLaUrl: string };

/**
 * Lo que se ve en la tapa de la carpeta y la ficha técnica del expediente,
 * más la URL. Cada ayuda dice por qué el tope: lo que entra en la escena.
 */
export function ElCaso({ form, cambiar, error, ayudaDeLaUrl }: Props) {
  return (
    <>
      <Bloque id="bloque-caso" titulo="El caso">
        <TextoCorto
          nombre="pregunta"
          etiqueta="Pregunta"
          ayuda="El título del caso: en la tapa de la carpeta entra en dos renglones."
          maximo={TOPES.pregunta}
          valor={form.pregunta}
          alCambiar={(v) => cambiar("pregunta", v)}
          error={error("pregunta")}
        />
        <TextoCorto nombre="eje" etiqueta="Eje" ayuda="Va en mayúsculas en la tapa: sin palabras muy largas." maximo={TOPES.eje} valor={form.eje} alCambiar={(v) => cambiar("eje", v)} error={error("eje")} />
        <TextoCorto
          nombre="indicio"
          etiqueta="Indicio"
          ayuda="La frase corta que asoma al pasar sobre la carpeta: un renglón."
          maximo={TOPES.indicio}
          valor={form.indicio}
          alCambiar={(v) => cambiar("indicio", v)}
          error={error("indicio")}
        />
        <TextoCorto nombre="slug" etiqueta="URL" ayuda={ayudaDeLaUrl} maximo={LARGO_MAXIMO} valor={form.slug} alCambiar={(v) => cambiar("slug", v)} error={error("slug")} />
      </Bloque>
      <Bloque id="bloque-ficha" titulo="Ficha técnica">
        <div className="@container">
          <div className="grid items-start gap-5 @xl:grid-cols-2">
            <TextoCorto nombre="periodo" etiqueta="Período" ayuda="Como en un expediente: «2011 — 2013»." maximo={TOPES.periodo} valor={form.periodo} alCambiar={(v) => cambiar("periodo", v)} error={error("periodo")} />
            <Seleccion
              nombre="estado"
              etiqueta="Estado"
              opciones={ESTADOS.map((e) => ({ valor: e.valor, etiqueta: e.etiqueta }))}
              sinElegir="Elegí el estado"
              valor={form.estado}
              alCambiar={(v) => {
                // Sale de las opciones; buscarlo le devuelve su tipo sin un `as`.
                const estado = ESTADOS.find((e) => e.valor === v);
                if (estado) cambiar("estado", estado.valor);
              }}
              error={error("estado")}
            />
          </div>
        </div>
        <TextoCorto nombre="ambito" etiqueta="Ámbito" ayuda="Dónde y con quién: «Oaxaca, México · Secundaria»." maximo={TOPES.ambito} valor={form.ambito} alCambiar={(v) => cambiar("ambito", v)} error={error("ambito")} />
      </Bloque>
    </>
  );
}

/** Al final del formulario: si es un caso provisional, con la aclaración que se lee al pie del expediente. */
export function CasoProvisional({ form, cambiar, error }: PropsDeBloque) {
  return (
    <>
      <Bloque id="bloque-provisional" titulo="Caso provisional">
        <Casilla
          nombre="esDemo"
          etiqueta="Es un caso provisional"
          ayuda="Prende la marca «DEMO» en el expediente y la aclaración al pie: para un caso que todavía no es de un proyecto real."
          valor={form.esDemo}
          alCambiar={(v) => cambiar("esDemo", v)}
          error={error("esDemo")}
        />
        {form.esDemo ? (
          <Parrafo
            nombre="aclaracion"
            etiqueta="Aclaración"
            ayuda="Se lee al pie del expediente, después de «Caso demo — contenido provisional»."
            maximo={TOPES.aclaracion}
            valor={form.aclaracion}
            alCambiar={(v) => cambiar("aclaracion", v)}
            error={error("aclaracion")}
          />
        ) : null}
      </Bloque>
    </>
  );
}
