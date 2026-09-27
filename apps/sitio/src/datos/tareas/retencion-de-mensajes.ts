import { bordeDelSpam, enPalabras, type PlazosDeGuarda } from "@/config/privacidad";
import type { AlmacenPrivado } from "@/lib/formularios/almacen-privado";
import type { ResultadoDeTarea, Tarea } from "@/lib/tareas/registro";
import { base } from "@/datos/cliente";
import { almacenDeCV } from "@/datos/formularios/cv";
import { podarLimites } from "@/datos/limites-por-ip";
import { llegoVencido, plazosDeLaBase } from "@/datos/privacidad";

// La retención de Mensajes (work/mensajes/SPEC.md §8), como tareas del cron
// diario (ADR-0011): Contacto, un CV con su archivo y el spam, cada uno a su
// plazo. Los plazos son los de Ajustes › Privacidad, de la base y sin
// respaldo (`plazosDeLaBase`), contados como dice `config/privacidad.ts`: a
// lo que llegó, el menor entre el plazo de cuando llegó y cualquiera
// posterior (ADR-0014). El detalle de cada corrida dice cuántos borró y nada
// más: es el rastro de lo automático, que no va a `actividad` porque ahí todo
// es de una persona.

const DIA_MS = 24 * 60 * 60 * 1000;

const seBorraron = (n: number, uno: string, varios: string) => (n === 1 ? `Se borró 1 ${uno}` : `Se borraron ${n} ${varios}`);

/** `plazos` se pasa para probar con unos fijos; el cron los lee de la base. */
export async function retenerContacto(hoy: Date = new Date(), plazos?: PlazosDeGuarda): Promise<ResultadoDeTarea> {
  const { contacto, spam: diasDeSpam } = plazos ?? (await plazosDeLaBase());
  // A la vez: un spam que además pasó su plazo lo borra una sola y cuenta una vez.
  const [spam, viejos] = await Promise.all([
    base.mensaje.deleteMany({ where: { bandeja: "contacto", estado: "spam", estadoEn: { lt: bordeDelSpam(diasDeSpam, hoy) } } }),
    base.mensaje.deleteMany({ where: { bandeja: "contacto", ...llegoVencido(contacto, hoy) } }),
  ]);
  const total = spam.count + viejos.count;
  if (!total) return { ok: true, detalle: "No había mensajes de Contacto vencidos." };
  const cuales = `${viejos.count} ${viejos.count === 1 ? "que pasó" : "que pasaron"} su plazo y ${spam.count} de spam de más de ${enPalabras("spam", diasDeSpam)}`;
  return { ok: true, detalle: `${seBorraron(total, "mensaje de Contacto", "mensajes de Contacto")}: ${cuales}.` };
}

/**
 * Cada CV vencido se borra archivo primero, fila después. Si el archivo no
 * se pudo borrar, la fila queda para que la corrida de mañana lo reintente, y
 * esta queda como fallida.
 */
export async function retenerCV(hoy: Date = new Date(), almacen: () => AlmacenPrivado = almacenDeCV, plazos?: PlazosDeGuarda): Promise<ResultadoDeTarea> {
  const { cv, spam } = plazos ?? (await plazosDeLaBase());
  const aBorrar = await base.mensaje.findMany({
    where: {
      bandeja: "cv",
      OR: [...llegoVencido(cv, hoy).OR, { estado: "spam", estadoEn: { lt: bordeDelSpam(spam, hoy) } }],
    },
    select: { id: true, archivo: true, estado: true },
  });
  // Lo que se borró de cada uno: si era spam o no, para el detalle; `null` si no se pudo.
  const hechos = await Promise.all(
    aBorrar.map(async ({ id, archivo, estado }) => {
      try {
        if (archivo) await almacen().borrar(archivo);
        await base.mensaje.delete({ where: { id } });
        return estado === "spam";
      } catch {
        return null;
      }
    }),
  );
  const borrados = hechos.filter((h) => h !== null).length;
  const deSpam = hechos.filter((h) => h === true).length;
  const fallidos = hechos.length - borrados;
  const hecho = borrados ? `${seBorraron(borrados, "CV con su archivo", "CV con sus archivos")} (${deSpam} de spam).` : "No había CV vencidos.";
  return fallidos ? { ok: false, detalle: `${hecho} No se pudieron borrar ${fallidos}: se reintenta mañana.` } : { ok: true, detalle: hecho };
}

export async function podarLimitesPorIp(hoy: Date = new Date()): Promise<ResultadoDeTarea> {
  const count = await podarLimites(new Date(hoy.getTime() - DIA_MS));
  return { ok: true, detalle: count ? `${seBorraron(count, "ventana de envíos", "ventanas de envíos")} de más de un día.` : "No había ventanas de envíos viejas." };
}

export const retencionDeContacto: Tarea = { clave: "retencion-de-contacto", nombre: "Retención de Contacto", correr: () => retenerContacto() };
export const retencionDeCV: Tarea = { clave: "retencion-de-cv", nombre: "Retención de los CV", correr: () => retenerCV() };
export const podaDeLimitesPorIp: Tarea = { clave: "poda-de-limites-por-ip", nombre: "Poda de los límites por IP", correr: () => podarLimitesPorIp() };
