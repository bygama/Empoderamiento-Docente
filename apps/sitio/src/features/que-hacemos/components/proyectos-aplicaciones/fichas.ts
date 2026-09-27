import type { ProyectosDeQueHacemos } from "@/features/que-hacemos/contenido/proyectos";

// La estructura del archivo de proyectos: los tres capítulos, las fichas de
// cada uno, dónde se hizo cada proyecto (su bandera) y su pictograma. Es lo
// que no se edita desde el admin: una bandera es un dibujo (Bandera.tsx) y un
// pictograma también (Pictograma.tsx), y el reparto 4 + 3 + 1 es el del
// escenario —dos lados, la víbora trazada para 4 | 4—. Los textos de cada
// capítulo y de cada ficha llegan del contenido
// (features/que-hacemos/contenido/proyectos.ts) y se juntan acá, por
// posición.

export type PictoKey = "cuadernillos" | "cursos" | "comunidad" | "lideres" | "examen" | "materiales" | "curricula" | "paises";

export type PaisKey = "ar" | "mx" | "br" | "cl";

/** Los países donde ED trabajó, con su bandera (`Bandera.tsx`). */
export const PAISES: Record<PaisKey, string> = {
  ar: "Argentina",
  mx: "México",
  br: "Brasil",
  cl: "Chile",
};

/** «México», «Argentina y México», «Argentina, México y Brasil». */
export function nombrarPaises(paises: readonly PaisKey[]) {
  const nombres = paises.map((p) => PAISES[p]);
  if (nombres.length <= 1) return nombres.join("");
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

type EstructuraDeFicha = { id: string; paises: readonly PaisKey[]; picto: PictoKey };

/** Cada capítulo con sus fichas, en el orden del archivo. De acá sale cuántas fichas pide cada capítulo. */
export const ESTRUCTURA: ReadonlyArray<{ id: string; fichas: readonly EstructuraDeFicha[] }> = [
  {
    id: "desarrollo-profesional",
    fichas: [
      { id: "aprender-matematica", paises: ["ar"], picto: "cuadernillos" },
      { id: "media-superior", paises: ["mx"], picto: "cursos" },
      { id: "comunidad", paises: ["mx"], picto: "comunidad" },
      { id: "lideres", paises: ["mx"], picto: "lideres" },
    ],
  },
  {
    id: "curriculo-evaluacion-materiales",
    fichas: [
      { id: "exani", paises: ["mx"], picto: "examen" },
      { id: "buenos-aires-aprende", paises: ["ar"], picto: "materiales" },
      { id: "curricula-homologada", paises: ["ar", "mx"], picto: "curricula" },
    ],
  },
  {
    id: "todo-junto",
    fichas: [{ id: "techint", paises: ["ar", "mx", "br"], picto: "paises" }],
  },
];

type TextosDeFicha = ProyectosDeQueHacemos["capitulos"]["primero"]["fichas"][number];

/** Una ficha como la dibuja el archivo: su estructura y sus textos. */
export type Ficha = EstructuraDeFicha & TextosDeFicha;

/** Un capítulo como lo dibuja el archivo. La bajada trae su idea entre dobles asteriscos. */
export type Capitulo = { id: string; titulo: string; bajada: string; fichas: readonly Ficha[] };

/** Junta la estructura con los textos del contenido, capítulo por capítulo y ficha por ficha. */
export function armarCapitulos({ capitulos }: ProyectosDeQueHacemos): Capitulo[] {
  const textos = [capitulos.primero, capitulos.segundo, capitulos.tercero];
  return ESTRUCTURA.map((capitulo, c) => ({
    id: capitulo.id,
    titulo: textos[c].titulo,
    bajada: textos[c].bajada,
    fichas: capitulo.fichas.map((ficha, i) => ({ ...ficha, ...textos[c].fichas[i] })),
  }));
}
