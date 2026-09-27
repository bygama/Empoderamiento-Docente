import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validarRedireccion, type Contexto } from "@/lib/seo/redirecciones";
import { RUTAS_DE_LA_APP } from "./rutas";

// La declaración de rutas.ts contra lo que de verdad contesta el sitio: cada
// ruta de app/ y cada carpeta de public/ tiene que estar, y cada declarada
// tiene que existir. Una ruta sin declarar deja guardar una redirección que
// nunca se aplica, y la acción contesta «listo» igual (revisión de
// work/ajustes/, 2026-09-27).

const SITIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const APP = path.join(SITIO, "src/app");
const PUBLICO = path.join(SITIO, "public");

/** Lo de Next que no tiene carpeta en app/. */
const DE_NEXT = ["/_next/[[...todo]]"];

/** La ruta que Next arma con un archivo de app/, escrita como se declara; `null` si el archivo no arma una. */
function rutaDelArchivo(carpeta: string, archivo: string): string | null {
  const en = (nombre: string) => `${carpeta === "/" ? "" : carpeta}/${nombre}`;
  if (/^(page|route)\.[jt]sx?$/.test(archivo)) return carpeta;
  if (/^sitemap\.([jt]sx?|xml)$/.test(archivo)) return en("sitemap.xml");
  if (/^robots\.([jt]sx?|txt)$/.test(archivo)) return en("robots.txt");
  if (/^manifest\.([jt]sx?|json|webmanifest)$/.test(archivo)) return en("manifest.webmanifest");
  if (archivo === "favicon.ico") return en(archivo);
  // Las imágenes de metadatos: Next les suma un hash al nombre cuando están en un grupo.
  const imagen = archivo.match(/^((?:apple-)?icon|opengraph-image|twitter-image)\d*\.(\w+)$/);
  if (imagen) return en(`${imagen[1]}*${/^[jt]sx?$/.test(imagen[2]) ? "" : `.${imagen[2]}`}`);
  return null;
}

/** Las rutas de app/: los grupos «(sitio)» y las ranuras «@x» no suman segmento, y «_x» es privada. */
function rutasDeApp(dir = APP, carpeta = "/"): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isFile()) return [rutaDelArchivo(carpeta, e.name)].filter((r) => r !== null);
    if (!e.isDirectory() || e.name.startsWith("_")) return [];
    const sinSegmento = /^\(.*\)$/.test(e.name) || e.name.startsWith("@");
    return rutasDeApp(path.join(dir, e.name), sinSegmento ? carpeta : `${carpeta === "/" ? "" : carpeta}/${e.name}`);
  });
}

const TODO_ABAJO = /\/\[\[\.\.\.[^\]]+\]\]$/;

/** Si la declarada abarca esa ruta de app/: la misma, o una de abajo si termina en `[[...x]]`. */
function cubre(declarada: string, ruta: string): boolean {
  if (declarada === ruta) return true;
  if (!TODO_ABAJO.test(declarada)) return false;
  const raiz = declarada.replace(TODO_ABAJO, "");
  return ruta === raiz || ruta.startsWith(`${raiz}/`);
}

const archivosDe = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? archivosDe(path.join(dir, e.name)) : [e.name]));

const deApp = RUTAS_DE_LA_APP.filter((d) => d.contesta !== "archivos");

test("cada ruta de app/ está declarada en config/rutas.ts", () => {
  const rutas = rutasDeApp();
  assert.ok(rutas.includes("/novedades/[slug]") && rutas.includes("/sitemap.xml"), "el recorrido no encontró las rutas de siempre");
  const faltan = rutas.filter((r) => !deApp.some((d) => cubre(d.ruta, r)));
  assert.deepEqual(faltan, [], "Sumalas a RUTAS_DE_LA_APP: si no, Ajustes › SEO acepta una redirección desde ahí que nunca se aplica.");
});

test("cada carpeta de public/ está declarada, y lo que hay adentro son archivos con extensión", () => {
  const entradas = readdirSync(PUBLICO, { withFileTypes: true });
  const faltan = entradas
    .map((e) => ({ ruta: `/${e.name}`, contesta: e.isDirectory() ? "archivos" : "sola" }))
    .filter((esperada) => !RUTAS_DE_LA_APP.some((d) => d.ruta === esperada.ruta && d.contesta === esperada.contesta));
  assert.deepEqual(faltan, []);
  const sinExtension = entradas.filter((e) => e.isDirectory()).flatMap((e) => archivosDe(path.join(PUBLICO, e.name))).filter((a) => !/\.[A-Za-z0-9]+$/.test(a));
  assert.deepEqual(sinExtension, [], "una carpeta de archivos abarca solo lo que tiene extensión");
});

test("cada ruta declarada existe todavía", () => {
  const rutas = rutasDeApp();
  const carpetas = readdirSync(PUBLICO, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => `/${e.name}`);
  const sobran = RUTAS_DE_LA_APP.filter((d) =>
    d.contesta === "archivos" ? !carpetas.includes(d.ruta) : !DE_NEXT.includes(d.ruta) && !rutas.some((r) => cubre(d.ruta, r)),
  );
  assert.deepEqual(sobran, []);
});

// Con el CV cerrado: /sumate-al-equipo no está entre las páginas del sitemap.
const CONTEXTO: Contexto = { rutas: ["/", "/contacto", "/novedades", "/novedades/una-que-existe"], existentes: [], declaradas: RUTAS_DE_LA_APP };
const desde = (ruta: string) => validarRedireccion({ desde: ruta, hacia: "/contacto" }, CONTEXTO);

test("no acepta una redirección desde una ruta que el sitio contesta por su cuenta", () => {
  // Las cuatro de la revisión: contestaban «listo» y seguían dando 404 o 200.
  for (const ruta of ["/sumate-al-equipo", "/sitemap.xml", "/robots.txt", "/novedades/rss.xml"]) {
    assert.deepEqual(desde(ruta), { ok: false, campo: "desde", detalle: `«${ruta}» ya existe en el sitio: una redirección ahí nunca se aplicaría.` });
  }
  for (const ruta of ["/novedades/una-que-existe", "/novedades/otra/imagen-para-redes", "/admin", "/api/cv", "/_next/static/x.js", "/opengraph-image-1whei1.png", "/equipo/daniela-reyes.jpg"]) {
    assert.equal(desde(ruta).ok, false, ruta);
  }
});

test("acepta una redirección desde una ruta que cae en la atrapa-todo o en una ficha que no existe", () => {
  for (const ruta of ["/taller-2025", "/novedades/lo-viejo", "/quienes-somos/viejo", "/equipo", "/administracion"]) {
    assert.deepEqual(desde(ruta), { ok: true, redireccion: { desde: ruta, hacia: "/contacto" } });
  }
});
