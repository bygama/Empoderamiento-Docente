"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { resolverCambio, type Cambio } from "@/admin/campos/cambio";
import { Aviso } from "@/admin/armazon/Campos";
import { descartarBorrador, guardarBorrador, publicar } from "@/datos/acciones/paginas";
import { abrirVistaPrevia } from "@/datos/acciones/vista-previa";
import type { PaginaParaEditar } from "@/datos/consultas/editor-de-paginas";
import { EncabezadoDelEditor, type EstadoPendiente } from "./EncabezadoDelEditor";
import { Seccion } from "./Seccion";

type AvisoDelEditor = { ok: boolean; detalle: ReactNode };

const SIN_RED = "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo; lo que escribiste sigue en pantalla.";

/**
 * El editor de una página: el encabezado fijo con el estado y las acciones, y
 * las secciones en el orden del scroll (SPEC §2). El contenido vive en el estado del navegador
 * hasta que se guarda; cada guardado encadena el `borradorEn` que devolvió el
 * anterior, así el chequeo de cambios cruzados vale sección tras sección.
 * Publicar y ver el borrador guardan primero lo que haya sin guardar: nadie
 * publica algo distinto de lo que tiene en pantalla.
 *
 * Las cuatro acciones repiten a mano `setPendiente`/try/catch/finally: un
 * `correr(fn)` compartido es la forma que react-doctor marca como updater
 * impuro (no-impure-state-updater), sin importar qué haga el callback.
 */
