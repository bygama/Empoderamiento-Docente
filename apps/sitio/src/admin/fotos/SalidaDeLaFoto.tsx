"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Aviso, Boton } from "@ed/kit-admin";
import { Confirmacion } from "@/admin/armazon/Confirmacion";
import { FilaDeAccion } from "@/admin/armazon/FilaDeAccion";
import { borrarFoto } from "@/datos/acciones/fotos";
import { noSeReemplazaElLogo } from "@/features/aliados/contenido/autorizacion";
import { ReemplazarElArchivo } from "./salida-de-la-foto/ReemplazarElArchivo";

const SIN_RED = "No hubo respuesta del servidor. Fijate la conexión y probá de nuevo.";

type Props = {
  id: string;
  usos: number;
  /** Cuántos de esos usos son contenido del código: ahí no se reemplaza. */
  enElCodigo: number;
  delRepositorio: boolean;
  /** El aliado del que es el logo autorizado: entonces no se reemplaza desde acá. */
  logoAutorizadoDe: string | null;
};

/** Qué pasa si se borra: que no se puede mientras se use, o qué se lleva. */
function siSeBorra(usos: number, delRepositorio: boolean): string {
  if (usos) return `Se usa en ${usos === 1 ? "un lugar" : `${usos} lugares`}: para borrarla, sacala primero de ahí (arriba, en «Se usa en»).`;
  if (delRepositorio) return "Sale de la biblioteca. El archivo es del repositorio: queda en el sitio hasta que se saque del código.";
  return "Se borra para siempre, con su archivo.";
}

/**
 * Qué pasa si se reemplaza el archivo. Si la usa contenido del código (una
 * sección que nunca se publicó desde el admin), lo dice antes: ahí no se
 * puede reemplazar, y la acción lo contestaría igual.
 */
function siSeReemplaza(usos: number, enElCodigo: number, logoAutorizadoDe: string | null): string {
  if (logoAutorizadoDe) return noSeReemplazaElLogo(logoAutorizadoDe);
  if (enElCodigo) {
    return `${enElCodigo === 1 ? "Un lugar que la usa todavía muestra" : `${enElCodigo} lugares que la usan todavía muestran`} el contenido del código, y ahí no se puede cambiar desde acá: cambiala desde el editor de esa página, o publicá la página y volvé.`;
  }
  const lugares = usos === 1 ? "El lugar que la usa pasa a mostrar el archivo nuevo." : `Los ${usos} lugares que la usan pasan a mostrar el archivo nuevo.`;
  return `${usos ? lugares : "Cambia el archivo."} La foto sigue siendo la misma: su texto alternativo y sus lugares no cambian. jpg, png o webp de hasta 4 MB.`;
}

/**
 * Reemplazar el archivo y borrar la foto (SPEC §7.3 de
 * `work/casos-aliados-fotos/`), al pie de la ficha como «Deshacer o sacar del
 * sitio» en una novedad: cada una dice qué pasa antes de tocarla. Borrar
 * confirma en el lugar; si la foto se usa, en lugar del botón dice dónde
 * sacarla primero.
 */
export function SalidaDeLaFoto({ id, usos, enElCodigo, delRepositorio, logoAutorizadoDe }: Props) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [aviso, setAviso] = useState<{ ok: boolean; detalle: string } | null>(null);
  const [pendiente, empezar] = useTransition();

  const borrar = () =>
    empezar(async () => {
      try {
        const r = await borrarFoto({ id });
        if (r.ok) router.push("/admin/contenido/fotos?borrada=1");
        else setAviso(r);
      } catch {
        setAviso({ ok: false, detalle: SIN_RED });
      }
    });

  return (
    <section aria-labelledby="bloque-salida" className="space-y-2">
      <h2 id="bloque-salida" className="border-b border-azul-claro/60 pb-2 font-display text-admin-seccion font-bold">
        Reemplazar o borrar
      </h2>
      {aviso ? (
        <Aviso tono={aviso.ok ? "bien" : "error"} alCerrar={() => setAviso(null)}>
          {aviso.detalle}
        </Aviso>
      ) : null}
      <ul className="divide-y divide-azul-claro/60">
        <FilaDeAccion
          titulo="Reemplazar el archivo"
          consecuencia={siSeReemplaza(usos, enElCodigo, logoAutorizadoDe)}
        >
          {/* El logo autorizado de un aliado no se reemplaza: la frase dice cómo cambiarlo. */}
          {logoAutorizadoDe ? null : <ReemplazarElArchivo id={id} alAvisar={setAviso} sinRed={SIN_RED} />}
        </FilaDeAccion>
        <FilaDeAccion titulo="Borrar" consecuencia={siSeBorra(usos, delRepositorio)}>
          {/* Usada, no hay botón: la frase dice dónde sacarla primero. */}
          {usos === 0 && confirmando ? (
            <Confirmacion
              pregunta="¿Borrar la foto para siempre? No se puede deshacer."
              confirmar="Sí, borrar"
              corriendo={pendiente ? "Borrando…" : null}
              alConfirmar={borrar}
              alCancelar={() => setConfirmando(false)}
            />
          ) : null}
          {usos === 0 && !confirmando ? (
            <Boton variante="destructivo" disabled={pendiente} onClick={() => setConfirmando(true)}>
              Borrar la foto
            </Boton>
          ) : null}
        </FilaDeAccion>
      </ul>
    </section>
  );
}
