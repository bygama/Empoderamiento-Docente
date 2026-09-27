import type { PublicacionDeEtapa } from "@/features/quienes-somos/contenido/persona";

// Perfiles del Equipo para las pruebas contra el Postgres local
// (editar-equipo.test.ts y publicar-equipo.test.ts). Todo lo que crean lleva
// un slug con el prefijo de su archivo y el título «Prueba <slug>», y
// `limpiarEquipo` lo borra antes y después: los archivos de test corren a la
// vez, así que cada uno limpia solo lo suyo.

type Base = typeof import("@/datos/cliente").base;

/** Un perfil que se puede publicar: con recorrido si trae publicaciones. */
export function perfil(slug: string, nivel: 1 | 2 | 3 | 4, publicaciones?: PublicacionDeEtapa[]) {
  const foto = { src: "/equipo/marcela-cano.jpg", alt: "Una persona de prueba", foco: { x: 0.5, y: 0.2 } };
  return {
    slug,
    // Lo último del slug: el nombre tiene un tope de 30.
    nombre: `Prueba ${slug.split("-").pop()}`,
    rol: "Facilitadora",
    pais: "México",
    nivel,
    foto,
    sinFoto: false,
    acercamiento: 1,
    recorrido: publicaciones ? {
      nombreCompleto: "Una Persona de Prueba",
      rolCompleto: "Facilitadora de prueba",
      lugar: "Mérida",
      origen: "",
      titular: "Un titular.",
      intro: "Una bajada.",
      formacion: [],
      categorias: [{ clave: "investigacion", etiqueta: "Investigación", color: "azul" }],
      figura: { tipo: "marco", foto, apaisado: false },
      etapas: [
        {
          clave: "produccion",
          categoria: "investigacion",
          volanta: "Producción",
          color: "azul",
          periodo: "",
          composicion: "ramas",
          titulo: "Lo que escribió.",
          texto: "Sus trabajos.",
          cita: "",
          hitos: [],
          ramas: [],
          territorios: [],
          publicaciones,
        },
      ],
      cierre: { titulo: "Cierre.", texto: "Un cierre.", textoDos: "" },
    } : null,
  };
}

/** Un material publicado de prueba, firmado por esa persona del Equipo (o por nadie de ED). */
export async function materialDePrueba(base: Base, slug: string, personaId: string | null) {
  const m = await base.material.create({
    data: { titulo: `Prueba ${slug}`, tipo: "Artículos", tema: "Geometría", publico: "Docentes", fecha: "2026", formato: "PDF", url: `https://ejemplo.org/${slug}`, fuente: "Una revista", publicado: true },
  });
  await base.autoria.create({ data: { materialId: m.id, orden: 0, nombre: "Una Persona de Prueba", personaId } });
  return m.id;
}

export async function limpiarEquipo(base: Base, prefijo: string) {
  const ficha = `/quienes-somos/equipo/${prefijo}`;
  await base.redireccion.deleteMany({ where: { OR: [{ desde: { startsWith: ficha } }, { hacia: { startsWith: ficha } }] } });
  await base.material.deleteMany({ where: { titulo: { startsWith: `Prueba ${prefijo}` } } });
  await base.persona.deleteMany({ where: { OR: [{ slug: { startsWith: prefijo } }, { borrador: { path: ["slug"], string_starts_with: prefijo } }] } });
}
