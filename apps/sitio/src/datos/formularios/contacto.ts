import { z } from "zod";
import { siteConfig } from "@/config/site";
import { TEMAS } from "@/features/contacto/components/experiencia/data";
import { datosDe, esquemaDe, valoresDe, type CampoDeFormulario } from "@/lib/formularios/campos";
import { base } from "@/datos/cliente";
import { avisarDespues, dentroDelTope, demasiados, largoDelPedido, motivoSinDatos, noSePudo, rechazado, recibido } from "./recibir";

// `POST /api/contacto`: lo que manda el formulario de Contacto del sitio
// (work/mensajes/SPEC.md §5.1). Llega como JSON; se valida, se cuenta contra
// el tope de su IP y queda en `mensajes` para la bandeja del admin.

/** Los campos del formulario, con las etiquetas que tiene en el sitio. */
const CAMPOS = [
  { clave: "nombre", etiqueta: "Nombre y apellido", tipo: "texto", obligatorio: true, largo: 120 },
  { clave: "email", etiqueta: "Email", tipo: "correo", obligatorio: true },
  { clave: "institucion", etiqueta: "Institución u organización", tipo: "texto", obligatorio: false },
  { clave: "pais", etiqueta: "País", tipo: "opcion", obligatorio: false, opciones: [...siteConfig.paises, "Otro"] },
  { clave: "mensaje", etiqueta: "Mensaje", tipo: "parrafo", obligatorio: true },
] as const satisfies readonly CampoDeFormulario[];

const esquemaDelTema = z.enum(TEMAS.map((t) => t.key));

/** Cuántos mensajes por hora deja mandar una misma IP. */
export const TOPE_DE_CONTACTO = 5;

/** El JSON de un contacto no llega a esto; más grande es otra cosa. */
const MAXIMO_BYTES = 64 * 1024;

export async function recibirContacto(pedido: Request): Promise<Response> {
  if (largoDelPedido(pedido) > MAXIMO_BYTES) return rechazado(413, "El mensaje es demasiado largo.");
  const cuerpo: unknown = await pedido.json().catch(() => null);
  if (!cuerpo || typeof cuerpo !== "object") return rechazado(400, "No entendimos lo que llegó. Probá de nuevo.");
  const entrada = cuerpo as Record<string, unknown>;

  // El campo trampa: una persona no lo ve ni lo alcanza con el teclado. Si
  // viene con algo, se contesta como si hubiera salido bien y no se guarda
  // nada: el bot no aprende que lo descubrimos.
  if (entrada.web) return recibido();

  const tema = esquemaDelTema.safeParse(entrada.tema);
  if (!tema.success) return rechazado(400, "Elegí de qué querés hablar.");
  const valores = esquemaDe(CAMPOS).safeParse(valoresDe(CAMPOS, entrada));
  if (!valores.success) return rechazado(400, valores.error.issues[0]?.message ?? "Revisá los datos del formulario.");

  try {
    if (!(await dentroDelTope("contacto", pedido, TOPE_DE_CONTACTO))) return demasiados();
    const { nombre, email, pais, mensaje } = valores.data;
    const { id } = await base.mensaje.create({
      data: {
        bandeja: "contacto",
        nombre,
        correo: email,
        pais: pais || null,
        tema: TEMAS.find((t) => t.key === tema.data)?.titulo ?? null,
        mensaje,
        datos: datosDe(CAMPOS, valores.data, ["nombre", "email", "pais", "mensaje"]),
      },
      select: { id: true },
    });
    avisarDespues({ id, bandeja: "contacto" });
    return recibido();
  } catch (e) {
    console.error("recibirContacto: no se guardó:", motivoSinDatos(e));
    return noSePudo();
  }
}
