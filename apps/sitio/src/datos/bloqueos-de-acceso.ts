import type { AlmacenDeBloqueos, EstadoDeBloqueo } from "@ed/auth/servidor";
import { base } from "./cliente";

/**
 * Dónde guarda el bloqueo por cuenta sus fallos: la tabla
 * `bloqueos_de_acceso`. Las reglas viven en `@ed/auth` (bloqueo.ts); acá solo
 * se lee y se escribe, porque `datos/` es la única puerta a la base.
 */

const SIN_FILA = { fallos: 0, bloqueos: 0 };

/** La fila sin su clave: el estado que entienden las reglas. */
const aEstado = ({ fallos, desde, bloqueos, hasta }: EstadoDeBloqueo): EstadoDeBloqueo => ({ fallos, desde, bloqueos, hasta });

export const almacenDeBloqueos: AlmacenDeBloqueos = {
  async leer(clave) {
    const fila = await base.bloqueoDeAcceso.findUnique({ where: { clave } });
    return fila ? aEstado(fila) : null;
  },

  /**
   * **Atómico, a propósito.** Un ataque manda los intentos de a muchos a la
   * vez; con leer y escribir sueltos, dos fallos simultáneos leerían el mismo
   * número y uno se perdería, y cada fallo perdido es un intento gratis.
   *
   * La fila se bloquea (`FOR UPDATE`) antes de leerla, así que el segundo
   * espera al primero. Para bloquearla tiene que existir: el `createMany` con
   * `skipDuplicates` es un `INSERT … ON CONFLICT DO NOTHING`, que la crea sin
   * pisar la de otro y dice si la creó (entonces no había estado previo).
   */
  async actualizar(clave, cambio) {
    return base.$transaction(async (tx) => {
      const { count: recienCreada } = await tx.bloqueoDeAcceso.createMany({
        data: [{ clave, desde: new Date(), ...SIN_FILA }],
        skipDuplicates: true,
      });
      await tx.$queryRaw`SELECT 1 FROM bloqueos_de_acceso WHERE clave = ${clave} FOR UPDATE`;
      const actual = recienCreada ? null : await tx.bloqueoDeAcceso.findUniqueOrThrow({ where: { clave } });
      const siguiente = cambio(actual && aEstado(actual));
      await tx.bloqueoDeAcceso.update({ where: { clave }, data: siguiente });
      return siguiente;
    });
  },

  async borrar(clave) {
    await base.bloqueoDeAcceso.deleteMany({ where: { clave } });
  },

  async podar(antesDe) {
    await base.bloqueoDeAcceso.deleteMany({
      where: { desde: { lt: antesDe }, OR: [{ hasta: null }, { hasta: { lt: antesDe } }] },
    });
  },
};
