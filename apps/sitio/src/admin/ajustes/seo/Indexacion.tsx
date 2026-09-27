import Link from "next/link";
import { EstadoVacio, Insignia, Tabla } from "@ed/kit-admin";
import { Momento } from "@/admin/armazon/Momento";
import type { Indexacion as LaIndexacion } from "@/datos/consultas/indexacion";
import { coberturaEnCastellano, insigniaDeIndexacion } from "./cobertura";

const COLUMNAS = [{ etiqueta: "Página" }, { etiqueta: "En Google" }, { etiqueta: "Qué dice Google" }, { etiqueta: "Último paso de Google" }];

const LINK = "rounded-sm text-azul-medio underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio";

/** Cómo salió la última revisión, en una línea: cuándo, y si falló, por qué. */
function UltimaRevision({ ultima }: { ultima: LaIndexacion["ultima"] }) {
  if (!ultima) return <p className="text-admin-meta text-gris-texto">Todavía no corrió la revisión: corre sola una vez por día.</p>;
  return (
    <p className={`text-admin-meta ${ultima.ok ? "text-gris-texto" : "font-medium text-rojo-error"}`}>
      Última revisión: <Momento iso={ultima.corridaEn.toISOString()} />. {ultima.ok ? ultima.detalle : `Falló: ${ultima.detalle}`}
    </p>
  );
}

/**
 * Si cada página del sitemap está en Google, según Search Console (work/
 * ajustes/SPEC.md §5.3): de la copia que deja la tarea del cron, nunca de la
 * API en el render. Sin conectar, dice dónde se ve qué falta.
 */
export function Indexacion({ indexacion }: { indexacion: LaIndexacion }) {
  if (!indexacion.conectado) {
    return (
      <div className="space-y-3">
        <EstadoVacio
          titulo="Search Console no está conectado"
          texto="La revisión usa la misma cuenta de servicio que Métricas › Búsquedas. Mientras no esté, no se sabe qué páginas tiene Google."
        />
        <p className="text-admin-meta">
          <Link href="/admin/ajustes/conexiones" className={LINK}>
            Ver qué falta en Conexiones
          </Link>
        </p>
      </div>
    );
  }
  const filas = indexacion.filas.map((f) => {
    const insignia = insigniaDeIndexacion(f.veredicto);
    return {
      clave: f.ruta,
      celdas: [
        <span key="ruta" className="break-all">{f.ruta}</span>,
        <Insignia key="insignia" tono={insignia.tono}>{insignia.texto}</Insignia>,
        f.cobertura ? coberturaEnCastellano(f.cobertura) : <span key="nada" className="text-gris-texto">—</span>,
        f.ultimoRastreo ? <Momento key="rastreo" iso={f.ultimoRastreo.toISOString()} dia /> : <span key="nunca" className="text-gris-texto">Nunca</span>,
      ],
    };
  });
  return (
    <div className="space-y-3">
      <UltimaRevision ultima={indexacion.ultima} />
      <Tabla leyenda="Si cada página del sitio está en Google" columnas={COLUMNAS} filas={filas} />
    </div>
  );
}
