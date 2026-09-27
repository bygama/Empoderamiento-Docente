import { z } from "zod";
import { EVENTOS, esEventoPublico, type Evento } from "@/config/metricas";
import { comoJson, leerConTope } from "@/lib/formularios/cuerpo";
import { claveDeLimite, ipDelPedido } from "@/lib/formularios/limite";
import { canalDe } from "@/lib/metricas/canales";
import { urlDelSitio } from "@/lib/url-del-sitio";
import { base } from "./cliente";
import { sumarContador, type CanalGuardado } from "./contadores";
import { enlacePorCodigo } from "./enlaces";
import { sumarEnvio } from "./limites-por-ip";

// `POST /api/contar` (SPEC de work/metricas-completas/ §5.2): el sitio avisa
// que pasó un evento raro de la lista cerrada y acá se suma uno. Se guarda
// solo el canal —decidido acá, con el sitio de donde vino la persona, que no
// se guarda— y, si hace falta, el link o el material. **Contesta siempre 204
// sin cuerpo**, cuente o no: a un script no le dice qué pasó.

const HORA_MS = 60 * 60 * 1000;

/** Cuántos eventos por hora cuenta una misma IP, todos juntos. */
export const TOPE_DE_EVENTOS = 60;

/** Un evento es chico: más grande es otra cosa. */
const MAXIMO_BYTES = 2 * 1024;

const esquema = z.object({
  evento: z.string().refine(esEventoPublico),
  /** El id de un material. */
  clave: z.string().max(100).optional(),
  /** El host del `document.referrer`, si la persona vino de otro sitio. */
  referido: z
    .string()
    .max(253)
    .regex(/^[a-z0-9.-]*$/i)
    .optional(),
  /** El código de un link corto, si la persona llegó por uno. */
  enlace: z.string().max(60).optional(),
});

type Pedido = z.infer<typeof esquema> & { evento: Evento };

/** Si ese id es de un material publicado de la Biblioteca: lo que no, no se cuenta. */
export async function materialExiste(id: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return false;
  return (await base.material.count({ where: { id, publicado: true } })) > 0;
}

/** Si la IP de este pedido todavía entra en su tope; lo cuenta, como `sumarEnvio`, aunque no entre. */
async function dentroDelTope(pedido: Request): Promise<boolean> {
  const clave = claveDeLimite("contar", ipDelPedido(pedido.headers), process.env.BETTER_AUTH_SECRET ?? "");
  return (await sumarEnvio(clave, HORA_MS)) <= TOPE_DE_EVENTOS;
}

export type Dependencias = {
  material?: (id: string) => Promise<boolean>;
  buscarEnlace?: typeof enlacePorCodigo;
  sumar?: typeof sumarContador;
  tope?: (pedido: Request) => Promise<boolean>;
};

/** La clave que se guarda: el material que existe, o el link que trajo a la persona; `null` si el evento no cuenta. */
async function claveDe({ evento, clave, enlace }: Pedido, { material, buscarEnlace }: Required<Pick<Dependencias, "material" | "buscarEnlace">>): Promise<string | null> {
  if (evento === "material-consultado") return clave && (await material(clave)) ? clave : null;
  if (!evento.startsWith("cv-") || !enlace) return "";
  return (await buscarEnlace(enlace))?.id ?? "";
}

function canalDelReferido(referido: string | undefined): CanalGuardado {
  return canalDe(referido ?? "", new URL(urlDelSitio()).hostname) ?? "directo";
}

const nada = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function recibirEvento(
  pedido: Request,
  { material = materialExiste, buscarEnlace = enlacePorCodigo, sumar = sumarContador, tope = dentroDelTope }: Dependencias = {},
): Promise<Response> {
  try {
    const bytes = await leerConTope(pedido, MAXIMO_BYTES);
    const valido = bytes ? esquema.safeParse(comoJson(bytes)) : null;
    if (!valido?.success) return nada();
    const datos = valido.data as Pedido;
    if (!(await tope(pedido))) return nada();
    const clave = await claveDe(datos, { material, buscarEnlace });
    if (clave === null) return nada();
    await sumar({ evento: datos.evento, canal: EVENTOS[datos.evento].conCanal ? canalDelReferido(datos.referido) : "", clave });
  } catch (e) {
    // Sin nada de lo que llegó: solo qué falló.
    console.error("recibirEvento:", e instanceof Error ? e.name : "error");
  }
  return nada();
}
