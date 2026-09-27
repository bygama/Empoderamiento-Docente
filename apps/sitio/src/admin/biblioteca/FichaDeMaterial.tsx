"use client";

import { useState } from "react";
import { resolverCambio } from "@ed/kit-admin";
import { AvisoDeLaAccion, type AvisoDelEditor } from "@/admin/armazon/AvisoDelEditor";
import { useErroresDelEditor } from "@/admin/armazon/useErroresDelEditor";
import { useFrenarSalida } from "@/admin/armazon/useFrenarSalida";
import { materialesParecidos } from "@/datos/acciones/buscar-datos";
import type { Vecino } from "@/datos/biblioteca/contra-la-biblioteca";
import type { FichaDeMaterial as Ficha, Vecinos } from "@/datos/consultas/ficha-de-material";
import type { BorradorDeMaterial } from "@/features/biblioteca/contenido/material";
import { borradorVacio } from "@/features/biblioteca/contenido/modelo";
import { AvisoDeParecidos } from "./AvisoDeParecidos";
import type { Cambiar } from "./Bloque";
import { EncabezadoDeLaFicha } from "./EncabezadoDeLaFicha";
import { aDocumento, aFormulario, mismoDocumento, type Origen } from "./formulario";
import { FormularioDeMaterial } from "./FormularioDeMaterial";
import { opcionesDeLaFicha } from "./opciones";
import { PanelDelMaterial } from "./PanelDelMaterial";
import { QueCambio } from "./QueCambio";
import { SalidaDelMaterial } from "./SalidaDelMaterial";
import { SIN_RED, useGuardarMaterial } from "./useGuardarMaterial";
import { usePortadaGenerada } from "./usePortadaGenerada";
import { usePublicarMaterial } from "./usePublicarMaterial";
import { useSalidaDeMaterial } from "./useSalidaDeMaterial";

type Props = {
  /** El material; en `/nuevo`, sin id. */
  ficha: Omit<Ficha, "id"> & { id: string | null };
  vecinos: Vecinos;
  /** De dónde salió cada dato, si vino de «Buscar datos». */
  origenInicial?: Origen;
  /** Los materiales con un título parecido que encontró «Buscar datos». */
  parecidosIniciales?: readonly Vecino[];
  /** Lo que la ficha dice al abrirse: que la persona del Equipo que llegó no está entre los autores. */
  avisoInicial?: AvisoDelEditor;
};

/**
 * La ficha de un material (SPEC §9.2 de `work/biblioteca/`), con el molde de
 * «Ficha de una entidad» (DESIGN.md §11): el encabezado fijo con el estado y
 * las acciones, el formulario y, al lado desde `xl`, el panel con la salud del
 * link y dónde se ve. Lo escrito vive en el navegador hasta que se guarda;
 * «Cambios sin guardar» es el documento en pantalla contra el último
 * guardado, y frena la salida.
 */
