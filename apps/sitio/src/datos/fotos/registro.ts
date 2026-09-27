import type { PrismaClient } from "@/../prisma/generado/client";
import { usosEnAliados } from "./de-los-aliados";
import { usosEnCasos } from "./de-los-casos";
import { usosEnNovedades } from "./de-las-novedades";
import { usosEnPaginas } from "./de-las-paginas";
import type { Uso, UsosDeUnModulo } from "./uso";

// Dónde se usa cada foto (`work/casos-aliados-fotos/SPEC.md` §3.3). Fotos no
// sabe nada de los módulos por dentro: cada uno declara, en su archivo, cómo
// encontrar sus fotos y cómo cambiarles el archivo (uso.ts), y acá se anota.
// Un uso se reconoce por la URL de la foto (`src`), que es única en la tabla
// `fotos`. Sumar un módulo (la 8b suma Equipo) es escribir su entrada y
// sumarla a la lista.

export const USOS_DE_FOTOS: readonly UsosDeUnModulo[] = [usosEnPaginas, usosEnNovedades, usosEnCasos, usosEnAliados];

/** Los usos de cada foto, por su URL. Una foto que no aparece no se usa en ningún lado. */
export async function usosPorFoto(base: PrismaClient, registro: readonly UsosDeUnModulo[] = USOS_DE_FOTOS): Promise<Map<string, Uso[]>> {
  const todos = (await Promise.all(registro.map((m) => m.buscar(base)))).flat();
  const porFoto = new Map<string, Uso[]>();
  for (const uso of todos) porFoto.set(uso.src, [...(porFoto.get(uso.src) ?? []), uso]);
  return porFoto;
}
