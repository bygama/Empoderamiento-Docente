import { test } from "node:test";
import assert from "node:assert/strict";
import type { Caso as Fila } from "@/../prisma/generado/client";
import { casosVisibles } from "./casos";

// Lo que ve el sitio de los casos: solo los de `CASOS_FIJOS`, en el orden de
// la pila y con el tinte de su número. Una fila que quedó en la base sin estar
// en la lista (el 02 y el 03, que salieron con `casos_que_quedan`) no llega a
// la pantalla, ni siquiera en una base que todavía no corrió esa migración.

function fila(id: string, numero: string): Fila {
  return {
    id,
    numero,
    slug: `un-caso-${numero}`,
    pregunta: "¿Qué pasa cuando un equipo docente problematiza lo que enseña?",
    eje: "Desarrollo profesional docente",
    indicio: "Una frase corta",
    periodo: "2025",
    ambito: "Secundaria",
    estado: "EN CURSO",
    contexto: "Un contexto.",
    preguntaInvestigacion: "¿Una pregunta?",
    lamina: { foto: { src: "/investigacion/caso-01-lamina.webp", alt: "Una lámina", foco: { x: 0.5, y: 0.5 } }, sujecion: "clip", rotulo: "LÁMINA 01" },
    evidencias: [{ titulo: "SEMINARIOS", descripcion: "Una descripción.", movible: true }],
    analisis: "Un análisis.",
    aprendizaje: "Lo que se aprendió.",
    queCambio: "Lo que cambió.",
    produccionRelacionada: [{ titulo: "Un artículo", href: "/biblioteca" }],
    esDemo: false,
    aclaracion: null,
    publicadoEn: new Date(),
    publicadoPor: null,
    borrador: null,
    borradorEn: null,
    borradorPor: null,
  };
}

const deLaPila = (filas: Fila[]) => casosVisibles(filas, false).map((c) => [c.id, c.numero, c.tinte]);

test("al sitio llegan solo los casos fijos, en el orden de la pila y con el tinte de su número", () => {
  // Con la migración: el caso-04 es el 02, y una fila suelta no sale.
  assert.deepEqual(deLaPila([fila("caso-04", "02"), fila("caso-03", "03"), fila("caso-01", "01")]), [
    ["caso-01", "01", "navy"],
    ["caso-04", "02", "medio"],
  ]);
  // Sin la migración: el 02 y el 03 siguen en la base, pero el sitio no los muestra.
  assert.deepEqual(deLaPila([fila("caso-01", "01"), fila("caso-02", "02"), fila("caso-03", "03"), fila("caso-04", "04")]), [
    ["caso-01", "01", "navy"],
    ["caso-04", "04", "verde"],
  ]);
});
