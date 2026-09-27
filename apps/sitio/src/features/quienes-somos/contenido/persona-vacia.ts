import type { BorradorDePersona, Etapa } from "./persona";

// Lo que nace vacío en el formulario de un perfil: la persona, su recorrido y
// una etapa. Sin Zod, para que lo importe el navegador. La clave de una etapa
// o de una categoría nueva la pone quien la crea, con un clic (puede ser al
// azar): así mover o quitar no le cambia el contenido a otra.

type BorradorDeRecorrido = NonNullable<BorradorDePersona["recorrido"]>;
type BorradorDeEtapa = BorradorDeRecorrido["etapas"][number];

/** Una persona recién empezada: sin nivel, sin foto y sin recorrido. */
export function personaVacia(): BorradorDePersona {
  return { slug: "", nombre: "", rol: "", pais: "", nivel: null, foto: null, sinFoto: false, acercamiento: 1, recorrido: null };
}

/** El recorrido que se prende con «Tiene recorrido»: la figura en marco, como los catorce de hoy. */
export function recorridoVacio(): BorradorDeRecorrido {
  return {
    nombreCompleto: "",
    rolCompleto: "",
    lugar: "",
    origen: "",
    titular: "",
    intro: "",
    formacion: [],
    categorias: [],
    figura: { tipo: "marco", foto: null, apaisado: false },
    etapas: [],
    cierre: { titulo: "", texto: "", textoDos: "" },
  };
}

/** Una etapa nueva, editorial, sin nada adentro. */
export function etapaVacia(clave: string): BorradorDeEtapa {
  return {
    clave,
    categoria: "",
    volanta: "",
    color: "",
    periodo: "",
    composicion: "editorial" satisfies Etapa["composicion"],
    titulo: "",
    texto: "",
    cita: "",
    hitos: [],
    ramas: [],
    territorios: [],
    publicaciones: [],
  };
}
