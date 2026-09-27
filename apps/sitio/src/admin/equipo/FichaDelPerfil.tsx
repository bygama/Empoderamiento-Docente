"use client";

import { useState } from "react";
import { resolverCambio } from "@ed/kit-admin";
import { AvisoDeLaAccion } from "@/admin/armazon/AvisoDelEditor";
import { useErroresDelEditor } from "@/admin/armazon/useErroresDelEditor";
import { useFrenarSalida } from "@/admin/armazon/useFrenarSalida";
import type { FichaDePersona, VecinosDePersona } from "@/datos/consultas/ficha-de-persona";
import type { BorradorDePersona } from "@/features/quienes-somos/contenido/persona";
import { personaVacia } from "@/features/quienes-somos/contenido/persona-vacia";
import type { CambiarPerfil } from "./bloques";
import { EncabezadoDelPerfil } from "./EncabezadoDelPerfil";
import { aDocumento, aFormulario, mismoDocumento } from "./formulario";
import { FormularioDelPerfil } from "./FormularioDelPerfil";
import { PanelDelPerfil } from "./PanelDelPerfil";
import { QueCambio } from "./QueCambio";
import { SalidaDelPerfil } from "./SalidaDelPerfil";
import { SIN_RED, useGuardarPerfil } from "./useGuardarPerfil";
import { usePublicarPerfil } from "./usePublicarPerfil";
import { useSalidaDelPerfil } from "./useSalidaDelPerfil";

type Props = {
  /** El perfil; en `/nuevo`, sin id. */
  ficha: Omit<FichaDePersona, "id"> & { id: string | null };
  vecinos: VecinosDePersona;
};

/**
 * La ficha de un perfil del Equipo (SPEC §7.2 de `work/equipo/`), con el molde
 * de «Ficha de una entidad» (DESIGN.md §11): el encabezado fijo con el estado
 * y las acciones, el formulario y, al lado desde `xl`, dónde se ve. Lo escrito
 * vive en el navegador hasta que se guarda; «Cambios sin guardar» es el
 * documento en pantalla contra el último guardado, y frena la salida.
 */
export function FichaDelPerfil({ ficha, vecinos }: Props) {
  const [form, setForm] = useState(() => aFormulario(ficha.documento));
  const [guardado, setGuardado] = useState(() => (ficha.id ? ficha.documento : personaVacia()));
  const [publicado, setPublicado] = useState<BorradorDePersona | null>(() => ficha.publicado);
  const documento = aDocumento(form);
  const haySinGuardar = !mismoDocumento(documento, guardado);
  const soltarSalida = useFrenarSalida(haySinGuardar);
  const errores = useErroresDelEditor();
  const g = useGuardarPerfil({ idInicial: ficha.id, estadoInicial: ficha.estado, mostrarErrores: errores.mostrar });
  const { id, estado, setAviso, pendiente, setPendiente } = g;

  const cambiar: CambiarPerfil = (campo, cambio) => {
    errores.contexto.limpiar(String(campo));
    setForm((actual) => ({ ...actual, [campo]: resolverCambio(cambio, actual[campo]) }));
  };

  /** Guarda lo que hay en pantalla. Da el id y el `borradorEn`, o `false`. */
  async function guardarLoQueHay() {
    const enviado = documento;
    const r = await g.guardarDocumento(enviado);
    if (r) setGuardado(enviado);
    return r;
  }

  const guardar = async () => {
    // Ningún botón se deshabilita para explicar algo (DESIGN.md §11): contesta.
    if (id && !haySinGuardar) return setAviso({ ok: true, detalle: "No hay cambios para guardar." });
    setPendiente("guardar");
    try {
      if (await guardarLoQueHay()) setAviso({ ok: true, detalle: estado.publicado ? "Borrador guardado. El sitio sigue mostrando lo publicado." : "Borrador guardado." });
    } catch {
      setAviso({ ok: false, detalle: SIN_RED });
    } finally {
      setPendiente(null);
    }
  };

  // Publicar y ver el borrador guardan antes lo que haya en pantalla (o crean la fila).
  const preparar = async () => (id && !haySinGuardar ? { id, borradorEn: estado.borradorEn } : guardarLoQueHay());
  const { verBorrador, publicar } = usePublicarPerfil({
    setEstado: g.setEstado,
    setAviso,
    setPendiente,
    mostrarErrores: errores.mostrar,
    preparar,
    nadaParaPublicar: Boolean(id && estado.publicado && !estado.borradorEn && !haySinGuardar),
    alPublicarse: () => setPublicado(documento),
  });
  const salida = useSalidaDelPerfil({
    estado,
    setEstado: g.setEstado,
    setAviso,
    setPendiente,
    soltarSalida: () => soltarSalida(),
    alDescartarse: () => {
      if (!publicado) return;
      setForm(aFormulario(publicado));
      setGuardado(publicado);
    },
  });

  const recargar = () => {
    if (haySinGuardar && !window.confirm("Recargar tira lo que escribiste sin guardar. ¿Recargar igual?")) return;
    soltarSalida();
    window.location.reload();
  };

  const nombre = form.nombre.trim();
  return (
    // Abajo, en el celular, el lugar de la barra fija de las acciones (64 px): así no tapa el último campo.
    <div className="space-y-8 max-lg:pb-16">
      <EncabezadoDelPerfil
        titulo={nombre || "Nuevo perfil"}
        id={id}
        estado={estado}
        haySinGuardar={haySinGuardar}
        pendiente={pendiente}
        aviso={<AvisoDeLaAccion aviso={g.aviso} alCerrar={() => setAviso(null)} alRecargar={recargar} />}
        alGuardar={guardar}
        alVerBorrador={verBorrador}
        alPublicar={publicar}
      />
      {/* Desde `xl`, el panel ocupa las dos filas de la derecha; la segunda fila se lleva el sobrante, así «Qué cambió» no se despega del formulario. */}
      <div className="grid items-start gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,48rem)_22rem] xl:grid-rows-[auto_1fr]">
        <FormularioDelPerfil form={form} cambiar={cambiar} errores={errores.contexto.errores} vecinos={vecinos} />
        <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <PanelDelPerfil nivel={form.nivel} conRecorrido={form.recorrido !== null} slugPublicado={estado.publicado && publicado ? publicado.slug : null} />
        </div>
        <div className="space-y-10">
          <QueCambio publicado={publicado} actual={documento} firmados={vecinos.firmados} />
          {id ? (
            <SalidaDelPerfil
              nombre={nombre || "esta persona"}
              estado={estado}
              pendiente={pendiente}
              alDescartar={() => void salida.descartar(id)}
              alDespublicar={() => void salida.despublicar(id)}
              alBorrar={() => void salida.borrar(id)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
