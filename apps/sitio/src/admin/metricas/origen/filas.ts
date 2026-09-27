import { MENOS_DE } from "@/config/metricas";
import type { ListaProtegida } from "@/datos/consultas/origen";
import { parte } from "@/lib/metricas/agregar";
import type { FilaDeSeccion } from "../Seccion";
import { cuantas } from "../formato";

const nombresDePais = new Intl.DisplayNames(["es"], { type: "region" });

/** «Chile» para `CL`; sin país, «Sin identificar». */
export function nombreDePais(codigo: string): string {
  if (!/^[A-Z]{2}$/.test(codigo)) return "Sin identificar";
  return nombresDePais.of(codigo) ?? codigo;
}

const DISPOSITIVOS: Record<string, string> = { mobile: "Celular", desktop: "Computadora", tablet: "Tableta" };

/** «Celular» para `mobile`; lo que no conocemos, tal cual; vacío, «Sin identificar». */
export function nombreDeDispositivo(valor: string): string {
  return DISPOSITIVOS[valor] ?? (valor || "Sin identificar");
}

/** «123 visitas · 30 %». */
export function visitasYParte(total: number, de: number): string {
  return `${cuantas(total, "visita", "visitas")} · ${parte(total, de)} %`;
}

/**
 * Las filas de una lista de Origen: lo que se nombra, y al final «Otros», con
 * lo chico y lo que la API junta, sin nombres.
 */
export function filasProtegidas(lista: ListaProtegida, nombre: (valor: string) => string, detalle?: (valor: string) => string): FilaDeSeccion[] {
  const filas = lista.visibles.map((v) => ({
    clave: v.valor || "sin-valor",
    principal: nombre(v.valor),
    detalle: `${visitasYParte(v.total, lista.total)}${detalle ? ` · ${detalle(v.valor)}` : ""}`,
  }));
  if (lista.ocultos.total > 0) {
    filas.push({ clave: "otros", principal: "Otros", detalle: `${visitasYParte(lista.ocultos.total, lista.total)} · con menos de ${MENOS_DE} visitas cada uno: no se nombran` });
  }
  return filas;
}
