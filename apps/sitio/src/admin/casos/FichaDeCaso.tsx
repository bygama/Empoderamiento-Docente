"use client";

import { useState } from "react";
import { AvisoDeLaAccion, type Cambio, resolverCambio, useFrenarSalida } from "@ed/kit-admin";
import { QueCambioPlegado } from "@/admin/armazon/QueCambioPlegado";
import { useErroresDelEditor } from "@/admin/armazon/useErroresDelEditor";
import { errorDe } from "@/admin/campos/errores";
import type { FichaDeCaso as Ficha } from "@/datos/consultas/casos-del-admin";
import type { BorradorDeCaso } from "@/features/investigacion/contenido/caso";
import { nombreDelCaso } from "@/features/investigacion/contenido/modelo-de-casos";
import { igual } from "@/lib/contenido/comparar";
import { cambiosDelCaso } from "./cambios";
import { DescartarElCaso } from "./DescartarElCaso";
import { EncabezadoDelCaso } from "./EncabezadoDelCaso";
import { CasoProvisional, ElCaso } from "./formulario-del-caso/ElCaso";
import { ElExpediente } from "./formulario-del-caso/ElExpediente";
import { LasListas } from "./formulario-del-caso/LasListas";
import { aDocumento, aFormulario, type CasoEnElFormulario } from "./formulario";
import { SeVeElCaso } from "./SeVeElCaso";
import { useAccionesDelCaso } from "./useAccionesDelCaso";

/**
 * La ficha de un caso (SPEC §7.1 de `work/casos-aliados-fotos/`), con el molde
 * de la de una novedad (DESIGN.md §11, «Ficha de una entidad»): el encabezado
 * fijo, el formulario por bloques y, al lado desde `xl`, «Se ve en». Lo
 * escrito vive en el navegador hasta que se guarda; «Cambios sin guardar» es
 * el documento en pantalla contra el último guardado, y frena la salida.
 */
export function FichaDeCaso({ ficha }: { ficha: Ficha }) {
  const [form, setForm] = useState(() => aFormulario(ficha.documento));
  const [guardado, setGuardado] = useState<BorradorDeCaso>(() => ficha.documento);
  const [publicado, setPublicado] = useState<BorradorDeCaso>(() => ficha.publicado);
  const documento = aDocumento(form);
  const haySinGuardar = !igual(documento, guardado);
  const soltarSalida = useFrenarSalida(haySinGuardar);
  const errores = useErroresDelEditor();
  const acciones = useAccionesDelCaso({
    id: ficha.id,
    estadoInicial: ficha.estado,
    mostrarErrores: errores.mostrar,
    documento,
    haySinGuardar,
    alGuardarse: setGuardado,
    alPublicarse: (d) => {
      setGuardado(d);
      setPublicado(d);
    },
    alDescartarse: () => {
      setForm(aFormulario(publicado));
      setGuardado(publicado);
    },
  });

  function cambiar<K extends keyof CasoEnElFormulario>(campo: K, cambio: Cambio<CasoEnElFormulario[K]>) {
    errores.contexto.limpiar(String(campo));
    setForm((actual) => ({ ...actual, [campo]: resolverCambio(cambio, actual[campo]) }));
  }

  const recargar = () => {
    if (haySinGuardar && !window.confirm("Recargar tira lo que escribiste sin guardar. ¿Recargar igual?")) return;
    soltarSalida();
    window.location.reload();
  };
  const error = (camino: string) => errorDe(errores.contexto.errores, camino);
  const bloque = { form, cambiar, error };

  return (
    // Abajo, en el celular, el lugar de la barra fija de las acciones (64 px): así no tapa el último campo.
    <div className="space-y-8 max-lg:pb-16">
      <EncabezadoDelCaso
        titulo={nombreDelCaso(ficha.id)}
        estado={acciones.estado}
        haySinGuardar={haySinGuardar}
        pendiente={acciones.pendiente}
        aviso={<AvisoDeLaAccion aviso={acciones.aviso} alCerrar={() => acciones.setAviso(null)} alRecargar={recargar} />}
        alGuardar={acciones.guardar}
        alVerBorrador={acciones.verBorrador}
        alPublicar={acciones.publicar}
      />
      {/* `grid-cols-1` es `minmax(0, 1fr)`: sin eso, lo que no se corta (un título con `truncate`) ensancha la ficha en el celular. */}
      <div className="grid grid-cols-1 items-start gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,48rem)_22rem] xl:grid-rows-[auto_1fr]">
        <div className="space-y-10">
          <ElCaso
            {...bloque}
            ayudaDeLaUrl={`El ancla del caso: /investigacion#${form.slug || "…"}. Si la cambiás, los links viejos con #${publicado.slug} dejan de abrirlo; al publicar, /investigacion/casos/${publicado.slug} pasa a llevar a la nueva.`}
          />
          <ElExpediente {...bloque} />
          <LasListas {...bloque} />
          <CasoProvisional {...bloque} />
        </div>
        <div className="xl:col-start-2 xl:row-span-2 xl:row-start-1">
          <SeVeElCaso id={ficha.id} numero={ficha.numero} slug={form.slug} slugPublicado={publicado.slug} />
        </div>
        <div className="space-y-10">
          <QueCambioPlegado cambios={cambiosDelCaso(publicado, documento)} />
          {acciones.estado.borradorEn ? (
            <DescartarElCaso corriendo={acciones.pendiente !== null} descartando={acciones.pendiente === "descartar"} alDescartar={acciones.descartar} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
