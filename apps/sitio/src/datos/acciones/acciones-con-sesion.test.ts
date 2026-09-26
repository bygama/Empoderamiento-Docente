import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// AGENTS.md §12: toda Server Action del admin empieza por
// `auth.api.getSession`. El proxy deja pasar las acciones sin cookie (un
// redirect no es una respuesta válida para una acción) y el layout protegido
// no las cubre, así que la sesión la verifica cada acción o nadie. Este test
// es lo que hace que la regla no dependa de acordarse.
//
// Y justo después de la sesión, su capacidad: `puede(rol, "…")`
// (`@ed/auth`, permisos.ts). La guarda del layout de un módulo tampoco cubre
// sus acciones, así que el permiso también lo verifica cada acción o nadie.

/**
 * Las acciones que no piden sesión a propósito, por archivo y por nombre, con
 * su motivo. Por nombre y no por archivo: una acción nueva en el mismo archivo
 * no queda exceptuada sin que nadie lo decida.
 */
const SIN_SESION: Record<string, { acciones: string[]; motivo: string }> = {
  "datos/acciones/salir-de-vista-previa.ts": {
    acciones: ["salirDeVistaPrevia", "apagarVistaPrevia"],
    motivo: "apagan una cookie que es de quien la tiene: quien ya salió del admin también tiene que poder salir del borrador",
  },
};

/**
 * Las acciones con sesión que todavía no chequean su capacidad, por archivo y
 * por nombre, con su motivo. Son de lanes en vuelo que esta no podía tocar:
 * la dueña suma el `puede(…)` al rebasear y saca su línea de acá.
 */
const SIN_CAPACIDAD: Record<string, { acciones: string[]; motivo: string }> = {
  "datos/acciones/mi-cuenta.ts": {
    acciones: ["cambiarMiNombre"],
    motivo: "es la cuenta propia: la tiene todo rol con sesión, como el Inicio (SPEC de roles-y-actividad §3)",
  },
  "datos/acciones/paginas.ts": {
    acciones: ["guardarBorrador", "publicar", "descartarBorrador"],
    motivo: "es de la lane paginas-inicio (4a): suma puede(…, \"editarContenido\") y el registro de actividad al rebasear sobre roles-y-actividad",
  },
  "datos/acciones/fotos.ts": {
    acciones: ["subirFoto"],
    motivo: "es de la lane paginas-inicio (4a): suma puede(…, \"editarContenido\") y el registro de actividad al rebasear sobre roles-y-actividad",
  },
  "datos/acciones/actualizar-metricas.ts": {
    acciones: ["actualizarMetricasAhora"],
    motivo: "es de la lane busquedas-de-google (5): suma puede(…, \"verMetricas\") al rebasear sobre roles-y-actividad",
  },
};

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** El código sin comentarios: una llamada comentada no es una llamada. Respeta el `//` de una URL. */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/** Las funciones exportadas de un archivo, con su cuerpo (hasta la primera llave que cierra en la columna 0). */
function exportadas(fuente: string): Array<{ nombre: string; cuerpo: string }> {
  return fuente
    .split(/^export async function /m)
    .slice(1)
    .map((parte) => ({ nombre: parte.slice(0, parte.indexOf("(")), cuerpo: parte.slice(0, parte.search(/^\}/m)) }));
}

/**
 * Lo que está mal en un archivo con «use server»: cada función exportada
 * tiene que empezar por `auth.api.getSession` —el primer `await` es esa
 * llamada, y nada toca `base.` antes—, y no se exporta otra cosa que
 * funciones y tipos (una acción como `const` escaparía a este chequeo).
 */
function problemasDe(fuente: string, exceptuadas: string[] = []): string[] {
  const codigo = sinComentarios(fuente);
  const problemas: string[] = [];
  for (const [, exportado] of codigo.matchAll(/^export (?!async function |type )(.*)$/gm)) {
    problemas.push(`exporta algo que no es una función ni un tipo: «export ${exportado.trim()}»`);
  }
  for (const { nombre, cuerpo } of exportadas(codigo)) {
    if (exceptuadas.includes(nombre)) continue;
    const sesion = cuerpo.indexOf("await auth.api.getSession(");
    const primeraBase = cuerpo.search(/\bbase\./);
    if (sesion === -1) problemas.push(`${nombre} no llama a auth.api.getSession`);
    else if (sesion !== cuerpo.search(/\bawait\b/) || (primeraBase !== -1 && primeraBase < sesion)) {
      problemas.push(`${nombre} hace algo antes de auth.api.getSession`);
    }
  }
  return problemas;
}

