import { createHmac } from "node:crypto";
import { APIError } from "better-auth/api";

/**
 * El bloqueo por cuenta: lo que el rate limit por IP no cubre. Un ataque
 * repartido entre muchas IP contra una sola cuenta nunca choca con el tope de
 * cada IP; con esto, **5 fallos en 15 minutos frenan la cuenta**, 15 minutos
 * la primera vez y el doble cada vez que se repite, hasta 1 hora.
 *
 * Cuenta los fallos de correos que no existen igual que los de los que sí: si
 * solo frenara cuentas reales, el freno mismo diría cuáles existen.
 *
 * Acá están las reglas; dónde se guardan lo decide la app (`AlmacenDeBloqueos`).
 */

const MINUTO = 60 * 1000;
const FALLOS_PARA_FRENAR = 5;
const VENTANA = 15 * MINUTO;
const PRIMER_FRENO = 15 * MINUTO;
const FRENO_MAXIMO = 60 * MINUTO;
/** Tras un día sin fallos, la escalera vuelve a empezar por 15 minutos. */
export const OLVIDO = 24 * 60 * MINUTO;

export type EstadoDeBloqueo = {
  /** Fallos en la ventana que corre. */
  fallos: number;
  /** Cuándo empezó esa ventana (o el último freno). */
  desde: Date;
  /** Cuántas veces seguidas se frenó: de eso sale cuánto dura el próximo. */
  bloqueos: number;
  /** Frenada hasta; null si no. */
  hasta: Date | null;
};

/** Dónde vive el estado. La app lo implementa contra su base. */
export type AlmacenDeBloqueos = {
  leer(clave: string): Promise<EstadoDeBloqueo | null>;
  /** Lee, aplica `cambio` y guarda, sin que otro cambio simultáneo se pierda. */
  actualizar(clave: string, cambio: (actual: EstadoDeBloqueo | null) => EstadoDeBloqueo): Promise<EstadoDeBloqueo>;
  borrar(clave: string): Promise<void>;
  /** Borra lo que quedó quieto desde antes de `antesDe` y no está frenado. */
  podar(antesDe: Date): Promise<void>;
};

/**
 * Con qué se guarda un correo: su HMAC, nunca el correo. El prefijo separa este
 * uso del mismo secreto del de firmar sesiones. Se normaliza como lo compara
 * better-auth, para que «Ana@ED.org» y «ana@ed.org» sean la misma cuenta.
 */
export function claveDeBloqueo(correo: string, secreto: string): string {
  return createHmac("sha256", secreto).update(`bloqueos-de-acceso:${correo.trim().toLowerCase()}`).digest("hex");
}

/**
 * Con qué se guardan los códigos fallidos del segundo factor de una cuenta:
 * las mismas reglas y la misma tabla que entrar, con otra clave. Aparte a
 * propósito: la contraseña buena borra los fallos de entrar, y no tiene que
 * borrar estos, que son de quien ya la sabe. Va por el id y no por el correo:
 * en el paso del código, la cuenta ya se conoce.
 */
export function claveDeCodigos(idDeCuenta: string, secreto: string): string {
  return createHmac("sha256", secreto).update(`codigos-del-segundo-factor:${idDeCuenta}`).digest("hex");
}

/**
 * Con qué se guardan los fallos de volver a poner la contraseña con la sesión
 * abierta (confirmar.ts). Aparte de entrar a propósito: quien sabe un correo
 * puede trabar el de entrar desde afuera, y eso no tiene que trabar lo que la
 * persona hace con su sesión. Por el id, como los códigos.
 */
export function claveDeConfirmacion(idDeCuenta: string, secreto: string): string {
  return createHmac("sha256", secreto).update(`confirmar-la-contrasena:${idDeCuenta}`).digest("hex");
}

/** Los segundos que le quedan al freno, o null si la cuenta no está frenada. */
export function segundosDeFreno(estado: EstadoDeBloqueo | null, ahora: Date): number | null {
  if (!estado?.hasta || estado.hasta <= ahora) return null;
  return Math.ceil((estado.hasta.getTime() - ahora.getTime()) / 1000);
}

/** El estado después de un fallo más. */
export function conUnFalloMas(actual: EstadoDeBloqueo | null, ahora: Date): EstadoDeBloqueo {
  if (actual && segundosDeFreno(actual, ahora) !== null) return actual;
  const vigente = actual && ahora.getTime() - actual.desde.getTime() < OLVIDO ? actual : null;
  const enVentana = vigente !== null && ahora.getTime() - vigente.desde.getTime() < VENTANA;
  const fallos = enVentana ? vigente.fallos + 1 : 1;
  const bloqueos = vigente?.bloqueos ?? 0;
  if (fallos < FALLOS_PARA_FRENAR) {
    return { fallos, desde: enVentana ? vigente.desde : ahora, bloqueos, hasta: null };
  }
  const freno = Math.min(PRIMER_FRENO * 2 ** bloqueos, FRENO_MAXIMO);
  return { fallos: 0, desde: ahora, bloqueos: bloqueos + 1, hasta: new Date(ahora.getTime() + freno) };
}

/**
 * El mismo 429 que contesta el rate limit por IP, con el mismo cuerpo: quien
 * prueba no distingue un freno del otro, y el formulario muestra un solo aviso.
 */
export function respuestaDeFreno(segundos: number): APIError {
  return new APIError(
    "TOO_MANY_REQUESTS",
    { message: "Too many requests. Please try again later." },
    { "X-Retry-After": String(segundos) },
  );
}
