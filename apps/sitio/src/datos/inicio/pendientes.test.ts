import { test } from "node:test";
import assert from "node:assert/strict";
import { filasDePendientes, type Pendiente } from "./pendientes";

// El registro de pendientes, con filas falsas: el orden, el filtro por
// capacidad y el aislamiento no necesitan base.

const fila = (urgencia: Pendiente["urgencia"], leer: Pendiente["leer"], capacidad: Pendiente["capacidad"] = "editarContenido"): Pendiente => ({
  urgencia,
  capacidad,
  que: "lo de prueba",
  href: "/admin/prueba",
  accion: "Ir",
  leer,
});

const hay = (titulo: string) => async () => ({ titulo });

test("van de la más urgente a la menos, y a igual urgencia en el orden del registro", async () => {
  const filas = await filasDePendientes(
    {
      conectar: fila("sin-conectar", hay("Conectá")),
      borradorA: fila("sin-publicar", hay("Borrador A")),
      espera: fila("alguien-espera", hay("Te escribieron")),
      borradorB: fila("sin-publicar", hay("Borrador B")),
    },
    "administra",
  );
  assert.deepEqual(
    filas.map((f) => f.clave),
    ["espera", "borradorA", "borradorB", "conectar"],
  );
});

test("una fila que el rol no puede ver no aparece, y su consulta no se corre", async () => {
  let consultada = false;
  const filas = await filasDePendientes(
    {
      paginas: fila("sin-publicar", hay("Páginas")),
      conexion: fila(
        "sin-conectar",
        async () => {
          consultada = true;
          return { titulo: "Conectá" };
        },
        "configurarConexiones",
      ),
    },
    "edita",
  );
  assert.deepEqual(
    filas.map((f) => f.clave),
    ["paginas"],
  );
  assert.equal(consultada, false);
});

test("una fila sin nada pendiente no aparece", async () => {
  const filas = await filasDePendientes({ vacia: fila("sin-publicar", async () => null), llena: fila("a-corregir", hay("Algo roto")) }, "dirige");
  assert.deepEqual(
    filas.map((f) => f.clave),
    ["llena"],
  );
});

test("una fila cuya consulta tira dice que no se pudo revisar, y las demás siguen", async () => {
  const errorOriginal = console.error;
  console.error = () => {};
  try {
    const filas = await filasDePendientes(
      {
        rota: fila("alguien-espera", async () => {
          throw new Error("la base no contesta");
        }),
        bien: fila("sin-publicar", hay("Páginas")),
      },
      "administra",
    );
    assert.deepEqual(filas, [
      { clave: "rota", href: "/admin/prueba", accion: "Ir", titulo: "No se pudo revisar lo de prueba", detalle: "Probá recargar la página.", fallo: true },
      { clave: "bien", href: "/admin/prueba", accion: "Ir", titulo: "Páginas", fallo: false },
    ]);
  } finally {
    console.error = errorOriginal;
  }
});
