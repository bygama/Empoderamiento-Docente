import type { Metadata } from "next";
import { BotonEnlace } from "@/admin/armazon/Boton";
import { Aviso } from "@/admin/armazon/Campos";
import { EstadoVacio } from "@/admin/armazon/EstadoVacio";
import { Filtro } from "@/admin/armazon/Filtro";
import { EncabezadoDeContenido } from "@/admin/contenido/EncabezadoDeContenido";
import { GrillaDeFotos } from "@/admin/fotos/GrillaDeFotos";
import { FILTROS_DE_FOTOS, grillaDeFotos, type FiltroDeFotos } from "@/datos/consultas/fotos";

export const metadata: Metadata = { title: "Fotos" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const ETIQUETA: Record<FiltroDeFotos, string> = { todas: "Todas", "sin-alt": "Sin texto alternativo", "sin-usar": "Sin usar" };

const hrefDe = (filtro: FiltroDeFotos) => (filtro === "todas" ? "/admin/contenido/fotos" : `/admin/contenido/fotos?filtro=${filtro}`);

/** Qué dice la grilla sin fotos: sin ninguna, o con un filtro que no deja ninguna. */
const VACIO: Record<FiltroDeFotos, { titulo: string; texto: string }> = {
  todas: { titulo: "Todavía no hay fotos.", texto: "Las que subas desde acá o desde el campo de foto de un formulario quedan en la biblioteca, listas para elegir." },
  "sin-alt": { titulo: "Todas tienen texto alternativo.", texto: "Cuando una no tiene, aparece acá: el texto alternativo es lo que lee un lector de pantalla." },
  "sin-usar": { titulo: "Todas se usan en algún lugar.", texto: "Una foto que no está en ninguna página, novedad, caso ni aliado aparece acá, y se puede borrar." },
};

// Contenido › Fotos (SPEC §7.3 de `work/casos-aliados-fotos/`): la
// biblioteca, con el filtro en `?filtro=` y «Subir foto» de primario. De los
// tres roles: la guarda del layout de Contenido alcanza.
export default async function Fotos({ searchParams }: Props) {
  const { filtro: pedido, borrada } = await searchParams;
  const filtro = FILTROS_DE_FOTOS.find((f) => f === pedido) ?? "todas";
  const { fotos, cuentas } = await grillaDeFotos(filtro);
  const subir = (
    <BotonEnlace variante="primario" href="/admin/contenido/fotos/subir">
      Subir foto
    </BotonEnlace>
  );
  const hayFotos = cuentas.todas > 0;
  return (
    <div className="space-y-6">
      <EncabezadoDeContenido
        detalle="Todas las fotos del sitio, con su texto alternativo y dónde se usa cada una."
        acciones={hayFotos ? subir : undefined}
        avisos={borrada === "1" ? <Aviso tono="bien">Se borró la foto de la biblioteca.</Aviso> : undefined}
      />
      {hayFotos ? (
        <Filtro
          etiqueta="Qué fotos"
          activa={hrefDe(filtro)}
          opciones={FILTROS_DE_FOTOS.map((f) => ({
            href: hrefDe(f),
            etiqueta: ETIQUETA[f],
            numero: f === "sin-alt" ? { cuantos: cuentas["sin-alt"], que: "sin texto alternativo" } : undefined,
          }))}
        />
      ) : null}
      {fotos.length ? <GrillaDeFotos fotos={fotos} /> : <EstadoVacio {...VACIO[filtro]} accion={hayFotos ? undefined : subir} />}
    </div>
  );
}