/**
 * Las acciones que miran la sesión y no chequean su capacidad justo después:
 * entre el final de la llamada a la sesión y `puede(` no hay otro `await` ni
 * un `base.`. Las que no miran la sesión ya las encuentra `problemasDe`.
 */
function problemasDeCapacidad(fuente: string, exceptuadas: string[] = []): string[] {
  const problemas: string[] = [];
  for (const { nombre, cuerpo } of exportadas(sinComentarios(fuente))) {
    const sesion = cuerpo.indexOf("await auth.api.getSession(");
    if (exceptuadas.includes(nombre) || sesion === -1) continue;
    const finDeLaSesion = cuerpo.indexOf(";", sesion);
    const permiso = cuerpo.slice(finDeLaSesion).search(/\bpuede\(/);
    if (permiso === -1) problemas.push(`${nombre} no chequea su capacidad con puede(…)`);
    else if (/\bawait\b|\bbase\./.test(cuerpo.slice(finDeLaSesion, finDeLaSesion + permiso))) {
      problemas.push(`${nombre} hace algo antes de chequear su capacidad`);
    }
  }
  return problemas;
}

function archivosDe(carpeta: string): string[] {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(carpeta, e.name);
    if (e.isDirectory()) return archivosDe(ruta);
    return /\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) ? [ruta] : [];
  });
}

