import { Curva, diaLargo, EstadoVacio } from "@ed/kit-admin";
import { MINIMOS } from "@/config/metricas";
import type { MarcaDeLaCurva } from "@/datos/consultas/marcas";
import type { PuntoDeLaCurva } from "@/lib/metricas/agregar";
import type { Periodo } from "@/lib/metricas/periodos";
import { Bloque } from "../Seccion";
import { pocoTrafico } from "../poco-trafico";
import { AgregarMarca } from "./AgregarMarca";
import { ListaDeMarcas } from "./ListaDeMarcas";

/**
 * La curva de visitantes por día con sus marcas (SPEC de work/metricas-completas/
 * §6.1): cada marca lleva un número, en la curva y en la lista de abajo, de la
 * más nueva a la más vieja. Con pocos días, el estado vacío en lugar de la
 * curva; las marcas y «Agregar marca» se ven igual.
 */
export function CurvaConMarcas({
  curva,
  diasConDatos,
  marcas,
  periodo,
  hoy,
}: {
  curva: readonly PuntoDeLaCurva[];
  diasConDatos: number;
  marcas: readonly MarcaDeLaCurva[];
  periodo: Periodo;
  hoy: string;
}) {
  const numeradas = marcas.map((m, i) => ({ ...m, numero: i + 1 }));
  // Una marca de hoy todavía no tiene su día en la curva (llega hasta el último copiado): va solo en la lista.
  const enLaCurva = new Set(curva.map((p) => p.dia));
  const porDia = new Map<string, number[]>();
  for (const m of numeradas) if (enLaCurva.has(m.dia)) porDia.set(m.dia, [...(porDia.get(m.dia) ?? []), m.numero]);
  const vacio = pocoTrafico({ hay: diasConDatos, minimo: MINIMOS.curva, periodo, una: "día con datos", varias: "días con datos", para: "para dibujar la curva" });

  return (
    <Bloque id="curva" titulo="Visitantes por día" explicacion="Cuántas personas entraron cada día. Las marcas explican un salto: una publicación, un posteo.">
      {diasConDatos >= MINIMOS.curva ? (
        <Curva nombre="Visitantes por día" medida="Visitantes" puntos={curva} marcas={[...porDia].map(([dia, numeros]) => ({ dia, numeros }))} />
      ) : (
        <EstadoVacio titulo={vacio.titulo} texto={vacio.texto} />
      )}
      <div className="space-y-3 pt-2">
        <h3 className="text-admin-meta font-medium">Marcas</h3>
        <ListaDeMarcas marcas={numeradas.map((m) => ({ id: m.id, numero: m.numero, dia: diaLargo(m.dia), texto: m.texto, creadaPor: m.aMano?.creadaPor ?? null }))} />
        <AgregarMarca hoy={hoy} />
      </div>
    </Bloque>
  );
}