export function FichaDeMaterial({ ficha, vecinos, origenInicial = {}, parecidosIniciales = [], avisoInicial }: Props) {
  const [form, setForm] = useState(() => aFormulario(ficha.documento));
  // Lo último guardado: en `/nuevo`, nada, así lo que vino de «Buscar datos» ya cuenta como sin guardar.
  const [guardado, setGuardado] = useState(() => (ficha.id ? ficha.documento : borradorVacio()));
  const [publicado, setPublicado] = useState<BorradorDeMaterial | null>(() => ficha.publicado);
  const [origen, setOrigen] = useState<Origen>(() => origenInicial);
  const [parecidos, setParecidos] = useState(() => parecidosIniciales);
  const documento = aDocumento(form);
  const haySinGuardar = !mismoDocumento(documento, guardado);
  const soltarSalida = useFrenarSalida(haySinGuardar);
  const errores = useErroresDelEditor();
  const portadaGenerada = usePortadaGenerada(form);
  const g = useGuardarMaterial({ idInicial: ficha.id, estadoInicial: ficha.estado, avisoInicial, mostrarErrores: errores.mostrar });
  const { id, estado, setAviso, pendiente, setPendiente } = g;
  const opciones = opcionesDeLaFicha(vecinos, id, form.destacado);

  const cambiar: Cambiar = (campo, cambio) => {
    errores.contexto.limpiar(String(campo));
    setOrigen((o) => (campo in o ? Object.fromEntries(Object.entries(o).filter(([c]) => c !== campo)) : o));
    setForm((actual) => ({ ...actual, [campo]: resolverCambio(cambio, actual[campo]) }));
  };

  /** Guarda lo que hay en pantalla; el primer guardado de uno nuevo avisa si el título se parece a otro. Da el id y el `borradorEn`, o `false`. */
  async function guardarLoQueHay() {
    const enviado = documento;
    const nuevo = !id;
    const r = await g.guardarDocumento(enviado);
    if (!r) return r;
    setGuardado(enviado);
    setOrigen({});
    if (nuevo && enviado.titulo.trim()) {
      const p = await materialesParecidos({ titulo: enviado.titulo, id: r.id });
      if (p.ok) setParecidos(p.parecidos);
    }
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
  const { verBorrador, publicar } = usePublicarMaterial({
    setEstado: g.setEstado,
    setAviso,
    setPendiente,
    mostrarErrores: errores.mostrar,
    preparar,
    nadaParaPublicar: Boolean(id && estado.publicado && !estado.borradorEn && !haySinGuardar),
    alPublicarse: () => setPublicado(documento),
  });
  const salida = useSalidaDeMaterial({
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
    // Ocultar suelta el lugar de destacado en la base: la ficha lo refleja sin recargar.
    alOcultarse: () => setForm((f) => ({ ...f, destacado: null })),
  });

  const recargar = () => {
    if (haySinGuardar && !window.confirm("Recargar tira lo que escribiste sin guardar. ¿Recargar igual?")) return;
    soltarSalida();
    window.location.reload();
  };

  const titulo = form.titulo.trim() || "Nuevo material";
  return (
    // Abajo, en el celular, el lugar de la barra fija de las acciones (64 px): así no tapa el último campo.
    <div className="space-y-8 max-lg:pb-16">
      <EncabezadoDeLaFicha
        titulo={titulo}
        id={id}
        estado={estado}
        haySinGuardar={haySinGuardar}
        pendiente={pendiente}
        aviso={<AvisoDeLaAccion aviso={g.aviso} alCerrar={() => setAviso(null)} alRecargar={recargar} />}
        alGuardar={guardar}
        alVerBorrador={verBorrador}
        alPublicar={publicar}
      />
      <AvisoDeParecidos parecidos={parecidos.filter((p) => p.id !== id)} />
      {/* Desde `xl`, el panel ocupa las dos filas de la derecha; la segunda fila se lleva el sobrante, así «Qué cambió» no se despega del formulario. */}
      <div className="grid grid-cols-1 items-start gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,48rem)_22rem] xl:grid-rows-[auto_1fr]">
        <FormularioDeMaterial form={form} cambiar={cambiar} errores={errores.contexto.errores} origen={origen} portadaGenerada={portadaGenerada} {...opciones} />
        <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <PanelDelMaterial
            form={form}
            chequeo={ficha.chequeo}
            publicado={estado.publicado}
            linkPublicado={publicado ? { url: publicado.url, doi: publicado.doi } : null}
            novedades={ficha.novedades}
          />
        </div>
        <div className="space-y-10">
          <QueCambio publicado={publicado} actual={documento} personas={opciones.personas} />
          {id ? (
            <SalidaDelMaterial
              titulo={form.titulo.trim() || "Sin título"}
              estado={estado}
              pendiente={pendiente}
              alDescartar={() => void salida.descartar(id)}
              alOcultar={() => void salida.ocultar(id)}
              alBorrar={() => void salida.borrar(id)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
