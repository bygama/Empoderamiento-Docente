"use client";

import { Bloque, CampoFoto, Parrafo, resolverCambio, Seleccion, TextoCorto } from "@ed/kit-admin";
import { fotosParaElegir, subirFoto } from "@/datos/acciones/fotos";
import { SUJECIONES, TOPES } from "@/features/investigacion/contenido/modelo-de-casos";
import { MAXIMO_BYTES } from "@/lib/contenido/fotos";
import type { PropsDeBloque } from "./tipos";

/**
 * Lo que se lee al abrir la carpeta: los textos del expediente y la lámina
 * sujeta a la hoja. La lámina es una foto de Fotos que va entera (sin foco):
 * se elige una ya subida o se sube otra.
 */
export function ElExpediente({ form, cambiar, error }: PropsDeBloque) {
  return (
    <>
      <Bloque id="bloque-expediente" titulo="El expediente">
        <Parrafo nombre="contexto" etiqueta="Contexto" ayuda="Lo primero que se lee en la hoja del informe." maximo={TOPES.contexto} valor={form.contexto} alCambiar={(v) => cambiar("contexto", v)} error={error("contexto")} />
        <Parrafo
          nombre="preguntaInvestigacion"
          etiqueta="Pregunta de investigación"
          ayuda="Va centrada, debajo del contexto."
          maximo={TOPES.preguntaInvestigacion}
          valor={form.preguntaInvestigacion}
          alCambiar={(v) => cambiar("preguntaInvestigacion", v)}
          error={error("preguntaInvestigacion")}
        />
        <Parrafo nombre="analisis" etiqueta="Análisis" ayuda="El cartón del expediente, después de las evidencias." maximo={TOPES.analisis} valor={form.analisis} alCambiar={(v) => cambiar("analisis", v)} error={error("analisis")} />
        <TextoCorto
          nombre="aprendizaje"
          etiqueta="Aprendizaje"
          ayuda="Una nota a mano al margen: corta y humana."
          maximo={TOPES.aprendizaje}
          valor={form.aprendizaje}
          alCambiar={(v) => cambiar("aprendizaje", v)}
          error={error("aprendizaje")}
        />
        <Parrafo nombre="queCambio" etiqueta="Lo que cambió con el caso" ayuda="Cierra el cartón, en letra grande." maximo={TOPES.queCambio} valor={form.queCambio} alCambiar={(v) => cambiar("queCambio", v)} error={error("queCambio")} />
      </Bloque>
      <Bloque id="bloque-lamina" titulo="Lámina">
        <CampoFoto
          nombre="lamina.foto"
          etiqueta="La ilustración o el registro"
          ayuda="Va entera, sujeta a la hoja del informe, en un marco de 4 × 3."
          valor={form.lamina.foto}
          alCambiar={(v) => cambiar("lamina", (actual) => ({ ...actual, foto: resolverCambio(v, actual.foto) }))}
          subir={subirFoto}
          elegir={fotosParaElegir}
          conFoco={false}
          maximoBytes={MAXIMO_BYTES}
          error={error("lamina.foto")}
        />
        <div className="@container">
          <div className="grid items-start gap-5 @xl:grid-cols-2">
            <Seleccion
              nombre="lamina.sujecion"
              etiqueta="Cómo está sujeta"
              opciones={SUJECIONES.map((s) => ({ valor: s.valor, etiqueta: s.etiqueta }))}
              sinElegir="Elegí cómo"
              valor={form.lamina.sujecion}
              alCambiar={(v) => {
                const sujecion = SUJECIONES.find((s) => s.valor === v);
                if (sujecion) cambiar("lamina", (actual) => ({ ...actual, sujecion: sujecion.valor }));
              }}
              error={error("lamina.sujecion")}
            />
            <TextoCorto
              nombre="lamina.rotulo"
              etiqueta="Rótulo"
              ayuda="Debajo de la lámina, como en un archivo: «LÁMINA 01 · …»."
              maximo={TOPES.rotuloDeLamina}
              valor={form.lamina.rotulo}
              alCambiar={(rotulo) => cambiar("lamina", (actual) => ({ ...actual, rotulo }))}
              error={error("lamina.rotulo")}
            />
          </div>
        </div>
      </Bloque>
    </>
  );
}
