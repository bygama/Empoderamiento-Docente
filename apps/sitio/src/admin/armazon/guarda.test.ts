import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUEDE, ROLES, type Capacidad } from "@ed/auth";
import { MODULOS } from "./barra-lateral/modulos";

// Cada módulo del admin pasa por su guarda, con la capacidad que le da
// `modulos.ts`: la misma que decide si aparece en la sidebar. Este test es lo
// que hace que un módulo nuevo no pueda olvidarse de ella, como
// `acciones-con-sesion.test.ts` hace con la sesión de cada acción.

const PROTEGIDO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../app/(admin)/admin/(protegido)");

/** Las carpetas de `(protegido)/` que no son un módulo de la sidebar, con su motivo. */
const SIN_GUARDA: Record<string, string> = {
  "mi-cuenta": "la cuenta propia es de toda sesión, como el Inicio: no hay rol que no la tenga",
};

/** El código sin comentarios: una guarda comentada no es una guarda. */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/** Lo que está mal en el layout de un módulo que pide `capacidad`. */
function problemasDelLayout(fuente: string | null, capacidad: string | undefined): string[] {
  if (fuente === null) return ["no tiene layout.tsx"];
  const llamada = sinComentarios(fuente).match(/<Guarda\s+capacidad="(\w+)"/);
  if (!llamada) return ["su layout no llama a <Guarda capacidad=…>"];
  if (llamada[1] !== capacidad) return [`su layout pide «${llamada[1]}» y modulos.ts dice «${capacidad ?? "ninguna"}»`];
  return [];
}

const carpetas = () =>
  readdirSync(PROTEGIDO, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("[") && !e.name.startsWith("("))
    .map((e) => e.name);

test("el chequeo encuentra un layout sin guarda y uno con otra capacidad", () => {
  assert.deepEqual(problemasDelLayout(null, "usarCuentas"), ["no tiene layout.tsx"]);
  assert.deepEqual(problemasDelLayout(`// <Guarda capacidad="usarCuentas">\nexport default ({ children }) => children;`, "usarCuentas"), [
    "su layout no llama a <Guarda capacidad=…>",
  ]);
  assert.deepEqual(problemasDelLayout(`<Guarda capacidad="verMetricas">{children}</Guarda>`, "usarCuentas"), [
    "su layout pide «verMetricas» y modulos.ts dice «usarCuentas»",
  ]);
});

test("cada módulo con carpeta propia pasa por su guarda, con la capacidad de modulos.ts", () => {
  const encontradas = carpetas();
  assert.ok(encontradas.length > 0, "no encontró ninguna carpeta en (protegido)/: el recorrido está roto");
  for (const carpeta of encontradas) {
    if (Object.hasOwn(SIN_GUARDA, carpeta)) continue;
    const modulo = MODULOS.find((m) => m.segmentos.includes(carpeta));
    assert.ok(modulo, `${carpeta}/ no es un módulo de modulos.ts: sumalo ahí con su capacidad, o a SIN_GUARDA con el motivo`);
    const layout = path.join(PROTEGIDO, carpeta, "layout.tsx");
    const fuente = existsSync(layout) ? readFileSync(layout, "utf8") : null;
    assert.deepEqual(problemasDelLayout(fuente, modulo.capacidad), [], `${carpeta}/`);
  }
});

test("los módulos que todavía son una guía pasan por la misma guarda", () => {
  const fuente = sinComentarios(readFileSync(path.join(PROTEGIDO, "[modulo]", "page.tsx"), "utf8"));
  assert.match(fuente, /<Guarda\s+capacidad=\{capacidad\}/);
  assert.match(fuente, /moduloDe\(modulo\)\?\.capacidad/);
});

test("cada excepción apunta a una carpeta que existe", () => {
  for (const carpeta of Object.keys(SIN_GUARDA)) {
    assert.ok(carpetas().includes(carpeta), `${carpeta}/ ya no existe: sacala de SIN_GUARDA`);
  }
});

// La guarda del layout solo oculta la interfaz: Next dibuja el layout y la
// página en paralelo, y la página viaja en el payload aunque el layout muestre
// «Sin permiso». Así se filtraban las cuentas a quien edita (revisión de
// work/cuentas/). Por eso toda página de un módulo cuya capacidad deja afuera a
// algún rol la chequea ella misma, antes de leer nada: hoy Cuentas y la bandeja
// de CV; el día que Ajustes tenga páginas, este test se las pide sin tocarlo.

/** Las carpetas cuya capacidad depende de la ruta: la expresión que la calcula, con su motivo. */
const CAPACIDAD_DE_LA_RUTA: Record<string, { expresion: string; motivo: string }> = {
  "mensajes/[bandeja]": {
    expresion: "capacidadDe(bandeja)",
    motivo: "Contacto y CV son la misma pantalla; el módulo lo ven todos, CV no",
  },
};

