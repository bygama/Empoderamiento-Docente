import type { prismaAdapter } from "better-auth/adapters/prisma";
import type { AlmacenDeBloqueos } from "./bloqueo";

// Lo que la app le pasa a `crearAuth`: todo lo que es de ella y no del paquete.

/**
 * Lo que pasa en la sesión y la app quiere anotar: entrar, salir y cambiar la
 * contraseña (desde la cuenta o con el enlace de «olvidé»). El paquete sabe
 * cuándo pasa; dónde se guarda es de la app.
 */
export type SucesoDeSesion = { tipo: "entro" | "salio" | "cambio-su-contrasena"; idDeCuenta: string };

/**
 * El cliente de Prisma que recibe `crearAuth`.
 *
 * **No restringe nada, y conviene saberlo**: se deriva del tipo de better-auth,
 * que declara `interface PrismaClient {}` —una interfaz vacía—, así que acepta
 * cualquier valor no nulo. Es una debilidad de tipado de la librería, no algo
 * que esta frontera verifique. Se deriva igual en vez de inventar una forma
 * propia para no quedar desincronizado cuando la librería la complete.
 */
type ClienteDeBase = Parameters<typeof prismaAdapter>[0];

export type OpcionesDeAuth = {
  /** El `PrismaClient` de la app, ya construido con su adaptador. */
  base: ClienteDeBase;
  /** Firma las sesiones. Sin esto no se arranca: no hay valor por defecto. */
  secreto: string;
  /** De dónde se sirve, para armar los links de los correos. Sin barra final. */
  urlDelSitio: string;
  /** Manda el correo de «elegí una contraseña nueva». */
  mandarResetDeContrasena: (datos: {
    para: string;
    nombre?: string;
    enlace: string;
    /** Cuánto dura el enlace, para decirlo en el correo. */
    minutosDeVigencia: number;
  }) => Promise<void>;
  /** Manda el aviso de «tu contraseña cambió». */
  avisarCambioDeContrasena: (datos: { para: string; nombre?: string; cuando: Date }) => Promise<void>;
  /**
   * Corre una tarea después de contestar, sin que la respuesta la espere (en
   * Next, `after()`). Los correos salen por acá: si la respuesta esperara al
   * envío, tardaría más cuando el correo existe, y el tiempo lo delataría.
   */
  segundoPlano: (tarea: Promise<unknown>) => void;
  /** Dónde guarda el bloqueo por cuenta sus fallos (bloqueo.ts). */
  bloqueos: AlmacenDeBloqueos;
  /**
   * Anota un suceso de la sesión. Corre en segundo plano y no puede frenar
   * nada: si no se guarda, quien lo implementa lo loguea y no tira.
   */
  registrar: (suceso: SucesoDeSesion) => Promise<void>;
};
