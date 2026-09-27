import { Encabezado } from "@/admin/armazon/Encabezado";
import { IndiceDeTarjetas } from "@/admin/armazon/IndiceDeTarjetas";
import { Insignia } from "@/admin/armazon/Insignia";
import { Momento } from "@/admin/armazon/Momento";
import { enPalabras } from "@/config/privacidad";
import type { Leido, ResumenDeAjustes } from "@/datos/consultas/ajustes";
import { AJUSTES, PANTALLAS_DE_AJUSTES, type ClaveDeAjustes } from "./pantallas";

const cuantas = (n: number, una: string, varias: string) => `${n} ${n === 1 ? una : varias}`;

/** Lo que dice una tarjeta que se pudo leer; si no, «No se pudo leer» en su lugar. */
function estadoDe<T>(leido: Leido<T>, decir: (valor: T) => React.ReactNode): React.ReactNode {
  return leido.ok ? decir(leido.valor) : <span className="text-gris-texto">No se pudo leer</span>;
}

/** El estado de cada tarjeta, en llano: una línea, o una insignia fuerte si algo pide atención. */
function estados(r: ResumenDeAjustes): Record<ClaveDeAjustes, React.ReactNode> {
  return {
    sitio: estadoDe(r.sitio, ({ cambiadoEn, cambiadoPor }) =>
      cambiadoEn ? (
        <>
          Cambiados el <Momento iso={cambiadoEn.toISOString()} dia />
          {cambiadoPor ? ` por ${cambiadoPor}` : ""}
        </>
      ) : (
        "Como se cargaron al empezar"
      ),
    ),
    seo: estadoDe(r.seo, ({ redirecciones, rutas, revisadas, enGoogle, conectado }) => {
      const google = !conectado ? "Search Console sin conectar" : revisadas ? `${enGoogle} de ${rutas} páginas en Google` : "La indexación todavía no se revisó";
      return `${cuantas(redirecciones, "redirección", "redirecciones")} · ${google}`;
    }),
    avisos: estadoDe(r.avisos, (avisos) => {
      // Uno que viene prendido y quedó sin nadie es un aviso que alguien apagó para todas; el que se pide (el resumen semanal), no.
      const nadie = avisos.find((a) => a.deFabrica && a.reciben === 0);
      if (nadie) return <Insignia tono="fuerte">Nadie recibe los avisos de {nadie.nombre}</Insignia>;
      return avisos.map((a) => `${a.nombre}: ${cuantas(a.reciben, "persona", "personas")}`).join(" · ");
    }),
    privacidad: estadoDe(r.privacidad, ({ cv, contacto, spam }) =>
      [`CV ${enPalabras("cv", cv)}`, `Contacto ${enPalabras("contacto", contacto)}`, `Spam ${enPalabras("spam", spam)}`].join(" · "),
    ),
    conexiones: estadoDe(r.conexiones, ({ configuradas, total, conError }) =>
      conError ? <Insignia tono="fuerte">{cuantas(conError, "conexión con error", "conexiones con error")}</Insignia> : `${configuradas} de ${total} configuradas`,
    ),
  };
}

/**
 * `/admin/ajustes`: las cinco pantallas en tarjetas (DESIGN.md §11, «Índice de
 * tarjetas»), cada una con su estado real. Sin primario: acá no se hace nada,
 * se elige adónde ir.
 */
export function IndiceDeAjustes({ resumen }: { resumen: ResumenDeAjustes }) {
  const estado = estados(resumen);
  const tarjetas = PANTALLAS_DE_AJUSTES.map((p) => ({ ...p, estado: estado[p.clave] }));
  return (
    <div className="space-y-8">
      <Encabezado titulo={AJUSTES.nombre} detalle={AJUSTES.para} />
      <IndiceDeTarjetas tarjetas={tarjetas} />
    </div>
  );
}
