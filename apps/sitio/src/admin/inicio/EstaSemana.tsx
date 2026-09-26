import { BotonEnlace } from "@/admin/armazon/Boton";
import { Cifra } from "@/admin/armazon/Cifra";
import type { NumeroDeLaSemana } from "@/datos/inicio/esta-semana";

/**
 * «¿Cómo va el sitio?»: los números de la semana contra la anterior, de a dos
 * por fila. Lo que todavía no tiene datos dice «—»; el período se dice una
 * sola vez, abajo, con el atraso de Google.
 */
export function EstaSemana({ numeros, verMetricas }: { numeros: readonly NumeroDeLaSemana[]; verMetricas: boolean }) {
  return (
    <section aria-labelledby="esta-semana" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4">
        <h2 id="esta-semana" className="font-display text-admin-seccion font-bold">
          Esta semana
        </h2>
        {/* El `-mr-4` alinea el texto del link con el borde de las tarjetas: el terciario no tiene borde, pero sí el `px-4`. */}
        {verMetricas ? (
          <BotonEnlace variante="terciario" href="/admin/metricas" className="-mr-4">
            Ver métricas
          </BotonEnlace>
        ) : null}
      </div>
      {/*
        Uno abajo del otro en el celular y en la columna de la derecha desde
        `lg`, donde de a dos las etiquetas largas bajan a otra línea y los
        números quedan a distinta altura; de a dos solo entre `sm` y `lg`, a
        todo el ancho. Con un número impar (quien edita no ve los CV), el
        último toma las dos columnas: sin un hueco al lado.
      */}
      <div className="grid gap-3 sm:grid-cols-2 sm:[&>:last-child:nth-child(odd)]:col-span-2 lg:grid-cols-1 lg:[&>:last-child:nth-child(odd)]:col-span-1">
        {numeros.map((n) => (
          <Cifra key={n.clave} etiqueta={n.etiqueta} valor={n.valor} variacion={n.variacion} periodo="la semana anterior" nota={n.fallo ? "No se pudo leer" : undefined} />
        ))}
      </div>
      <p className="text-admin-meta text-gris-texto">Los últimos 7 días con datos, contra los 7 anteriores. Google llega con 2 o 3 días de atraso.</p>
    </section>
  );
}
