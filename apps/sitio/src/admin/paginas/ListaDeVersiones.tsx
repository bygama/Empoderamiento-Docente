import Link from "next/link";
import { useState } from "react";
import { Boton } from "@ed/kit-admin";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Insignia } from "@/admin/armazon/Insignia";
import { Fila, Lista } from "@/admin/armazon/Lista";
import { Momento } from "@/admin/armazon/Momento";
import { restaurarVersion } from "@/datos/acciones/versiones";
import type { VersionEnLista } from "@/datos/consultas/historial-de-paginas";
import type { NoEntro } from "@/datos/acciones/versiones-de-paginas";
import type { AccionesDePagina } from "./PantallaDeRevision";

/** Lo que dice el aviso al restaurar: qué no entró, si algo no entró, y adónde mirar antes de publicar. */
function Restaurada({ noEntraron, cambios }: { noEntraron: NoEntro[]; cambios: string }) {
  return (
    <>
      Se restauró como borrador; el sitio sigue igual.
      {noEntraron.map((n) => ` No entró «${n.parte}»: ${n.motivo}.`).join("")}{" "}
      <Link href={cambios} className="underline">
        Ver qué cambió
      </Link>
    </>
  );
}

type Props = { slug: string; versiones: readonly VersionEnLista[]; cambios: string; acciones: AccionesDePagina };

/**
 * Las últimas publicaciones de una página (SPEC §3 de `work/paginas-inicio/`),
 * en la `Lista` del armazón: la más nueva es la que está en el sitio y no se
 * restaura; las demás, «Restaurar como borrador», que pregunta si hay un
 * borrador que se reemplaza y contesta en el aviso del encabezado.
 */
export function ListaDeVersiones({ slug, versiones, cambios, acciones }: Props) {
  const [restaurando, setRestaurando] = useState<string | null>(null);
  if (versiones.length === 0) {
    return <EstadoVacio titulo="Todavía no hay versiones" texto="Cada vez que publicás, la versión queda acá: las últimas 10." />;
  }

  const restaurar = async (version: VersionEnLista) => {
    const { borradorEn } = acciones.estado;
    if (borradorEn && !window.confirm("Hay un borrador sin publicar: restaurar esta versión lo reemplaza. ¿Restaurar igual?")) return;
    setRestaurando(version.id);
    try {
      const r = await restaurarVersion({ slug, version: version.id, borradorEnVisto: borradorEn });
      if (!r.ok) {
        acciones.setAviso(r);
        return;
      }
      acciones.setEstado((e) => ({ ...e, borradorEn: r.borradorEn, borradorPor: r.borradorPor }));
      acciones.setAviso({ ok: true, detalle: <Restaurada noEntraron={r.noEntraron} cambios={cambios} /> });
    } catch {
      acciones.avisarSinRed();
    } finally {
      setRestaurando(null);
    }
  };

  return (
    <Lista>
      {versiones.map((v, i) => (
        <Fila
          key={v.id}
          principal={
            <>
              Publicada el <Momento iso={v.publicadoEn} />
            </>
          }
          detalle={`Por ${v.publicadoPor}`}
          insignias={i === 0 ? <Insignia tono="normal">En el sitio</Insignia> : null}
          accion={
            i === 0 ? null : (
              <Boton variante="secundario" disabled={restaurando !== null} aria-busy={restaurando === v.id || undefined} onClick={() => restaurar(v)}>
                {restaurando === v.id ? "Restaurando…" : "Restaurar como borrador"}
              </Boton>
            )
          }
        />
      ))}
    </Lista>
  );
}
