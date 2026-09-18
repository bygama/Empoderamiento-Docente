// Compara el render de dos builds y dice si el sitio cambió.
//
// Existe porque «el sitio quedó igual» es la afirmación más fácil de declarar
// sin probar. Un log pegado en un PROGRESS se pudre; esto se vuelve a correr.
//
//   node scripts/comparar-render.mjs <appAntes> <appDespues>
//
// Cada argumento es una carpeta de app con un `.next` ya buildeado (los dos
// builds tienen que existir; el script no buildea). Sale 1 si alguna página
// difiere en texto, links o <head> — lo que ve una persona o un buscador.
//
// Los bytes de JS se informan pero NO hacen fallar: cambian por cómo el
// bundler reparte los chunks, sin que cambie una línea de código. Se muestran
// porque comparar solo el HTML no ve el bundle, y esa ceguera ya escondió un
// cambio real una vez (la escisión de Payload: un chunk más por página y
// ~1,9 KB menos en cada una).

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const [antes, despues] = process.argv.slice(2);
if (!antes || !despues) {
  console.error("Uso: node scripts/comparar-render.mjs <appAntes> <appDespues>");
  process.exit(2);
}

/** Las páginas que el build dejó prerenderizadas, relativas a server/app. */
function paginas(app) {
  const raiz = join(app, ".next", "server", "app");
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

// El <script> se saca entero: adentro viaja el payload de React, que lleva
// ids de módulo y de build distintos en cada corrida y no es contenido.
const texto = (h) =>
  h
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]*>/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

const links = (h) =>
  [...h.matchAll(/href="([^"]*)"/g)]
    .map((m) => m[1])
    .filter((u) => !/^\/_next\/|\.(png|ico|woff2?|css)$/.test(u))
    .sort()
    .join("\n");

const cabeza = (h) =>
  [...h.matchAll(/<title>[^<]*<\/title>|<meta [^>]*>/g)]
    .map((m) => m[0])
    .filter((t) => !/charSet|viewport|next-size-adjust/.test(t))
    .sort()
    .join("\n");

/** Bytes de los chunks que la página pide, sumados una sola vez cada uno. */
function bytesJs(app, html) {
  const chunks = new Set([...html.matchAll(/\/_next\/(static\/chunks\/[^"]+)/g)].map((m) => m[1]));
  let total = 0;
  for (const c of chunks) {
    const ruta = join(app, ".next", c);
    if (existsSync(ruta)) total += statSync(ruta).size;
  }
  return { cuantos: chunks.size, bytes: total };
}

const deA = new Set(paginas(antes));
const deB = new Set(paginas(despues));
const soloA = [...deA].filter((p) => !deB.has(p));
const soloB = [...deB].filter((p) => !deA.has(p));
let fallo = soloA.length > 0 || soloB.length > 0;
for (const p of soloA) console.log(`  ${p}: SOLO en el build de antes`);
for (const p of soloB) console.log(`  ${p}: SOLO en el build de después`);

for (const p of [...deA].filter((x) => deB.has(x))) {
  const a = readFileSync(join(antes, ".next", "server", "app", p), "utf8");
  const b = readFileSync(join(despues, ".next", "server", "app", p), "utf8");
  const distintas = ["texto", "links", "head"].filter(
    (k) => ({ texto, links, head: cabeza })[k](a) !== ({ texto, links, head: cabeza })[k](b),
  );
  const ja = bytesJs(antes, a);
  const jb = bytesJs(despues, b);
  const delta = jb.bytes - ja.bytes;
  const js = `js ${ja.cuantos}→${jb.cuantos} chunks, ${delta >= 0 ? "+" : ""}${delta} bytes`;
  if (distintas.length > 0) {
    fallo = true;
    console.log(`  ${p}: DISTINTA en ${distintas.join(", ")} — ${js}`);
  } else {
    console.log(`  ${p}: igual — ${js}`);
  }
}

console.log(fallo ? "\nHay diferencias de render." : `\n${deA.size} páginas, render idéntico.`);
process.exit(fallo ? 1 : 0);
