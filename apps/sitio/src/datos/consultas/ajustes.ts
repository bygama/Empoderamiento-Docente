import { puede } from "@ed/auth";
import { AVISOS } from "@/config/avisos";
import { vigente } from "@/config/privacidad";
import { avisosDeTodas } from "@/datos/avisos";
import { base } from "@/datos/cliente";
import { estadoDeLasConexiones } from "@/datos/conexiones";
import { leerIndexacion } from "@/datos/consultas/indexacion";
import { plazosDeLaBase } from "@/datos/privacidad";

// El estado de cada tarjeta del índice de Ajustes (work/ajustes/SPEC.md §2.1).
// Cada una se lee aislada, como las del Inicio: la que tira dice «No se pudo
// leer» en su lugar y las demás siguen.

export type Leido<T> = { ok: true; valor: T } | { ok: false };

export type ResumenDeAjustes = {
  sitio: Leido<{ cambiadoEn: Date | null; cambiadoPor: string | null }>;
  seo: Leido<{ redirecciones: number; rutas: number; revisadas: number; enGoogle: number; conectado: boolean }>;
  avisos: Leido<Array<{ nombre: string; reciben: number; deFabrica: boolean }>>;
  privacidad: Leido<{ cv: number; contacto: number; spam: number }>;
  conexiones: Leido<{ configuradas: number; total: number; conError: number }>;
};

async function aislado<T>(que: string, leer: () => Promise<T>): Promise<Leido<T>> {
  try {
    return { ok: true, valor: await leer() };
  } catch (e) {
    console.error(`Ajustes: no se pudo leer «${que}»:`, e instanceof Error ? e.message : e);
    return { ok: false };
  }
}

/** Sin `usarAjustes`, `null`: dice quién recibe los avisos y qué falta configurar. */
export async function resumenDeAjustes(rol: unknown): Promise<ResumenDeAjustes | null> {
  if (!puede(rol, "usarAjustes")) return null;
  const [sitio, seo, avisos, privacidad, conexiones] = await Promise.all([
    aislado("los datos del sitio", async () => {
      const fila = await base.datosDelSitio.findUnique({ where: { id: 1 }, select: { cambiadoEn: true, cambiadoPor: true } });
      return { cambiadoEn: fila?.cambiadoEn ?? null, cambiadoPor: fila?.cambiadoPor ?? null };
    }),
    aislado("el SEO", async () => {
      const [redirecciones, indexacion] = await Promise.all([base.redireccion.count(), leerIndexacion(rol)]);
      const filas = indexacion?.filas ?? [];
      const revisadas = filas.filter((f) => f.veredicto);
      return { redirecciones, rutas: filas.length, revisadas: revisadas.length, enGoogle: revisadas.filter((f) => f.veredicto === "PASS").length, conectado: Boolean(indexacion?.conectado) };
    }),
    aislado("los avisos", async () => (await avisosDeTodas(rol)).map(({ aviso, cuentas }) => ({ nombre: AVISOS[aviso].nombre, reciben: cuentas.filter((c) => c.activo).length, deFabrica: AVISOS[aviso].deFabrica }))),
    aislado("los plazos", async () => {
      const plazos = await plazosDeLaBase();
      return { cv: vigente(plazos.cv), contacto: vigente(plazos.contacto), spam: plazos.spam };
    }),
    aislado("las conexiones", async () => {
      const estado = await estadoDeLasConexiones(rol);
      return { configuradas: estado.filter((c) => c.faltan.length === 0).length, total: estado.length, conError: estado.filter((c) => c.conError).length };
    }),
  ]);
  return { sitio, seo, avisos, privacidad, conexiones };
}
