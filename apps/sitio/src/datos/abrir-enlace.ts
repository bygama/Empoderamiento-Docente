import { claveDeLimite, ipDelPedido } from "@/lib/formularios/limite";
import { esUnClic } from "@/lib/metricas/clic";
import { segundoPlano } from "@/lib/segundo-plano";
import { sumarContador } from "./contadores";
import { enlacePorCodigo, type Enlace } from "./enlaces";
import { sumarEnvio } from "./limites-por-ip";

// `/l/<codigo>`, el link corto (SPEC de work/metricas-completas/ §6.4): cuenta
// el clic en el servidor —sin cookies, aunque la persona bloquee la
// analítica— y lleva a la página con los UTM, así la analítica cuenta las visitas
// que trajo. La página solo delega acá.

const HORA_MS = 60 * 60 * 1000;

/** Cuántos clics por hora cuenta una misma IP en un mismo link: más es alguien recargando, o un script. */
export const TOPE_DE_CLICS = 3;

/** Adónde lleva un link: su página con `utm_source` (dónde se compartió), `utm_medium=link` y `utm_campaign` (su código). */
export function destinoConUtm(enlace: Pick<Enlace, "destino" | "canal" | "codigo">): string {
  const url = new URL(enlace.destino, "http://sitio");
  url.searchParams.set("utm_source", enlace.canal);
  url.searchParams.set("utm_medium", "link");
  url.searchParams.set("utm_campaign", enlace.codigo);
  return `${url.pathname}${url.search}`;
}

/** Si la IP de este pedido todavía entra en el tope de ese link; lo cuenta aunque no entre. */
async function dentroDelTope(cabeceras: Headers, enlace: Pick<Enlace, "id">): Promise<boolean> {
  const clave = claveDeLimite(`enlace:${enlace.id}`, ipDelPedido(cabeceras), process.env.BETTER_AUTH_SECRET ?? "");
  return (await sumarEnvio(clave, HORA_MS)) <= TOPE_DE_CLICS;
}

/**
 * Suma el clic, si cuenta: un GET de una persona (`esUnClic`, con el método
 * que pasa el proxy) y dentro del tope por IP, que se guarda como un HMAC. El
 * `User-Agent` y la IP se leen y no se guardan.
 */
export async function contarClic(
  cabeceras: Headers,
  enlace: Pick<Enlace, "id">,
  { tope = dentroDelTope, sumar = sumarContador }: { tope?: typeof dentroDelTope; sumar?: typeof sumarContador } = {},
): Promise<void> {
  if (!esUnClic(cabeceras) || !(await tope(cabeceras, enlace))) return;
  await sumar({ evento: "enlace-clic", clave: enlace.id });
}

type Dependencias = { buscar?: typeof enlacePorCodigo; contar?: typeof contarClic };

/**
 * Adónde redirige `/l/<codigo>`, o `null` si el código no es de ningún link
 * (la página da el 404 del sitio). El clic se cuenta después de contestar:
 * quien toca el link no espera a la base, y un conteo que falla no rompe la
 * redirección.
 */
export async function destinoDelEnlace(cabeceras: Headers, codigo: string, { buscar = enlacePorCodigo, contar = contarClic }: Dependencias = {}): Promise<string | null> {
  const enlace = await buscar(codigo);
  if (!enlace) return null;
  segundoPlano(contar(cabeceras, enlace).catch((e) => console.error("contarClic:", e instanceof Error ? e.name : "error")));
  return destinoConUtm(enlace);
}
