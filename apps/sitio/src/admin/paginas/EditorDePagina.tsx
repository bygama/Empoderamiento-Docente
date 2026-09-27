"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { resolverCambio, type Cambio } from "@ed/kit-admin";
import { ContextoDeErrores } from "@/admin/campos/errores";
import type { Pestana } from "@/admin/armazon/Pestanas";
import { guardarBorrador } from "@/datos/acciones/paginas";
import type { PaginaParaEditar } from "@/datos/consultas/editor-de-paginas";
import { resumenDeErrores, type ErrorDeCampo } from "@/lib/contenido/errores";
import { AvisoDeLaPagina } from "./AvisoDeLaPagina";
import { EncabezadoDelEditor } from "./EncabezadoDelEditor";
import { Seccion } from "./Seccion";
import { useAccionesDePagina } from "./useAccionesDePagina";
import { useErroresDelEditor } from "./useErroresDelEditor";
import { useFrenarSalida } from "./useFrenarSalida";

type Props = {
  pagina: PaginaParaEditar;
  pestanas: readonly Pestana[];
  /** Lo que va después de las secciones, con lo que hay en pantalla (la vista previa del SEO). */
  aparte?: (contenidos: Readonly<Record<string, unknown>>) => ReactNode;
};

/**
 * El editor de una pestaña de una página (Secciones o SEO): el encabezado fijo
 * con el estado y las acciones, y sus partes en el orden del scroll (SPEC §2).
 * El contenido vive en el estado del navegador hasta que se guarda; cada
 * guardado encadena el `borradorEn` que devolvió el anterior, así el chequeo
 * de cambios cruzados vale sección tras sección. Publicar y ver el borrador
 * guardan primero lo que haya sin guardar (`preparar`): nadie publica algo
 * distinto de lo que tiene en pantalla. Las acciones que no escriben un
 * campo viven en `useAccionesDePagina`, que comparten las otras pestañas.
 */
export function EditorDePagina({ pagina, pestanas, aparte }: Props) {
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
  const haySinGuardar = pagina.secciones.some((s) => contenidos[s.clave] !== confirmados[s.clave]);
  const soltarSalida = useFrenarSalida(haySinGuardar);
  const errores = useErroresDelEditor();
  // El remount real cuando cambia la página lo hace el `key` de la ruta [slug].
  const acciones = useAccionesDePagina({ slug: pagina.slug, estadoInicial: pagina.estado, haySinGuardar, soltarSalida });
  const { estado, setEstado, setAviso, setPendiente } = acciones;

  const cambiar = (clave: string, cambio: Cambio<unknown>) => {
    setContenidos((c) => ({ ...c, [clave]: resolverCambio(cambio, c[clave]) }));
  };

  /**
   * Guarda las secciones con cambios, una por una. Devuelve el `borradorEn`
   * que quedó —lo que la próxima escritura tiene que traer—, o `false` si
   * alguna falló (y ya avisó). Una sección que no pasa su esquema no frena a
   * las demás: se guardan las que pasan y se marcan todos los campos que no;
   * un choque o un error del servidor sí cortan ahí.
   */
  async function guardarTodo(): Promise<string | null | false> {
    let visto = estado.borradorEn;
    const noPasan: ErrorDeCampo[] = [];
    for (const s of pagina.secciones) {
      const valorEnviado = contenidosRef.current[s.clave];
      if (valorEnviado === confirmados[s.clave]) continue;
      const r = await guardarBorrador({ slug: pagina.slug, seccion: s.clave, contenido: valorEnviado, borradorEnVisto: visto });
      if (!r.ok && r.errores) {
        noPasan.push(...r.errores);
        continue;
      }
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
    if (noPasan.length > 0) {
      // Cada campo que no pasa muestra su error, y el foco va al primero.
      setAviso({ ok: false, detalle: resumenDeErrores(noPasan) });
      errores.mostrar(noPasan);
      return false;
    }
    return visto;
  }

  const guardar = async () => {
    // Ningún botón se deshabilita para explicar algo (DESIGN.md §11): contesta.
    if (!haySinGuardar) {
      setAviso({ ok: true, detalle: "No hay cambios para guardar." });
      return;
    }
    setPendiente("guardar");
    try {
      if ((await guardarTodo()) !== false) setAviso({ ok: true, detalle: "Borrador guardado. El sitio sigue mostrando lo publicado." });
    } catch {
      acciones.avisarSinRed();
    } finally {
      setPendiente(null);
    }
  };

  // Publicar y ver el borrador guardan antes lo que haya en pantalla.
  const preparar = haySinGuardar ? guardarTodo : undefined;

  return (
    // Abajo, en el celular, el lugar de la barra fija de las acciones (64 px): así no tapa el último campo.
    <div className="space-y-6 max-lg:pb-16">
      <EncabezadoDelEditor
        nombre={pagina.nombre}
        pestanas={pestanas}
        estado={estado}
        haySinGuardar={haySinGuardar}
        pendiente={acciones.pendiente}
        aviso={<AvisoDeLaPagina aviso={acciones.aviso} alCerrar={() => setAviso(null)} alRecargar={acciones.recargar} />}
        alGuardar={guardar}
        alVerBorrador={() => acciones.verBorrador(preparar)}
        alPublicar={() => acciones.publicar(preparar)}
        alDescartar={acciones.descartar}
      />
      <ContextoDeErrores value={errores.contexto}>
        {pagina.secciones.map((s) => (
          <Seccion
            key={s.clave}
            clave={s.clave}
            nombre={s.nombre}
            descripcion={s.descripcion}
            valor={contenidos[s.clave]}
            alCambiar={(v) => cambiar(s.clave, v)}
            compartida={s.compartida}
            pagina={pagina.nombre}
          />
        ))}
      </ContextoDeErrores>
      {aparte?.(contenidos)}
    </div>
  );
}
