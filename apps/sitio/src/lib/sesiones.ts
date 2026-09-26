// Una sesión en llano, para reconocerla en Mi cuenta. Sin dependencias y sin
// dominio de ED: el user agent se lee con unas pocas marcas conocidas, que es
// todo lo que hace falta para decir «Chrome en Windows».

/** Del más específico al más general: Edge y Opera también dicen «Chrome», y Chrome también dice «Safari». */
const NAVEGADORES: [RegExp, string][] = [
  [/Edg(A|iOS)?\//, "Edge"],
  [/OPR\//, "Opera"],
  [/Firefox\/|FxiOS\//, "Firefox"],
  [/Chrome\/|CriOS\//, "Chrome"],
  [/Version\/[\d.]+.*Safari\//, "Safari"],
];

/** El iPad y el iPhone antes que Mac, y Android antes que Linux, por lo mismo. */
const SISTEMAS: [RegExp, string][] = [
  [/iPhone/, "iPhone"],
  [/iPad/, "iPad"],
  [/Android/, "Android"],
  [/CrOS/, "ChromeOS"],
  [/Windows/, "Windows"],
  [/Macintosh|Mac OS X/, "Mac"],
  [/Linux/, "Linux"],
];

const primeroQueCoincide = (marcas: [RegExp, string][], texto: string) => marcas.find(([marca]) => marca.test(texto))?.[1];

/** «Chrome en Windows», «Safari en iPhone»; con lo que se sepa, o «Dispositivo desconocido». */
export function dispositivoDe(userAgent: string | null): string {
  const navegador = userAgent ? primeroQueCoincide(NAVEGADORES, userAgent) : undefined;
  const sistema = userAgent ? primeroQueCoincide(SISTEMAS, userAgent) : undefined;
  if (navegador && sistema) return `${navegador} en ${sistema}`;
  return navegador ?? (sistema ? `Un navegador en ${sistema}` : "Dispositivo desconocido");
}

const PAISES = new Intl.DisplayNames(["es"], { type: "region" });

function nombreDelPais(codigo: string): string | undefined {
  try {
    return PAISES.of(codigo);
  } catch {
    return undefined;
  }
}

/** «Córdoba, Argentina», con lo que se sepa, o «Ubicación desconocida». */
export function lugarDe({ ciudad, pais }: { ciudad: string | null; pais: string | null }): string {
  const partes = [ciudad, pais ? nombreDelPais(pais) : undefined].filter(Boolean);
  return partes.length ? partes.join(", ") : "Ubicación desconocida";
}
