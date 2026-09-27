// Si dos títulos son el mismo material dicho distinto (SPEC §7 de
// `work/biblioteca/`): lo que hace que agregar uno avise «se parece a…» con el
// link al que ya está. Es un aviso, no un freno: dos capítulos distintos
// pueden llamarse casi igual.

/** Las palabras de un título, sin tildes, signos ni mayúsculas. */
function palabras(titulo: string): string[] {
  return titulo
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

/** Cuánto tiene que ocupar un título dentro del otro para contar como «el mismo, más largo». */
const LARGO_MINIMO_CONTENIDO = 20;
/** La parte de las palabras (de tres letras o más) que tienen que compartir: con dos palabras de menos en un título de nueve, sigue siendo el mismo. */
const PARTE_EN_COMUN = 0.75;

/**
 * ¿Son el mismo material? Sí, si normalizados son iguales; si uno contiene al
 * otro (un subtítulo de más), con al menos 20 letras; o si comparten las tres
 * cuartas partes de sus palabras de tres letras o más.
 */
export function sonParecidos(a: string, b: string): boolean {
  const pa = palabras(a);
  const pb = palabras(b);
  const ta = pa.join(" ");
  const tb = pb.join(" ");
  if (!ta || !tb) return false;
  if (ta === tb) return true;
  const [corto, largo] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  if (corto.length >= LARGO_MINIMO_CONTENIDO && ` ${largo} `.includes(` ${corto} `)) return true;
  const sa = new Set(pa.filter((p) => p.length >= 3));
  const sb = new Set(pb.filter((p) => p.length >= 3));
  const union = new Set([...sa, ...sb]);
  if (union.size === 0) return false;
  const comunes = [...sa].filter((p) => sb.has(p)).length;
  return comunes / union.size >= PARTE_EN_COMUN;
}
