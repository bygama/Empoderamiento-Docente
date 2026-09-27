import { test } from "node:test";
import assert from "node:assert/strict";
import type { z } from "zod";
import { problemasDeCompartidos, rutasQueMuestran } from "@/lib/contenido/compartido";
import { describir } from "@/lib/contenido/describir";
import { partesDe, type SeccionRegistrada } from "@/lib/contenido/documento";
import { CLAVE_SEO } from "@/lib/contenido/seo";
import { PAGINAS } from "./paginas";

// El contenido inicial es el que carga el sitio sin base y la primera vez: si
// alguien lo desincroniza de su esquema, la página se rompe en producción.
// Este test lo mira para cada parte de cada página —las secciones y el SEO—,
// así una sección nueva queda cubierta con solo anotarla en el registro.

function secciones(): Array<[string, SeccionRegistrada]> {
  return Object.entries(PAGINAS).flatMap(([slug, pagina]) => partesDe(pagina).map(([clave, s]): [string, SeccionRegistrada] => [`${slug}.${clave}`, s]));
}

function primerProblema(error: z.ZodError): string {
  const [problema] = error.issues;
  return `${problema?.message} (en ${problema?.path.join(".")})`;
}

test("el contenido inicial de cada parte pasa su propio esquema", () => {
  for (const [donde, seccion] of secciones()) {
    const resultado = seccion.esquema.safeParse(seccion.inicial);
    assert.ok(resultado.success, `${donde}: ${resultado.success ? "" : primerProblema(resultado.error)}`);
  }
});

test("el formulario de cada parte se puede dibujar", () => {
  // describir() tira si un campo no salió de campos.ts: así se ve acá y no en el admin.
  for (const [donde, seccion] of secciones()) assert.doesNotThrow(() => describir(seccion.esquema, seccion.nombre), donde);
});

test("lo compartido apunta a una sección que existe, de otra página, sin cadenas", () => {
  assert.deepEqual(problemasDeCompartidos(PAGINAS), []);
});

test("publicar Qué hacemos regenera también Inicio, que muestra lo que comparte; publicar Inicio, solo Inicio", () => {
  assert.deepEqual(rutasQueMuestran(PAGINAS, "que-hacemos"), ["/que-hacemos", "/"]);
  assert.deepEqual(rutasQueMuestran(PAGINAS, "inicio"), ["/"]);
  assert.deepEqual(rutasQueMuestran(PAGINAS, "quienes-somos"), ["/quienes-somos"]);
});

test("ninguna sección se llama como la clave del SEO", () => {
  for (const [slug, pagina] of Object.entries(PAGINAS)) assert.ok(!Object.hasOwn(pagina.secciones, CLAVE_SEO), `${slug} tiene una sección «${CLAVE_SEO}»`);
});
