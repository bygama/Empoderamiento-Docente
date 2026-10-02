import { PAISES, type PaisKey } from "@/features/que-hacemos/components/proyectos-aplicaciones/fichas";

const sinAcentos = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();

const CLAVE_POR_NOMBRE = new Map(
  (Object.keys(PAISES) as PaisKey[]).map((clave) => [sinAcentos(PAISES[clave]), clave]),
);

/**
 * Las banderas de un país escrito a mano en el admin («Chile», «Costa Rica -
 * México»). Si alguna parte no tiene bandera dibujada no devuelve ninguna:
 * media respuesta diría que la persona es de un solo lugar.
 */
export function banderasDe(pais: string): PaisKey[] {
  const claves = partesDe(pais).map((parte) => CLAVE_POR_NOMBRE.get(sinAcentos(parte)));
  return claves.every((clave) => clave !== undefined) ? (claves as PaisKey[]) : [];
}

/** «Costa Rica - México» son dos países. */
function partesDe(pais: string): string[] {
  return pais
    .split(/\s+[-–·/]\s+|,\s*/)
    .map((parte) => parte.trim())
    .filter((parte) => parte !== "");
}

/**
 * Los países de todo el equipo: cuántos distintos son y sus banderas, de la
 * que más se repite a la que menos (las que tienen dibujo).
 */
export function resumenDePaises(paises: readonly string[]): { cuantos: number; banderas: PaisKey[] } {
  const veces = new Map<string, number>();
  for (const parte of paises.flatMap(partesDe)) {
    const nombre = sinAcentos(parte);
    veces.set(nombre, (veces.get(nombre) ?? 0) + 1);
  }
  const banderas = [...veces.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([nombre]) => CLAVE_POR_NOMBRE.get(nombre))
    .filter((clave): clave is PaisKey => clave !== undefined);
  return { cuantos: veces.size, banderas };
}
