import { z } from "zod";
import { SIN_SALTOS, autoriaDe, deLaLista, doi, fechaDe, linea, opcional, portadaDe, urlDe } from "./campos-del-material";
import { FORMATOS, LUGARES_DE_DESTACADO, PUBLICOS, TEMAS, TIPOS, TOPES } from "./modelo";

// Qué es un material (SPEC §5 de `work/biblioteca/`), en dos esquemas con los
// mismos campos y los mismos topes, como una novedad (ADR-0014).
// `esquemaMaterial` es lo que el sitio necesita, completo: se valida al
// publicar y otra vez al leer. `esquemaBorrador` deja todo vacío, porque un
// material recién empezado no tiene nada: guardar no frena por lo que falta,
// frena por lo que está mal. Solo del servidor: la persona de una autoría se
// valida contra el Equipo, que no viaja al navegador. Cada campo, en
// `campos-del-material.ts`.

function esquemaDe(publicar: boolean) {
  return z
    .object({
      titulo: linea(TOPES.titulo, publicar, "Falta el título."),
      autorias: z
        .array(autoriaDe(publicar))
        .max(TOPES.autores, `Como mucho ${TOPES.autores} autoras y autores.`)
        .refine((a) => !publicar || a.length > 0, "Falta quién lo firma: al menos un autor o una autora."),
      // La firma escrita, solo si no es una lista de nombres; vacía, sale de las autorías (DECISIONS, C).
      autores: opcional(TOPES.firma).regex(SIN_SALTOS, "Es un texto de una línea: sin saltos."),
      descripcion: opcional(TOPES.descripcion),
      tipo: deLaLista(TIPOS, publicar, "Elegí un tipo de la lista."),
      tema: deLaLista(TEMAS, publicar, "Elegí un tema de la lista."),
      publico: deLaLista(PUBLICOS, publicar, "Elegí un público de la lista."),
      fecha: fechaDe(publicar),
      formato: deLaLista(FORMATOS, publicar, "Elegí un formato de la lista."),
      paginas: z.number().int("Las páginas van en un número entero.").min(1, "Al menos una página.").max(TOPES.paginas, `Como mucho ${TOPES.paginas} páginas.`).nullable(),
      portada: portadaDe(publicar),
      url: urlDe(publicar),
      fuente: linea(TOPES.fuente, publicar, "Falta dónde se lee: la revista o la editorial."),
      doi,
      // Vacía, va la generada con los datos de hoy (cita.ts); escrita, se respeta.
      cita: opcional(TOPES.cita),
      destacado: z.literal(LUGARES_DE_DESTACADO, { error: "El lugar de un destacado va del 1 al 4." }).nullable(),
      rotulo: opcional(TOPES.rotulo).regex(SIN_SALTOS, "Es un texto de una línea: sin saltos."),
      frase: opcional(TOPES.frase).regex(SIN_SALTOS, "Es un texto de una línea: sin saltos."),
      detalle: opcional(TOPES.detalle),
    })
    .superRefine((m, ctx) => {
      // Un destacado se publica con los tres textos que lo presentan.
      if (!publicar || m.destacado === null) return;
      const faltan = { rotulo: "Falta el rótulo del destacado.", frase: "Falta la frase del destacado.", detalle: "Falta el detalle del destacado." } as const;
      for (const campo of ["rotulo", "frase", "detalle"] as const) {
        if (m[campo] === "") ctx.addIssue({ code: "custom", path: [campo], message: faltan[campo] });
      }
    });
}

/** Lo que el sitio necesita, completo: se valida al publicar y al leer. */
export const esquemaMaterial = esquemaDe(true);

/** Lo mismo, pero todo puede estar vacío: se valida al guardar un borrador. */
export const esquemaBorrador = esquemaDe(false);

export type Material = z.output<typeof esquemaMaterial>;
export type BorradorDeMaterial = z.output<typeof esquemaBorrador>;

/**
 * Lo que reciben los componentes del sitio: el material ya resuelto para
 * mostrarse. La firma y la cita, armadas; la fecha, como se lee («Dic 2025»);
 * la portada, la propia o la generada.
 */
export type MaterialDelSitio = {
  id: string;
  titulo: string;
  autores: string;
  descripcion: string;
  tipo: Material["tipo"];
  tema: Material["tema"];
  publico: Material["publico"];
  anio: number;
  fecha: string;
  formato: Material["formato"];
  paginas: number | null;
  portada: { src: string; foco: { x: number; y: number } };
  url: string;
  fuente: string;
  cita: string;
};

/** Un destacado del sitio: el material y los textos que lo presentan. */
export type DestacadoDelSitio = { material: MaterialDelSitio; rotulo: string; frase: string; detalle: string };
