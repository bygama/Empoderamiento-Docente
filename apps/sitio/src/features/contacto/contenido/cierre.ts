import { z } from "zod";
import { textoCorto } from "@/lib/contenido/campos";

// El cierre de Contacto: lo que se ve después de enviar, debajo del tema
// elegido (que es el de los temas, no de acá). Con el envío conectado, el
// texto dice que el mensaje llegó (lane de mensajes).

export const esquemaCierreDeContacto = z.object({
  titulo: textoCorto({ maximo: 60, etiqueta: "Título" }),
  texto: textoCorto({ maximo: 150, etiqueta: "Texto", ayuda: "Debajo va el mail directo." }),
  boton: textoCorto({ maximo: 30, etiqueta: "Botón", ayuda: "Vuelve a los temas para empezar otra consulta." }),
});

export type CierreDeContacto = z.infer<typeof esquemaCierreDeContacto>;

/** El contenido de hoy, tal cual está en el sitio. */
export const cierreDeContactoInicial: CierreDeContacto = {
  titulo: "Cada propuesta empieza con una conversación.",
  texto: "Recibimos tu mensaje: te vamos a responder por correo. Si preferís, también podés escribirnos directo.",
  boton: "Hacer otra consulta",
};