/** Si una capacidad deja afuera a algún rol: las que tienen algo que proteger. */
const restringe = (capacidad: Capacidad) => PUEDE[capacidad].length < ROLES.length;

/** Las `page.tsx` debajo de una carpeta de `(protegido)/`, con la ruta desde ahí. */
function paginasDe(carpeta: string): string[] {
  return readdirSync(path.join(PROTEGIDO, carpeta), { recursive: true, encoding: "utf8" })
    .filter((archivo) => path.basename(archivo) === "page.tsx")
    .map((archivo) => path.join(carpeta, archivo).split(path.sep).join("/"));
}

/**
 * Lo que está mal en una página que tiene que chequear `capacidad` (tal como se
 * escribe: `"usarCuentas"`, o `capacidadDe(bandeja)`): que no la chequee, o que
 * llame a una consulta de `datos/` antes. Vale `puede(…, capacidad)` o
 * envolver lo que lee en `<Guarda capacidad=…>`.
 */
function problemasDeLaPagina(fuente: string, capacidad: string): string[] {
  const codigo = sinComentarios(fuente);
  const cuerpo = codigo.slice(Math.max(0, codigo.indexOf("export default")));
  const literal = capacidad.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const chequeo = cuerpo.search(new RegExp(`puede\\([^;]*?,\\s*${literal}\\s*\\)|<Guarda\\s+capacidad=\\{?${literal}\\}?`));
  if (chequeo < 0) return [`no chequea ${capacidad}`];
  const consultas = [...codigo.matchAll(/import\s*\{([^}]*)\}\s*from\s*"@\/datos\/consultas\/[^"]+"/g)].flatMap(([, nombres]) =>
    nombres.split(",").map((nombre) => nombre.replace(/^\s*type\s+/, "").trim()).filter(Boolean),
  );
  const lectura = consultas.length ? cuerpo.search(new RegExp(`\\b(${consultas.join("|")})\\(`)) : -1;
  if (lectura >= 0 && lectura < chequeo) return [`lee de datos/ antes de chequear ${capacidad}`];
  return [];
}

test("el chequeo de una página encuentra la que no chequea, la que chequea otra cosa y la que lee antes", () => {
  const leer = 'import { listarCuentas } from "@/datos/consultas/cuentas";\n';
  const cuentas = '"usarCuentas"';
  const no = ['no chequea "usarCuentas"'];
  assert.deepEqual(problemasDeLaPagina(`${leer}export default async function P() { return listarCuentas(rol); }`, cuentas), no);
  assert.deepEqual(problemasDeLaPagina(`export default async function P() {\n  // if (!puede(rol, "usarCuentas")) return null;\n}`, cuentas), no);
  assert.deepEqual(problemasDeLaPagina(`export default async function P() { if (!puede(rol, "verMetricas")) return null; }`, cuentas), no);
  assert.deepEqual(problemasDeLaPagina(`${leer}export default async function P() { const c = await listarCuentas(rol); if (!puede(rol, "usarCuentas")) return null; }`, cuentas), [
    'lee de datos/ antes de chequear "usarCuentas"',
  ]);
  assert.deepEqual(problemasDeLaPagina(`${leer}export default async function P() { if (!puede(rol, "usarCuentas")) return null; return listarCuentas(rol); }`, cuentas), []);
  assert.deepEqual(problemasDeLaPagina(`export default function P() { return <Guarda capacidad={capacidadDe(bandeja)}><B /></Guarda>; }`, "capacidadDe(bandeja)"), []);
});

test("cada página de un módulo que deja afuera a algún rol chequea su capacidad antes de leer", () => {
  const revisadas: string[] = [];
  for (const carpeta of carpetas()) {
    const capacidad = MODULOS.find((m) => m.segmentos.includes(carpeta))?.capacidad;
    if (!capacidad || !restringe(capacidad)) continue;
    for (const pagina of paginasDe(carpeta)) {
      assert.deepEqual(problemasDeLaPagina(readFileSync(path.join(PROTEGIDO, pagina), "utf8"), `"${capacidad}"`), [], pagina);
      revisadas.push(pagina);
    }
  }
  assert.ok(revisadas.includes("cuentas/page.tsx"), "no revisó la página de Cuentas: el recorrido está roto");
});

test("las páginas cuya capacidad depende de la ruta la chequean ellas mismas", () => {
  for (const [carpeta, { expresion }] of Object.entries(CAPACIDAD_DE_LA_RUTA)) {
    const paginas = paginasDe(carpeta);
    assert.ok(paginas.length > 0, `${carpeta}/ no tiene páginas: sacala de CAPACIDAD_DE_LA_RUTA`);
    for (const pagina of paginas) {
      assert.deepEqual(problemasDeLaPagina(readFileSync(path.join(PROTEGIDO, pagina), "utf8"), expresion), [], pagina);
    }
  }
});
