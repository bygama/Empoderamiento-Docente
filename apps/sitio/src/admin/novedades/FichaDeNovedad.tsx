"use client";

import { useState } from "react";
import { desdeTexto } from "@ed/db/slug";
import { resolverCambio, type Cambio, type Opcion } from "@ed/kit-admin";
import { AvisoDeLaAccion } from "@/admin/armazon/AvisoDelEditor";
import { errorDe } from "@/admin/campos/errores";
import { useErroresDelEditor } from "@/admin/armazon/useErroresDelEditor";
import { useFrenarSalida } from "@/admin/armazon/useFrenarSalida";
import type { FichaDeNovedad as Ficha, Vecinas } from "@/datos/consultas/ficha-de-novedad";
import type { BorradorDeNovedad } from "@/features/novedades/contenido/novedad";
import { EncabezadoDeLaFicha } from "./EncabezadoDeLaFicha";
import { aDocumento, aFormulario, mismoDocumento, type NovedadEnElFormulario } from "./formulario";
import { FormularioDeNovedad } from "./FormularioDeNovedad";
import { PanelDeLaNovedad } from "./PanelDeLaNovedad";
import { QueCambio } from "./QueCambio";
import { SalidaDeNovedad } from "./SalidaDeNovedad";
import { SIN_RED, useGuardarNovedad } from "./useGuardarNovedad";
import { usePublicarNovedad } from "./usePublicarNovedad";
import { useSalidaDeNovedad } from "./useSalidaDeNovedad";

type Props = {
  /** La novedad; en `/nueva`, sin id. */
  ficha: Omit<Ficha, "id"> & { id: string | null };
  vecinas: Vecinas;
  materiales: readonly Opcion[];
};

/** Qué dice la casilla de la destacada: quién lo es hoy, y qué pasa si se marca esta. */
function ayudaDeLaDestacada(vecinas: Vecinas, id: string | null): string {
  if (vecinas.destacada && vecinas.destacada.id === id) return "Es la destacada del sitio: la nota de tapa de Novedades.";
  if (vecinas.destacada) return `Hoy la destacada es «${vecinas.destacada.titulo}». Al publicar esta, aquella deja de serlo: hay una sola.`;
  return "La nota de tapa de Novedades: hay una sola.";
}

/**
 * La ficha de una novedad (SPEC §6.2 de `work/novedades-y-kit/`): el
 * encabezado fijo con el estado y las acciones, el formulario y, al lado desde
 * `xl`, el panel con cómo se ve y dónde (abajo en pantallas más chicas). Lo escrito
 * vive en el navegador hasta que se guarda; «Cambios sin guardar» es el
 * documento en pantalla contra el último guardado, y frena la salida. Mientras
 * la novedad no se publicó y nadie tocó la URL, la URL sigue al título.
 */
