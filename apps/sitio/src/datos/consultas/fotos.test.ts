import { test } from "node:test";
import assert from "node:assert/strict";
import type { Foto } from "@/../prisma/generado/client";
import type { Uso } from "@/datos/fotos/uso";
import { esDelRepositorio, grillaDe } from "./fotos";

const foto = (id: string, alt: string, subidaEn: string): Foto => ({
  id,
  url: `/fotos/${id}.webp`,
  alt,
  ancho: 1600,
  alto: 1200,
  bytes: 1000,
  tipo: "image/webp",
  subidaEn: new Date(subidaEn),
  subidaPor: null,
});

const uso = (src: string): Uso => ({ src, donde: "Inicio › Hero", enlace: "/admin", en: "sitio", alt: "x" });

const filas = [foto("a", "Una", "2026-09-01"), foto("b", "", "2026-09-20"), foto("c", "Otra", "2026-09-01")];
const usos = new Map([["/fotos/a.webp", [uso("/fotos/a.webp"), uso("/fotos/a.webp")]]]);

test("la grilla va de la más nueva a la más vieja, y cuenta cada filtro", () => {
  const { fotos, cuentas } = grillaDe(filas, usos, "todas");
  assert.deepEqual(
    fotos.map((f) => [f.id, f.usos]),
    [
      ["b", 0],
      ["a", 2],
      ["c", 0],
    ],
  );
  assert.deepEqual(cuentas, { todas: 3, "sin-alt": 1, "sin-usar": 2 });
});

test("los filtros: sin texto alternativo, y sin usar", () => {
  assert.deepEqual(grillaDe(filas, usos, "sin-alt").fotos.map((f) => f.id), ["b"]);
  assert.deepEqual(grillaDe(filas, usos, "sin-usar").fotos.map((f) => f.id), ["b", "c"]);
});

test("una foto de public/ es del repositorio; una subida, no", () => {
  assert.equal(esDelRepositorio("/fotos/aula.webp"), true);
  assert.equal(esDelRepositorio("/aliados/techint.svg"), true);
  assert.equal(esDelRepositorio("/api/fotos/0f0e0d0c-0b0a-4908-8706-050403020100"), false);
  assert.equal(esDelRepositorio("https://x.public.blob.vercel-storage.com/fotos/a.webp"), false);
});
