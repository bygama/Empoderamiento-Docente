"use client";

import { useState } from "react";
import { AvisoDeLaAccion, type Cambio, resolverCambio, useFrenarSalida } from "@ed/kit-admin";
import { QueCambioPlegado } from "@/admin/armazon/QueCambioPlegado";
import { useErroresDelEditor } from "@/admin/armazon/useErroresDelEditor";
import { errorDe } from "@/admin/campos/errores";
import type { FichaDeAliado as Ficha } from "@/datos/consultas/aliados-del-admin";
import type { BorradorDeAliado } from "@/features/aliados/contenido/aliado";
import { estaAutorizado, loQueSeAutoriza } from "@/features/aliados/contenido/autorizacion";
import { igual } from "@/lib/contenido/comparar";
import { AutorizacionDelAliado } from "./AutorizacionDelAliado";
import { cambiosDelAliado } from "./cambios";
import { EncabezadoDelAliado } from "./EncabezadoDelAliado";
import { FormularioDelAliado } from "./FormularioDelAliado";
import { PanelDelAliado } from "./PanelDelAliado";
import { SalidaDelAliado } from "./SalidaDelAliado";
import { SIN_RED, useGuardarAliado } from "./useGuardarAliado";
import { usePublicarAliado } from "./usePublicarAliado";
import { useSalidaDelAliado } from "./useSalidaDelAliado";

type Props = {
  /** El aliado; en `/nuevo`, sin id. */
  ficha: Omit<Ficha, "id"> & { id: string | null };
  puedeAutorizar: boolean;
  quienPuede: string;
};

/**
 * La ficha de un aliado (SPEC §7.2 de `work/casos-aliados-fotos/`), con el
 * molde de la de una novedad (DESIGN.md §11, «Ficha de una entidad»): el
 * encabezado fijo, el formulario, la autorización aparte y, al lado desde
 * `xl`, cómo se ve y dónde. Lo escrito vive en el navegador hasta que se
 * guarda; «Cambios sin guardar» frena la salida.
 */
export function FichaDeAliado({ ficha, puedeAutorizar, quienPuede }: Props) {
  const [form, setForm] = useState(() => ficha.documento);
  const [guardado, setGuardado] = useState<BorradorDeAliado>(() => ficha.documento);
  const [publicado, setPublicado] = useState<BorradorDeAliado | null>(() => ficha.publicado);
  const haySinGuardar = !igual(form, guardado);
  const soltarSalida = useFrenarSalida(haySinGuardar);
  const errores = useErroresDelEditor();
  const g = useGuardarAliado({ idInicial: ficha.id, estadoInicial: ficha.estado, mostrarErrores: errores.mostrar });

  function cambiar<K extends keyof BorradorDeAliado>(campo: K, cambio: Cambio<BorradorDeAliado[K]>) {
    errores.contexto.limpiar(String(campo));
    setForm((actual) => ({ ...actual, [campo]: resolverCambio(cambio, actual[campo]) }));
  }

  /** Guarda lo que hay en pantalla si hace falta (o crea la fila). */
  async function preparar() {
    if (g.id && !haySinGuardar) return { id: g.id, borradorEn: g.estado.borradorEn };
    const enviado = form;
    const r = await g.guardarDocumento(enviado);
    if (r) setGuardado(enviado);
    return r;
  }

  const guardar = async () => {
    if (g.id && !haySinGuardar) return g.setAviso({ ok: true, detalle: "No hay cambios para guardar." });
    g.setPendiente("guardar");
    try {
      if (await preparar()) g.setAviso({ ok: true, detalle: g.estado.publicado ? "Borrador guardado. El sitio sigue mostrando lo publicado." : "Borrador guardado." });
    } catch {
      g.setAviso({ ok: false, detalle: SIN_RED });
    } finally {
      g.setPendiente(null);
    }
  };

  const comunes = { setEstado: g.setEstado, setAviso: g.setAviso, setPendiente: g.setPendiente };
  const { verBorrador, publicar } = usePublicarAliado({ ...comunes, mostrarErrores: errores.mostrar, preparar, alPublicarse: () => setPublicado(form) });
  const salida = useSalidaDelAliado({
    ...comunes,
    estado: g.estado,
    soltarSalida: () => soltarSalida(),
    alDescartarse: () => {
      if (!publicado) return;
      setForm(publicado);
      setGuardado(publicado);
    },
  });

  const { id } = g;
  // Lo que autorizaría la marca ahora (lo guardado, o lo publicado si lo guardado no se puede publicar), y si ya vale para eso.
  const a = ficha.autorizacion;
  const aAutorizar = loQueSeAutoriza(guardado, publicado);
  const alDia = aAutorizar ? estaAutorizado(aAutorizar, { autorizado: a.autorizado, autorizadoLogo: a.logo, autorizadoNombre: a.nombre, autorizadoAlt: a.alt }) : false;
  const recargar = () => {
    if (haySinGuardar && !window.confirm("Recargar tira lo que escribiste sin guardar. ¿Recargar igual?")) return;
    soltarSalida();
    window.location.reload();
  };

  return (
    // Abajo, en el celular, el lugar de la barra fija de las acciones (64 px): así no tapa el último campo.
    <div className="space-y-8 max-lg:pb-16">
      <EncabezadoDelAliado
        titulo={form.nombre.trim() || "Nuevo aliado"}
        id={g.id}
        estado={g.estado}
        autorizado={alDia}
        haySinGuardar={haySinGuardar}
        pendiente={g.pendiente}
        aviso={<AvisoDeLaAccion aviso={g.aviso} alCerrar={() => g.setAviso(null)} alRecargar={recargar} />}
        alGuardar={guardar}
        alVerBorrador={verBorrador}
        alPublicar={publicar}
      />
      {/* `grid-cols-1` es `minmax(0, 1fr)`: sin eso, lo que no se corta (un título con `truncate`) ensancha la ficha en el celular. */}
      <div className="grid grid-cols-1 items-start gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,48rem)_22rem] xl:grid-rows-[auto_1fr]">
        <div className="space-y-10">
          <FormularioDelAliado form={form} cambiar={cambiar} error={(camino) => errorDe(errores.contexto.errores, camino)} />
          <AutorizacionDelAliado
            id={g.id}
            autorizacion={a}
            aAutorizar={aAutorizar}
            alDia={alDia}
            haySinGuardar={haySinGuardar}
            puedeAutorizar={puedeAutorizar}
            quienPuede={quienPuede}
          />
        </div>
        <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <PanelDelAliado form={form} autorizado={alDia} enElSitio={g.estado.publicado} />
        </div>
        <div className="space-y-10">
          {/* Sin nada publicado no hay contra qué comparar: se publica entero. */}
          {publicado ? <QueCambioPlegado cambios={cambiosDelAliado(publicado, form)} /> : null}
          {id ? (
            <SalidaDelAliado
              nombre={form.nombre.trim() || "este aliado"}
              estado={g.estado}
              pendiente={g.pendiente}
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
