import { test } from "node:test";
import assert from "node:assert/strict";
import type { z } from "zod";
import { describir } from "@/lib/contenido/describir";
import type { SeccionRegistrada } from "@/lib/contenido/documento";
import { PAGINAS } from "./paginas";

// El contenido inicial es el que carga el sitio sin base y la primera vez: si
// alguien lo desincroniza de su esquema, la página se rompe en producción.
// Este test lo mira para cada sección de cada página, así una sección nueva
// queda cubierta con solo anotarla en el registro.

function secciones(): Array<[string, SeccionRegistrada]> {
  return Object.entries(PAGINAS).flatMap(([slug, pagina]) => {
    // Anotado como Record para que Object.entries no caiga en `any` con la unión de páginas.
    const deLaPagina: Record<string, SeccionRegistrada> = pagina.secciones;
    return Object.entries(deLaPagina).map(([clave, s]): [string, SeccionRegistrada] => [`${slug}.${clave}`, s]);
  });
}

function primerProblema(error: z.ZodError): string {
  const [problema] = error.issues;
  return `${problema?.message} (en ${problema?.path.join(".")})`;
}

test("el contenido inicial de cada sección pasa su propio esquema", () => {
  for (const [donde, seccion] of secciones()) {
    const resultado = seccion.esquema.safeParse(seccion.inicial);
    assert.ok(resultado.success, `${donde}: ${resultado.success ? "" : primerProblema(resultado.error)}`);
  }
});

test("el formulario de cada sección se puede dibujar", () => {
  // describir() tira si un campo no salió de campos.ts: así se ve acá y no en el admin.
  for (const [donde, seccion] of secciones()) assert.doesNotThrow(() => describir(seccion.esquema, seccion.nombre), donde);
});
