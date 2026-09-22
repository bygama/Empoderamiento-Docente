import { test } from "node:test";
import assert from "node:assert/strict";
import type { Pagina } from "@/../prisma/generado/client";
import { filaDe } from "./paginas";

// filaDe no toca la base cuando se le inyecta `consultar`: así se prueban acá
// sus ramas (sin DATABASE_URL, con base y consulta que resuelve, con base y
// consulta que tira en runtime, con base y consulta que tira durante `next
// build`) sin un Postgres real. La última rama es el fix de I-1: con base
// configurada, un hipo de la consulta durante el build tiene que romperlo en
// vez de hornear el contenido inicial en silencio.

test("sin DATABASE_URL, no llama a consultar y devuelve null", async () => {
  const antes = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    let llamada = false;
    const fila = await filaDe("inicio", async () => {
      llamada = true;
      return null;
    });
    assert.equal(fila, null);
    assert.equal(llamada, false);
  } finally {
    if (antes !== undefined) process.env.DATABASE_URL = antes;
  }
});

test("con DATABASE_URL, una consulta que resuelve devuelve la fila tal cual", async () => {
  const antes = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgres://fake";
  try {
    // El `as` es del test: alcanza con que filaDe devuelva esta referencia
    // intacta, no con que sea una fila real de Prisma.
    const falsa = { slug: "inicio" } as unknown as Pagina;
    const fila = await filaDe("inicio", async () => falsa);
    assert.equal(fila, falsa);
  } finally {
    if (antes !== undefined) process.env.DATABASE_URL = antes;
    else delete process.env.DATABASE_URL;
  }
});

test("con DATABASE_URL fuera del build, una consulta que tira no rompe la visita", async () => {
  const antesUrl = process.env.DATABASE_URL;
  const antesFase = process.env.NEXT_PHASE;
  process.env.DATABASE_URL = "postgres://fake";
  delete process.env.NEXT_PHASE;
  try {
    const fila = await filaDe("inicio", async () => {
      throw new Error("Neon dormida");
    });
    assert.equal(fila, null);
  } finally {
    if (antesUrl !== undefined) process.env.DATABASE_URL = antesUrl;
    else delete process.env.DATABASE_URL;
    if (antesFase !== undefined) process.env.NEXT_PHASE = antesFase;
  }
});

test("con DATABASE_URL durante next build, una consulta que tira rompe el build (I-1)", async () => {
  const antesUrl = process.env.DATABASE_URL;
  const antesFase = process.env.NEXT_PHASE;
  process.env.DATABASE_URL = "postgres://fake";
  process.env.NEXT_PHASE = "phase-production-build";
  try {
    await assert.rejects(() =>
      filaDe("inicio", async () => {
        throw new Error("Neon dormida");
      }),
    );
  } finally {
    if (antesUrl !== undefined) process.env.DATABASE_URL = antesUrl;
    else delete process.env.DATABASE_URL;
    if (antesFase !== undefined) process.env.NEXT_PHASE = antesFase;
    else delete process.env.NEXT_PHASE;
  }
});
