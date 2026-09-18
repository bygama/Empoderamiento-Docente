// Compara el render de dos builds y dice si el sitio cambió. Existe porque «el
// sitio quedó igual» es la afirmación más fácil de declarar sin probar: un log
// pegado en un PROGRESS se pudre, esto se vuelve a correr.
//
//   node scripts/comparar-render.mjs <appAntes> <appDespues>
//
// Cada argumento es una carpeta de app con un `.next` ya buildeado (el script no
// buildea). Sale 1 si una página difiere en texto, links o <head> —lo que ve una
// persona o un buscador— o si desapareció. Los bytes de JS se informan pero NO
// hacen fallar: cambian por cómo el bundler reparte los chunks. Se muestran
// porque comparar solo el HTML no ve el bundle, y esa ceguera ya escondió dos
// cambios reales: la escisión de Payload y las clases del admin filtrándose al
// CSS del sitio.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const [antes, despues] = process.argv.slice(2);
if (!antes || !despues) {
  console.error("Uso: node scripts/comparar-render.mjs <appAntes> <appDespues>");
  process.exit(2);
}

const appDir = (app) => join(app, ".next", "server", "app");

/** Las páginas que el build dejó prerenderizadas, relativas a server/app. */
function paginas(app) {
  const raiz = appDir(app);
  if (!existsSync(raiz)) {
    console.error(`No hay build en ${raiz}. Corré \`pnpm build\` primero.`);
    process.exit(2);
  }
  const salida = [];
  const recorrer = (dir) => {
    for (const entrada of readdirSync(dir)) {
      const ruta = join(dir, entrada);
      if (statSync(ruta).isDirectory()) recorrer(ruta);
      else if (entrada.endsWith(".html")) salida.push(relative(raiz, ruta));
    }
  };
  recorrer(raiz);
  return salida.sort();
}

// El <script> se saca entero: adentro viaja el payload de React, con ids de
// módulo y de build distintos en cada corrida, que no son contenido.
const DIMENSIONES = {
  texto: (h) =>
    h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, "\n").replace(/\s+/g, " ").trim(),
  links: (h) =>
    [...h.matchAll(/href="([^"]*)"/g)]
      .map((m) => m[1])
      .filter((u) => !/^\/_next\/|\.(png|ico|woff2?|css)$/.test(u))
      .sort()
      .join("\n"),
  head: (h) =>
    [...h.matchAll(/<title>[^<]*<\/title>|<meta [^>]*>/g)]
      .map((m) => m[0])
      .filter((t) => !/charSet|viewport|next-size-adjust/.test(t))
      .sort()
      .join("\n"),
};

// Bytes de los activos de la página, cada uno contado una vez. **Incluye el
// CSS**, que Next también deja bajo `static/chunks/`: llamar a esto «js» ya hizo
// que un lector concluyera que el CSS no se medía.
function activos(app, html) {
  const chunks = new Set([...html.matchAll(/\/_next\/(static\/chunks\/[^"]+)/g)].map((m) => m[1]));
  let bytes = 0;
  for (const c of chunks) {
    if (existsSync(join(app, ".next", c))) bytes += statSync(join(app, ".next", c)).size;
  }
  return { cuantos: chunks.size, bytes };
}

const deA = new Set(paginas(antes));
const deB = new Set(paginas(despues));
let fallo = false;

// Que una página DESAPAREZCA es una regresión: se perdió una URL. Que aparezca
// es normal en toda fase que sume pantallas, así que se informa y no frena.
for (const p of [...deA].filter((x) => !deB.has(x))) {
  fallo = true;
  console.log(`  ${p}: DESAPARECIÓ`);
}
for (const p of [...deB].filter((x) => !deA.has(x))) console.log(`  ${p}: nueva`);

for (const p of [...deA].filter((x) => deB.has(x))) {
  const a = readFileSync(join(appDir(antes), p), "utf8");
  const b = readFileSync(join(appDir(despues), p), "utf8");
  const distintas = Object.keys(DIMENSIONES).filter((k) => DIMENSIONES[k](a) !== DIMENSIONES[k](b));
  const ja = activos(antes, a);
  const jb = activos(despues, b);
  const delta = jb.bytes - ja.bytes;
  const resumen = `${ja.cuantos}→${jb.cuantos} activos (js+css), ${delta >= 0 ? "+" : ""}${delta} bytes`;
  if (distintas.length > 0) fallo = true;
  const estado = distintas.length > 0 ? `DISTINTA en ${distintas.join(", ")}` : "igual";
  console.log(`  ${p}: ${estado} — ${resumen}`);
}

console.log(fallo ? "\nHay diferencias de render." : `\n${deA.size} páginas, render idéntico.`);
process.exit(fallo ? 1 : 0);