export function EditorDePagina({ pagina }: { pagina: PaginaParaEditar }) {
  const [contenidos, setContenidos] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(pagina.secciones.map((s) => [s.clave, s.contenido])),
  );
  // Lo último que se confirmó guardado por sección: arranca igual que
  // `contenidos`, porque eso es justo lo que ya está guardado (borrador o
  // publicado). Comparar contra esto en vez de un booleano "sucio" es lo que
  // evita que una edición hecha DESPUÉS de mandar el pedido (mientras viaja)
  // quede marcada como guardada sin estarlo.
  const [confirmados, setConfirmados] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(pagina.secciones.map((s) => [s.clave, s.contenido])),
  );
  // El valor más fresco de `contenidos`, para leerlo adentro de
  // `guardarTodo` después de un `await`: la variable de la clausura queda
  // fija en el valor que tenía cuando arrancó la función, y si el guardado
  // de una sección tarda, otra sección puede haber cambiado mientras tanto.
  const contenidosRef = useRef(contenidos);
  useEffect(() => {
    contenidosRef.current = contenidos;
  }, [contenidos]);
  // Perezoso como `contenidos`: son del mismo prop y así react-doctor no lo lee
  // como un valor que se copia una vez y queda viejo (no-derived-useState). El
  // remount real cuando cambia la página lo hace el `key` de la ruta [slug].
  const [estado, setEstado] = useState(() => pagina.estado);
  const [aviso, setAviso] = useState<AvisoDelEditor | null>(null);
  const [pendiente, setPendiente] = useState<EstadoPendiente>(null);
  const haySinGuardar = pagina.secciones.some((s) => contenidos[s.clave] !== confirmados[s.clave]);

  const cambiar = (clave: string, cambio: Cambio<unknown>) => {
    setContenidos((c) => ({ ...c, [clave]: resolverCambio(cambio, c[clave]) }));
  };

  /** Guarda las secciones con cambios, una por una. Devuelve false si alguna falló (y ya avisó). */
  async function guardarTodo(): Promise<boolean> {
    let visto = estado.borradorEn;
    for (const s of pagina.secciones) {
      const valorEnviado = contenidosRef.current[s.clave];
      if (valorEnviado === confirmados[s.clave]) continue;
      const r = await guardarBorrador({ slug: pagina.slug, seccion: s.clave, contenido: valorEnviado, borradorEnVisto: visto });
      if (!r.ok) {
        setAviso(r);
        return false;
      }
      visto = r.borradorEn;
      setConfirmados((c) => ({ ...c, [s.clave]: valorEnviado }));
      // Adentro del loop, no solo al final: si una sección más adelante
      // falla, las que ya se guardaron no quedan con un `borradorEn` viejo
      // que el próximo guardado rechazaría como conflicto. Lee de `r` (const
      // nuevo en cada vuelta), no de una variable compartida entre vueltas:
      // así un `setEstado` que React todavía no llamó nunca lee el valor de
      // otra sección.
      setEstado((e) => ({ ...e, borradorEn: r.borradorEn, borradorPor: r.borradorPor }));
    }
    return true;
  }

  /** Sin red o servidor caído: un aviso, nunca una excepción que se lleve puesto el editor. */
  function avisarSinRed() {
    setAviso({ ok: false, detalle: SIN_RED });
  }

  const guardar = async () => {
    // Ningún botón se deshabilita para explicar algo (DESIGN.md §11): contesta.
    if (!haySinGuardar) {
      setAviso({ ok: true, detalle: "No hay cambios para guardar." });
      return;
    }
    setPendiente("guardar");
    try {
      if (await guardarTodo()) setAviso({ ok: true, detalle: "Borrador guardado. El sitio sigue mostrando lo publicado." });
    } catch {
      avisarSinRed();
    } finally {
      setPendiente(null);
    }
  };

  const verBorrador = async () => {
    // Se abre en el gesto del clic, antes de cualquier `await` (después, el
    // navegador la bloquea). Sin "noopener": con eso puesto, `window.open`
    // devuelve `null` siempre y no se puede distinguir un bloqueo de un éxito.
    const pestana = window.open("", "_blank");
    setPendiente("vista-previa");
    try {
      if (haySinGuardar && !(await guardarTodo())) {
        pestana?.close();
        return;
      }
      const r = await abrirVistaPrevia(pagina.slug);
      if (!r.ok) {
        pestana?.close();
        setAviso(r);
        return;
      }
      if (pestana) {
        pestana.location.href = r.url;
        setAviso({ ok: true, detalle: "La vista previa se abrió en otra pestaña." });
      } else {
        setAviso({
          ok: true,
          detalle: (
            <>
              El navegador frenó la pestaña nueva:{" "}
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">
                abrí la vista previa desde acá
              </a>
              .
            </>
          ),
        });
      }
    } catch {
      pestana?.close();
      avisarSinRed();
    } finally {
      setPendiente(null);
    }
  };

  const publicarAhora = async () => {
    if (!estado.borradorEn && !haySinGuardar) {
      setAviso({ ok: true, detalle: "La página ya está publicada así." });
      return;
    }
    setPendiente("publicar");
    try {
      if (haySinGuardar && !(await guardarTodo())) return;
      const r = await publicar(pagina.slug);
      setAviso(r);
      if (r.ok) setEstado({ borradorEn: null, borradorPor: null, publicadoEn: r.publicadoEn, publicadoPor: r.publicadoPor });
    } catch {
      avisarSinRed();
    } finally {
      setPendiente(null);
    }
  };

  const descartar = async () => {
    if (!window.confirm("¿Descartar los cambios sin publicar? La página vuelve a lo que está publicado.")) return;
    setPendiente("descartar");
    try {
      const r = await descartarBorrador(pagina.slug);
      if (!r.ok) {
        setAviso(r);
        return;
      }
      // Recargar es lo más simple para volver a lo publicado: el editor se arma de nuevo desde el servidor.
      window.location.reload();
    } catch {
      avisarSinRed();
    } finally {
      setPendiente(null);
    }
  };

  return (
    <div className="space-y-6">
      <EncabezadoDelEditor
        nombre={pagina.nombre}
        estado={estado}
        haySinGuardar={haySinGuardar}
        pendiente={pendiente}
        aviso={
          aviso ? (
            <Aviso tono={aviso.ok ? "bien" : "error"} alCerrar={() => setAviso(null)}>
              {aviso.detalle}
            </Aviso>
          ) : null
        }
        alGuardar={guardar}
        alVerBorrador={verBorrador}
        alPublicar={publicarAhora}
        alDescartar={descartar}
      />
      {pagina.secciones.map((s) => (
        <Seccion key={s.clave} clave={s.clave} nombre={s.nombre} descripcion={s.descripcion} valor={contenidos[s.clave]} alCambiar={(v) => cambiar(s.clave, v)} />
      ))}
    </div>
  );
}
