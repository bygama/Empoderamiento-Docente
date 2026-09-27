import { NOMBRE_DE_LA_ZONA } from "@/config/metricas";
import { DIAS_DE_LA_SEMANA, franjaEnPalabras, franjasEnPalabras, type Franja } from "@/lib/metricas/mejor-hora";
import { cuantas } from "./formato";

const HORAS = Array.from({ length: 24 }, (_, h) => h);

// Cinco pasos de `azul-medio` sobre la superficie, de claro a oscuro (en el
// tema oscuro, de oscuro a claro: el token se invierte solo). El cero va en
// `gris-fondo`, relleno sin texto. Los pasos bajos no llegan a 3:1: el número
// está en cada celda para el lector y al pasar el mouse, y la respuesta va
// escrita arriba (DESIGN.md §11, «Gráficos»).
const TONOS = ["bg-gris-fondo", "bg-azul-medio/15", "bg-azul-medio/35", "bg-azul-medio/55", "bg-azul-medio/80", "bg-azul-medio"] as const;

const paso = (visitas: number, maximo: number) => (visitas <= 0 || maximo <= 0 ? 0 : Math.min(5, Math.ceil((visitas / maximo) * 5)));

/**
 * «Mejor hora para publicar» (SPEC de work/metricas-completas/ §6.2): la
 * respuesta en una frase y, debajo, la grilla de 7 días × 24 horas en la hora
 * de ED. Es una tabla de verdad: el lector recorre días y horas y oye cada
 * número. Con 2 px de la superficie entre celdas.
 */
export function MejorHora({ grilla, mejores }: { grilla: readonly (readonly number[])[]; mejores: readonly Franja[] }) {
  const maximo = Math.max(0, ...grilla.flat());
  return (
    <div className="space-y-4">
      <p className="max-w-prose">
        Cuando más gente entra, en {NOMBRE_DE_LA_ZONA}: {franjasEnPalabras(mejores)}.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-2xl table-fixed border-separate border-spacing-0.5 text-admin-meta">
          <caption className="sr-only">Visitas por día de la semana y hora, en {NOMBRE_DE_LA_ZONA}</caption>
          <thead>
            <tr>
              <td className="w-10" />
              {HORAS.map((h) => (
                <th key={h} scope="col" className="pb-1 text-center font-normal text-gris-texto">
                  <span aria-hidden="true">{h % 3 === 0 ? h : ""}</span>
                  <span className="sr-only">de {h} a {h + 1}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grilla.map((horas, dia) => (
              <tr key={DIAS_DE_LA_SEMANA[dia]}>
                <th scope="row" className="pr-2 text-left font-normal text-gris-texto">
                  <span aria-hidden="true">{DIAS_DE_LA_SEMANA[dia].slice(0, 3)}</span>
                  <span className="sr-only">{DIAS_DE_LA_SEMANA[dia]}</span>
                </th>
                {horas.map((visitas, hora) => (
                  <td key={hora} title={`${franjaEnPalabras({ dia, hora })}: ${cuantas(visitas, "visita", "visitas")}`} className={`h-7 rounded-sm ${TONOS[paso(visitas, maximo)]}`}>
                    <span className="sr-only">{visitas}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div aria-hidden="true" className="flex items-center gap-1.5 text-admin-meta text-gris-texto">
        <span className="mr-1">Menos</span>
        {TONOS.map((tono) => (
          <span key={tono} className={`size-4 rounded-sm ${tono}`} />
        ))}
        <span className="ml-1">Más</span>
      </div>
    </div>
  );
}
