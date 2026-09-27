import { claveDeLimite, ipDelPedido } from "@/lib/formularios/limite";
import { esRobot } from "@/lib/metricas/robots";
import { segundoPlano } from "@/lib/segundo-plano";
import { sumarContador } from "./contadores";
import { enlacePorCodigo, type Enlace } from "./enlaces";
import { sumarEnvio } from "./limites-por-ip";

// `/l/<codigo>`, el link corto (SPEC de work/metricas-completas/ §6.4): cuenta
// el clic en el servidor —sin cookies, aunque la persona bloquee la
// analítica— y lleva a la página con los UTM, así Vercel cuenta las visitas
// que trajo. La ruta solo delega acá.

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

/** Si un pedido es el clic de una persona: un `GET`, y ni una vista previa de una red ni un robot. */
export function esUnClic(pedido: Request): boolean {
  return pedido.method === "GET" && !esRobot(pedido.headers.get("user-agent"));
}

/**
 * Suma el clic, si cuenta: el de una persona y dentro del tope por IP, que se
 * guarda como un HMAC. El `User-Agent` y la IP se leen y no se guardan.
 */
export async function contarClic(pedido: Request, enlace: Pick<Enlace, "id">): Promise<void> {
  if (!esUnClic(pedido)) return;
  const clave = claveDeLimite(`enlace:${enlace.id}`, ipDelPedido(pedido.headers), process.env.BETTER_AUTH_SECRET ?? "");
  if ((await sumarEnvio(clave, HORA_MS)) > TOPE_DE_CLICS) return;
  await sumarContador({ evento: "enlace-clic", clave: enlace.id });
}

type Dependencias = { buscar?: typeof enlacePorCodigo; contar?: typeof contarClic };

/**
 * Lo que contesta `/l/<codigo>`: `null` si el código no es de ningún link (la
 * ruta da el 404 del sitio), o un **307** —temporal: un 308 lo guardaría el
 * navegador y el próximo clic no pasaría por acá— sin caché. El clic se cuenta
 * después de contestar: quien toca el link no espera a la base, y un conteo
 * que falla no rompe la redirección.
 */
export async function abrirEnlace(pedido: Request, codigo: string, { buscar = enlacePorCodigo, contar = contarClic }: Dependencias = {}): Promise<Response | null> {
  const enlace = await buscar(codigo);
  if (!enlace) return null;
  segundoPlano(contar(pedido, enlace).catch((e) => console.error("contarClic:", e instanceof Error ? e.name : "error")));
  return new Response(null, {
    status: 307,
    headers: { Location: destinoConUtm(enlace), "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