export function FichaDeNovedad({ ficha, vecinas, materiales }: Props) {
  const [form, setForm] = useState(() => aFormulario(ficha.documento));
  const [guardado, setGuardado] = useState(() => ficha.documento);
  // Lo que está en el sitio (para «Qué cambió» y descartar), o nada si nunca se publicó.
  const [publicado, setPublicado] = useState<BorradorDeNovedad | null>(() => ficha.publicado);
  // La URL sigue al título hasta que alguien la escribe, o hasta que se publica.
  const [urlAMano, setUrlAMano] = useState(() => ficha.publicado !== null || (ficha.documento.slug !== "" && ficha.documento.slug !== desdeTexto(ficha.documento.titulo)));
  const documento = aDocumento(form);
  const haySinGuardar = !mismoDocumento(documento, guardado);
  const soltarSalida = useFrenarSalida(haySinGuardar);
  const errores = useErroresDelEditor();
  const { id, estado, setEstado, aviso, setAviso, pendiente, setPendiente, guardarDocumento } = useGuardarNovedad({
    idInicial: ficha.id,
    estadoInicial: ficha.estado,
    mostrarErrores: errores.mostrar,
  });

  function cambiar<K extends keyof NovedadEnElFormulario>(campo: K, cambio: Cambio<NovedadEnElFormulario[K]>) {
    errores.contexto.limpiar(String(campo));
    if (campo === "slug") setUrlAMano(true);
    setForm((actual) => {
      const nuevo = { ...actual };
      nuevo[campo] = resolverCambio(cambio, actual[campo]);
      if (campo === "titulo" && !urlAMano) nuevo.slug = desdeTexto(nuevo.titulo);
      return nuevo;
    });
  }

  /** Guarda lo que hay en pantalla. Da el id y el `borradorEn` que quedaron, o `false` (y ya avisó). */
  async function guardarLoQueHay() {
    const enviado = documento;
    const r = await guardarDocumento(enviado);
    if (r) setGuardado(enviado);
    return r;
  }

  const guardar = async () => {
    // Ningún botón se deshabilita para explicar algo (DESIGN.md §11): contesta.
    if (id && !haySinGuardar) return setAviso({ ok: true, detalle: "No hay cambios para guardar." });
    setPendiente("guardar");
    try {
      if (await guardarLoQueHay()) setAviso({ ok: true, detalle: estado.publicada ? "Borrador guardado. El sitio sigue mostrando lo publicado." : "Borrador guardado." });
    } catch {
      setAviso({ ok: false, detalle: SIN_RED });
    } finally {
      setPendiente(null);
    }
  };

  // Publicar y ver el borrador guardan antes lo que haya en pantalla (o crean la fila).
  const preparar = async () => (id && !haySinGuardar ? { id, borradorEn: estado.borradorEn } : guardarLoQueHay());
  const { verBorrador, publicar } = usePublicarNovedad({
    setEstado,
    setAviso,
    setPendiente,
    mostrarErrores: errores.mostrar,
    preparar,
    nadaParaPublicar: Boolean(id && estado.publicada && !estado.borradorEn && !haySinGuardar),
    alPublicarse: () => {
      setPublicado(documento);
      setUrlAMano(true);
    },
  });
  const salida = useSalidaDeNovedad({
    estado,
    setEstado,
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

  return (
    // Abajo, en el celular, el lugar de la barra fija de las acciones (64 px): así no tapa el último campo.
    <div className="space-y-8 max-lg:pb-16">
      <EncabezadoDeLaFicha
        titulo={form.titulo.trim() || "Nueva novedad"}
        id={id}
        estado={estado}
        haySinGuardar={haySinGuardar}
        pendiente={pendiente}
        aviso={<AvisoDeLaAccion aviso={aviso} alCerrar={() => setAviso(null)} alRecargar={recargar} />}
        alGuardar={guardar}
        alVerBorrador={verBorrador}
        alPublicar={publicar}
      />
      {/* Desde `xl`, el panel ocupa las dos filas de la derecha; la segunda fila se lleva el sobrante, así «Qué cambió» no se despega del formulario. */}
      <div className="grid grid-cols-1 items-start gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,48rem)_22rem] xl:grid-rows-[auto_1fr]">
        <FormularioDeNovedad
          form={form}
          cambiar={cambiar}
          errores={errores.contexto.errores}
          materiales={materiales}
          ayudaDeLaDestacada={ayudaDeLaDestacada(vecinas, id)}
          ayudaDeLaUrl={
            ficha.publicado
              ? `Así queda: /novedades/${form.slug || "…"}. Si la cambiás, al publicar la vieja (/novedades/${ficha.publicado.slug}) pasa a llevar a la nueva.`
              : `Así queda: /novedades/${form.slug || "…"}. Sigue al título hasta que la escribas vos o se publique.`
          }
        />
        <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <PanelDeLaNovedad
            form={form}
            cambiarImagen={(v) => cambiar("imagenParaRedes", v)}
            error={errorDe(errores.contexto.errores, "imagenParaRedes")}
            id={id}
            vecinas={vecinas}
            enElSitio={estado.publicada ? publicado : null}
          />
        </div>
        <div className="space-y-10">
          <QueCambio publicado={publicado} actual={documento} materiales={materiales} />
          {id ? (
            <SalidaDeNovedad
              titulo={form.titulo.trim() || "Sin título"}
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

