import { randomUUID } from "node:crypto";
import path from "node:path";
import { CAMPOS_DEL_CV, COLUMNAS_DEL_CV, CV_PESA_DE_MAS, MAXIMO_DEL_CV, cvAbierto } from "@/config/cv";
import { almacenPrivado, type AlmacenPrivado } from "@/lib/formularios/almacen-privado";
import { datosDe, esquemaDe, valoresDe } from "@/lib/formularios/campos";
import { esPdf } from "@/lib/formularios/pdf";
import { base } from "@/datos/cliente";
import { ESCRIBINOS, avisarDespues, dentroDelTope, demasiados, largoDelPedido, motivoSinDatos, noSePudo, rechazado, recibido } from "./recibir";

// `POST /api/cv`: el formulario de /sumate-al-equipo (work/mensajes/SPEC.md
// §5.2). Llega como multipart con el PDF. El archivo va al almacén privado
// y nunca tiene URL pública: lo baja el admin por una ruta con sesión.

type Entorno = Record<string, string | undefined>;

/** Cuántos CV por hora deja mandar una misma IP. */
export const TOPE_DE_CV = 3;

/** El margen del multipart y de los otros campos sobre el archivo. */
const MARGEN_BYTES = 256 * 1024;

/**
 * Dónde viven los CV: el store privado de Blob (`CV_BLOB_READ_WRITE_TOKEN`)
 * o, en local, `apps/sitio/.cv/`. En Vercel sin token tira: el disco de una
 * función no es de nadie.
 */
export function almacenDeCV(entorno: Entorno = process.env): AlmacenPrivado {
  return almacenPrivado({
    token: entorno.CV_BLOB_READ_WRITE_TOKEN,
    carpeta: path.resolve(process.cwd(), ".cv"),
    sinDisco: Boolean(entorno.VERCEL),
  });
}

/** Lo que llegó en el campo del archivo, si es un PDF que entra; si no, qué decir. */
async function pdfDe(archivo: FormDataEntryValue | null): Promise<Uint8Array | string> {
  if (!(archivo instanceof File) || archivo.size === 0) return "Adjuntá tu CV en PDF.";
  if (archivo.size > MAXIMO_DEL_CV) return CV_PESA_DE_MAS;
  const bytes = new Uint8Array(await archivo.arrayBuffer());
  return esPdf(bytes) ? bytes : "El archivo no es un PDF: exportá tu CV como PDF y probá de nuevo.";
}

export async function recibirCV(pedido: Request, entorno: Entorno = process.env): Promise<Response> {
  if (!cvAbierto(entorno)) return new Response("No encontrado", { status: 404 });
  if (largoDelPedido(pedido) > MAXIMO_DEL_CV + MARGEN_BYTES) return rechazado(413, CV_PESA_DE_MAS);
  const datos = await pedido.formData().catch(() => null);
  if (!datos) return rechazado(400, "No entendimos lo que llegó. Probá de nuevo.");

  // El campo trampa, como en Contacto: se contesta que salió bien y no se guarda nada.
  if (datos.get("web")) return recibido();

  const valores = esquemaDe(CAMPOS_DEL_CV).safeParse(valoresDe(CAMPOS_DEL_CV, datos));
  if (!valores.success) return rechazado(400, valores.error.issues[0]?.message ?? "Revisá los datos del formulario.");
  const pdf = await pdfDe(datos.get("archivo"));
  if (typeof pdf === "string") return rechazado(400, pdf);

  let almacen: AlmacenPrivado;
  try {
    almacen = almacenDeCV(entorno);
  } catch {
    console.error("recibirCV: no hay dónde guardar los CV (falta CV_BLOB_READ_WRITE_TOKEN).");
    return rechazado(503, `Por ahora no podemos recibir CV por acá: ${ESCRIBINOS}.`);
  }

  try {
    if (!(await dentroDelTope("cv", pedido, TOPE_DE_CV))) return demasiados();
    const id = randomUUID();
    const archivo = `cv/${id}.pdf`;
    const { nombre, correo, pais, mensaje } = valores.data;
    // Primero el archivo, después la fila; si la fila no se guarda, el archivo
    // no queda huérfano en un store que nadie mira.
    await almacen.guardar(archivo, pdf, "application/pdf");
    try {
      await base.mensaje.create({
        data: {
          id,
          bandeja: "cv",
          nombre,
          correo,
          pais: pais || null,
          mensaje: mensaje || null,
          datos: datosDe(CAMPOS_DEL_CV, valores.data, COLUMNAS_DEL_CV),
          archivo,
          archivoBytes: pdf.byteLength,
        },
      });
    } catch (e) {
      await almacen.borrar(archivo).catch(() => undefined);
      throw e;
    }
    avisarDespues({ id, bandeja: "cv" });
    return recibido();
  } catch (e) {
    console.error("recibirCV: no se guardó:", motivoSinDatos(e));
    return noSePudo();
  }
}
