import { createElement, useState } from "react";
import { type AvisoDelEditor, VistaPreviaFrenada } from "@ed/kit-admin";
import { descartarCambiosDeCaso, guardarCaso, publicarCaso } from "@/datos/acciones/casos";
import { abrirVistaPreviaDeCaso } from "@/datos/acciones/vista-previa-de-contenido";
import type { EstadoDelCaso } from "@/datos/consultas/casos-del-admin";
import type { BorradorDeCaso } from "@/features/investigacion/contenido/caso";
import type { IdDeCaso } from "@/features/investigacion/contenido/modelo-de-casos";
import type { ErrorDeCampo } from "@/lib/contenido/errores";

const SIN_RED = "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo; lo que escribiste sigue en pantalla.";

/** `documento` y `haySinGuardar`: lo que hay en pantalla. Los `al…`: lo que la ficha hace cuando quedó guardado, publicado o descartado. */
type Opciones = {
  id: IdDeCaso;
  estadoInicial: EstadoDelCaso;
  mostrarErrores: (errores: ErrorDeCampo[]) => void;
  documento: BorradorDeCaso;
  haySinGuardar: boolean;
  alGuardarse: (documento: BorradorDeCaso) => void;
  alPublicarse: (documento: BorradorDeCaso) => void;
  alDescartarse: () => void;
};

/**
 * Guardar, ver el borrador, publicar y descartar desde la ficha de un caso
 * (SPEC §6 de `work/casos-aliados-fotos/`). Contestan con un aviso, nunca
 * tiran; ver y publicar guardan antes lo que hay en pantalla.
 */
export function useAccionesDelCaso(o: Opciones) {
  const [estado, setEstado] = useState(() => o.estadoInicial); // Perezoso: no es una copia del prop.
  const [aviso, setAviso] = useState<AvisoDelEditor | null>(null);
  const [pendiente, setPendiente] = useState<"guardar" | "vista-previa" | "publicar" | "descartar" | null>(null);

  /** Guarda lo que hay en pantalla si hace falta. Da el `borradorEn` que quedó, o `false` (y ya avisó). */
  async function guardarLoQueHay(): Promise<string | null | false> {
    if (!o.haySinGuardar) return estado.borradorEn;
    const r = await guardarCaso({ id: o.id, contenido: o.documento, borradorEnVisto: estado.borradorEn });
    if (!r.ok) {
      if (r.errores?.length) o.mostrarErrores(r.errores);
      setAviso(r);
      return false;
    }
    setEstado((e) => ({ ...e, borradorEn: r.borradorEn, borradorPor: r.borradorPor }));
    o.alGuardarse(o.documento);
    return r.borradorEn;
  }

  /** Corre una acción con su pendiente; sin red, lo dice. */
  async function correr(cual: NonNullable<typeof pendiente>, hacer: () => Promise<void>) {
    setPendiente(cual);
    await hacer()
      .catch(() => setAviso({ ok: false, detalle: SIN_RED }))
      .finally(() => setPendiente(null));
  }

  const guardar = () =>
    correr("guardar", async () => {
      if (!o.haySinGuardar) return setAviso({ ok: true, detalle: "No hay cambios para guardar." });
      if ((await guardarLoQueHay()) !== false) setAviso({ ok: true, detalle: "Borrador guardado. El sitio sigue mostrando lo publicado." });
    });

  const verBorrador = () => {
    // Se abre en el gesto del clic, antes de todo `await` (después el navegador la bloquea).
    const pestana = window.open("", "_blank");
    return correr("vista-previa", async () => {
      const r = (await guardarLoQueHay()) === false ? null : await abrirVistaPreviaDeCaso(o.id);
      if (!r?.ok) {
        pestana?.close();
        if (r) setAviso(r);
        return;
      }
      if (pestana) pestana.location.href = r.url;
      setAviso({ ok: true, detalle: pestana ? "La vista previa se abrió en otra pestaña." : createElement(VistaPreviaFrenada, { url: r.url }) });
    });
  };

  const publicar = () =>
    correr("publicar", async () => {
      const borradorEn = await guardarLoQueHay();
      if (borradorEn === false) return;
      const r = await publicarCaso({ id: o.id, borradorEnVisto: borradorEn });
      if (!r.ok && r.errores?.length) o.mostrarErrores(r.errores);
      setAviso(r);
      if (!r.ok) return;
      setEstado({ publicadoEn: r.publicadoEn, publicadoPor: r.publicadoPor, borradorEn: null, borradorPor: null });
      o.alPublicarse(o.documento);
    });

  const descartar = () =>
    correr("descartar", async () => {
      const r = await descartarCambiosDeCaso({ id: o.id, borradorEnVisto: estado.borradorEn });
      setAviso(r);
      if (!r.ok) return;
      setEstado((e) => ({ ...e, borradorEn: null, borradorPor: null }));
      o.alDescartarse();
    });

  return { estado, aviso, setAviso, pendiente, guardar, verBorrador, publicar, descartar };
}
