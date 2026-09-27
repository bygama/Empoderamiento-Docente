import { Apartado, Encabezado } from "@ed/kit-admin";
import { RUTAS_DE_LA_APP } from "@/config/rutas";
import type { Indexacion as LaIndexacion } from "@/datos/consultas/indexacion";
import type { FilaDeRedireccion } from "@/datos/consultas/redirecciones";
import { porQueNoSeAplicaria } from "@/lib/seo/redirecciones";
import { VOLVER_A_AJUSTES } from "../pantallas";
import { FormularioDeRedireccion } from "./FormularioDeRedireccion";
import { Indexacion } from "./Indexacion";
import { TablaDeRedirecciones } from "./TablaDeRedirecciones";

type Props = { redirecciones: FilaDeRedireccion[]; indexacion: LaIndexacion; rutas: readonly string[]; cvAbierto: boolean };

const LINK = "rounded-sm text-azul-medio underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-medio";

/**
 * Ajustes › SEO (work/ajustes/SPEC.md §2.3): tres apartados que no dependen
 * uno del otro, así que ninguno es el primario de la pantalla. El SEO de cada
 * página y de cada novedad está en su editor, no acá.
 */
export function PantallaDeSeo({ redirecciones, indexacion, rutas, cvAbierto }: Props) {
  // Una que el sitio tapó después (una novedad publicada con ese slug) sigue en la tabla, pero no se aplica.
  const filas = redirecciones.map((r) => ({
    ...r,
    creadaEn: r.creadaEn.toISOString(),
    seAplica: !porQueNoSeAplicaria(r.desde, { rutas, declaradas: RUTAS_DE_LA_APP }),
  }));
  return (
    <>
      <Encabezado volver={VOLVER_A_AJUSTES} titulo="SEO" detalle="Lo que ayuda a que Google encuentre el sitio. El SEO de cada página está en su editor." />
      <div>
        <Apartado
          id="redirecciones"
          titulo="Redirecciones"
          descripcion="Llevan un link viejo a la página de ahora, con un 308. Las automáticas las escribe el sitio cuando cambia la URL de una novedad, y no se borran desde acá: romperían los links viejos."
        >
          <div className="space-y-8">
            <TablaDeRedirecciones redirecciones={filas} />
            <FormularioDeRedireccion rutas={rutas} />
          </div>
        </Apartado>
        <Apartado
          id="indexacion"
          titulo="Indexación en Google"
          descripcion="Si cada página del sitemap está en el índice de Google. Se revisa sola una vez por día; los datos de Google llegan con días de atraso."
        >
          <Indexacion indexacion={indexacion} />
        </Apartado>
        <Apartado id="sitemap" titulo="Sitemap" descripcion="La lista de páginas que Google lee para encontrarlas. La arma el sitio solo con las que existen.">
          <div className="max-w-prose space-y-2">
            <p>
              Tiene {rutas.length} páginas.{" "}
              <a href="/sitemap.xml" target="_blank" rel="noopener" className={LINK}>
                Ver el sitemap<span className="sr-only"> (se abre en otra pestaña)</span>
              </a>
            </p>
            <p className="text-admin-meta text-gris-texto">
              Deja afuera el admin{cvAbierto ? "." : " y las páginas apagadas: hoy, «Sumate al equipo», mientras el formulario de CV esté cerrado."}
            </p>
          </div>
        </Apartado>
      </div>
    </>
  );
}
