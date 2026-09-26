"use client";

import { useRouter } from "next/navigation";
import type { Pestana } from "@/admin/armazon/Pestanas";
import type { PaginaEnRevision } from "@/datos/consultas/historial-de-paginas";
import { AvisoDeLaPagina } from "./AvisoDeLaPagina";
import { EncabezadoDelEditor } from "./EncabezadoDelEditor";
import { useAccionesDePagina } from "./useAccionesDePagina";

type Props = {
  pagina: PaginaEnRevision;
  pestanas: readonly Pestana[];
  /** «Qué cambió» publica desde acá (Vista previa · Publicar · Descartar); «Versiones» no lleva acciones. */
  conAcciones: boolean;
  children: React.ReactNode;
};

/**
 * Las pestañas de una página que no editan campos (SPEC §7 de
 * `work/paginas-inicio/`): el mismo encabezado del editor, con sus pestañas,
 * y lo que la ruta dibuja abajo. Publicar vuelve a pedir la pantalla al
 * servidor, así «Qué cambió» queda vacía.
 */
export function PantallaDeRevision({ pagina, pestanas, conAcciones, children }: Props) {
  const router = useRouter();
  const acciones = useAccionesDePagina({ slug: pagina.slug, estadoInicial: pagina.estado, despuesDePublicar: () => router.refresh() });
  return (
    // Abajo, en el celular, el lugar de la barra fija de las acciones (64 px).
    <div className="space-y-8 max-lg:pb-16">
      <EncabezadoDelEditor
        nombre={pagina.nombre}
        pestanas={pestanas}
        estado={acciones.estado}
        haySinGuardar={false}
        pendiente={acciones.pendiente}
        aviso={<AvisoDeLaPagina aviso={acciones.aviso} alCerrar={() => acciones.setAviso(null)} alRecargar={acciones.recargar} />}
        alVerBorrador={conAcciones ? () => acciones.verBorrador() : undefined}
        alPublicar={conAcciones ? () => acciones.publicar() : undefined}
        alDescartar={conAcciones ? acciones.descartar : undefined}
      />
      {children}
    </div>
  );
}