/** Cada archivo de src/ que declara «use server», con su ruta relativa a src/ en barras normales. */
function archivosDeAcciones(): Array<{ relativa: string; fuente: string }> {
  return archivosDe(SRC)
    .map((ruta) => ({ relativa: path.relative(SRC, ruta).split(path.sep).join("/"), fuente: readFileSync(ruta, "utf8") }))
    .filter(({ fuente }) => /["']use server["']/.test(fuente));
}

test("el chequeo encuentra una acción sin sesión", () => {
  const fuente = `"use server";\n\nexport async function publicar(slug: string) {\n  return base.pagina.update({ where: { slug } });\n}\n`;
  assert.deepEqual(problemasDe(fuente), ["publicar no llama a auth.api.getSession"]);
});

test("el chequeo no mira la sesión de la función que sigue", () => {
  const fuente = `"use server";\n\nexport async function a() {\n  return 1;\n}\n\nexport async function b() {\n  const sesion = await auth.api.getSession({ headers: await headers() });\n}\n`;
  assert.deepEqual(problemasDe(fuente), ["a no llama a auth.api.getSession"]);
});

test("el chequeo no deja pasar una acción exportada como const", () => {
  const fuente = `"use server";\n\nexport const borrar = async () => {\n  return 1;\n};\n`;
  assert.equal(problemasDe(fuente).length, 1);
});

test("el chequeo no cuenta una llamada comentada", () => {
  const fuente = `"use server";\n\nexport async function publicar() {\n  const sesion = { user: { name: "nadie" } }; // auth.api.getSession( ya no se llama\n  /* await auth.api.getSession({ headers: await headers() }); */\n  return sesion;\n}\n`;
  assert.deepEqual(problemasDe(fuente), ["publicar no llama a auth.api.getSession"]);
});

test("el chequeo encuentra una acción que escribe antes de mirar la sesión", () => {
  const conAwait = `"use server";\n\nexport async function publicar() {\n  await base.pagina.deleteMany();\n  const sesion = await auth.api.getSession({ headers: await headers() });\n}\n`;
  const sinAwait = `"use server";\n\nexport async function publicar() {\n  void base.pagina.deleteMany();\n  const sesion = await auth.api.getSession({ headers: await headers() });\n}\n`;
  assert.deepEqual(problemasDe(conAwait), ["publicar hace algo antes de auth.api.getSession"]);
  assert.deepEqual(problemasDe(sinAwait), ["publicar hace algo antes de auth.api.getSession"]);
});

test("una excepción vale para su acción y no para las otras del archivo", () => {
  const fuente = `"use server";\n\nexport async function apagar() {\n  return 1;\n}\n\nexport async function borrar() {\n  return 2;\n}\n`;
  assert.deepEqual(problemasDe(fuente, ["apagar"]), ["borrar no llama a auth.api.getSession"]);
});

const SESION = "  const sesion = await auth.api.getSession({ headers: await headers() });\n  if (!sesion) return { ok: false };\n";

test("el chequeo de capacidad encuentra una acción que no la mira", () => {
  const fuente = `"use server";\n\nexport async function publicar() {\n${SESION}  return base.pagina.update({});\n}\n`;
  assert.deepEqual(problemasDeCapacidad(fuente), ["publicar no chequea su capacidad con puede(…)"]);
});

test("el chequeo de capacidad encuentra una acción que escribe antes de mirarla", () => {
  const fuente = `"use server";\n\nexport async function publicar() {\n${SESION}  await base.pagina.update({});\n  if (!puede(sesion.user.rol, "editarContenido")) return { ok: false };\n}\n`;
  assert.deepEqual(problemasDeCapacidad(fuente), ["publicar hace algo antes de chequear su capacidad"]);
});

test("el chequeo de capacidad deja pasar la que la mira justo después de la sesión", () => {
  const fuente = `"use server";\n\nexport async function publicar() {\n${SESION}  if (!puede(sesion.user.rol, "editarContenido")) return { ok: false };\n  return base.pagina.update({});\n}\n`;
  assert.deepEqual(problemasDeCapacidad(fuente), []);
});

test("toda Server Action de la app vive en datos/acciones/ y empieza por la sesión", () => {
  const acciones = archivosDeAcciones();
  assert.ok(acciones.length > 0, "no encontró ningún archivo «use server»: el recorrido de src/ está roto");
  for (const { relativa, fuente } of acciones) {
    assert.ok(relativa.startsWith("datos/acciones/"), `${relativa} declara «use server» fuera de datos/acciones/ (AGENTS.md §12)`);
    assert.ok(fuente.trimStart().startsWith('"use server"'), `${relativa}: «use server» va arriba del archivo, no adentro de una función`);
    assert.deepEqual(problemasDe(fuente, SIN_SESION[relativa]?.acciones), [], `${relativa}`);
  }
});

test("toda Server Action con sesión chequea su capacidad justo después", () => {
  for (const { relativa, fuente } of archivosDeAcciones()) {
    assert.deepEqual(problemasDeCapacidad(fuente, SIN_CAPACIDAD[relativa]?.acciones), [], `${relativa}`);
  }
});

test("cada excepción apunta a una acción que existe", () => {
  const acciones = new Map(archivosDeAcciones().map((a) => [a.relativa, a.fuente]));
  for (const [lista, excepciones] of Object.entries({ SIN_SESION, SIN_CAPACIDAD })) {
    for (const [relativa, { acciones: nombres }] of Object.entries(excepciones)) {
      const fuente = acciones.get(relativa);
      assert.ok(fuente, `${relativa} ya no es un archivo de acciones: sacalo de ${lista}`);
      const existentes = exportadas(sinComentarios(fuente)).map((f) => f.nombre);
      for (const nombre of nombres) assert.ok(existentes.includes(nombre), `${relativa} › ${nombre} ya no existe: sacalo de ${lista}`);
    }
  }
});

test("una excepción de capacidad es de una acción que todavía no la chequea", () => {
  const acciones = new Map(archivosDeAcciones().map((a) => [a.relativa, a.fuente]));
  for (const [relativa, { acciones: nombres }] of Object.entries(SIN_CAPACIDAD)) {
    const sinChequeo = problemasDeCapacidad(acciones.get(relativa) ?? "");
    for (const nombre of nombres) {
      assert.ok(sinChequeo.some((p) => p.startsWith(`${nombre} `)), `${relativa} › ${nombre} ya chequea su capacidad: sacala de SIN_CAPACIDAD`);
    }
  }
});
