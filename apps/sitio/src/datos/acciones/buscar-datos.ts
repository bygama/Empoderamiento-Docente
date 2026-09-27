"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { SIN_PERMISO, puede } from "@ed/auth";
import { auth } from "@/datos/auth";
import { base } from "@/datos/cliente";
import { buscarDatos } from "@/datos/biblioteca/buscar-datos";
import { conPersonas, parecidosA, presentacion, yaEsta, type Vecino } from "@/datos/biblioteca/contra-la-biblioteca";
import type { CamposDeAfuera, Fuente } from "@/datos/biblioteca/de-afuera";
import { pedirProtegido } from "@/lib/red/pedido-protegido";
import { pedidoSinForma, sinForma } from "./materiales-en-base";

// «Buscar datos» y «¿se parece a otro?» desde la ficha de un material (SPEC
// §8 de `work/biblioteca/`). No escriben nada. Empiezan por la sesión y
// `editarBiblioteca`, como toda acción del admin: bajar una página es algo
// que el servidor hace por quien lo pide.

export type ResultadoDeBuscar =
  | { ok: true; datos: CamposDeAfuera; origen: Partial<Record<keyof CamposDeAfuera, Fuente>>; repetido: Vecino | null; parecidos: Vecino[] }
  | { ok: false; detalle: string };

const SIN_SESION = { ok: false as const, detalle: "Hay que entrar al admin." };
const esquemaEntrada = z.object({ entrada: z.string().trim().min(1, "Pegá un DOI, un ISBN o un link.").max(500, "Eso es demasiado largo para un DOI o un link.") });

export async function buscarDatosDeMaterial(pedido: { entrada: string }): Promise<ResultadoDeBuscar> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarBiblioteca")) return { ok: false, detalle: SIN_PERMISO };
    const valido = esquemaEntrada.safeParse(pedido, sinForma);
    if (!valido.success) return { ok: false, detalle: pedidoSinForma(valido.error, "buscarDatosDeMaterial") ?? valido.error.issues[0]?.message ?? "Pegá un DOI, un ISBN o un link." };
    const { agente, contacto } = await presentacion();
    const r = await buscarDatos(valido.data.entrada, { pedir: (url, o) => pedirProtegido(url, { ...o, agente }), contacto });
    if ("error" in r) return { ok: false, detalle: r.error };
    const [repetido, parecidos, autorias] = await Promise.all([
      yaEsta(base, r.datos.doi),
      parecidosA(base, r.datos.titulo ?? ""),
      r.datos.autorias ? conPersonas(base, r.datos.autorias) : undefined,
    ]);
    return { ok: true, datos: { ...r.datos, ...(autorias ? { autorias } : {}) }, origen: r.origen, repetido, parecidos };
  } catch (e) {
    console.error("buscarDatosDeMaterial:", e instanceof Error ? e.name : "error");
    return { ok: false, detalle: "No se pudo buscar; probá de nuevo en un rato, o cargalo a mano." };
  }
}

/** Los materiales que ya tienen un título parecido: el aviso de la ficha al escribir el título de uno nuevo. */
export async function materialesParecidos(pedido: { titulo: string; id: string | null }): Promise<{ ok: true; parecidos: Vecino[] } | { ok: false; detalle: string }> {
  try {
    const sesion = await auth.api.getSession({ headers: await headers() });
    if (!sesion) return SIN_SESION;
    if (!puede(sesion.user.rol, "editarBiblioteca")) return { ok: false, detalle: SIN_PERMISO };
    const valido = z.object({ titulo: z.string().max(300), id: z.uuid().nullable() }).safeParse(pedido);
    if (!valido.success) return { ok: false, detalle: "El pedido no tiene la forma esperada." };
    return { ok: true, parecidos: await parecidosA(base, valido.data.titulo, valido.data.id) };
  } catch (e) {
    console.error("materialesParecidos:", e instanceof Error ? e.name : "error");
    return { ok: false, detalle: "No se pudo revisar si ya está." };
  }
}
