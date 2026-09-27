"use client";

import { Parrafo, TextoCorto } from "@ed/kit-admin";
import { Bloque } from "@/admin/armazon/Bloque";
import { errorDe } from "@/admin/campos/errores";
import { TOPES } from "@/features/quienes-somos/contenido/modelo-del-equipo";
import type { PropsDelRecorrido } from "./bloques";

/** El cierre del recorrido (SPEC §4.1 de `work/equipo/`): un título y uno o dos párrafos, al final, con la figura. */
export function BloqueDelCierre({ recorrido, cambiar, errores }: PropsDelRecorrido) {
  const cierre = recorrido.cierre;
  const cambiarCierre = (campo: keyof typeof cierre, valor: string) => cambiar("cierre", (actual) => ({ ...actual, [campo]: valor }));
  return (
    <Bloque id="bloque-cierre" titulo="El cierre">
      <TextoCorto nombre="recorrido.cierre.titulo" etiqueta="Título" maximo={TOPES.cierreTitulo} valor={cierre.titulo} alCambiar={(v) => cambiarCierre("titulo", v)} error={errorDe(errores, "recorrido.cierre.titulo")} />
      <Parrafo nombre="recorrido.cierre.texto" etiqueta="Texto" maximo={TOPES.cierreTexto} valor={cierre.texto} alCambiar={(v) => cambiarCierre("texto", v)} error={errorDe(errores, "recorrido.cierre.texto")} />
      <Parrafo
        nombre="recorrido.cierre.textoDos"
        etiqueta="Segundo texto"
        ayuda="Opcional: un párrafo más, en azul, debajo del primero."
        maximo={TOPES.cierreTextoDos}
        valor={cierre.textoDos}
        alCambiar={(v) => cambiarCierre("textoDos", v)}
        error={errorDe(errores, "recorrido.cierre.textoDos")}
      />
    </Bloque>
  );
}
