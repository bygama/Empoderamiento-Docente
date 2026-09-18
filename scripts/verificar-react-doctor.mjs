/**
 * Verifica que react-doctor dé 100/100 sin diagnósticos, en TODOS los
 * proyectos del workspace.
 *
 * Se usa desde `.githooks/pre-push`, y distingue tres desenlaces:
 *
 *  - 100/100 y cero diagnósticos en cada proyecto → exit 0, el push sigue.
 *  - Hay hallazgos, o la medición vino incompleta → exit 1, el push se frena
 *    con la lista en pantalla.
 *  - No se pudo correr (npm caído, sin red, pnpm ausente) → exit 0 con aviso.
 *    Un registry caído no es un problema del código y no tiene por qué
 *    bloquear a nadie.
 *
 * Se mide por `--json` y no por el código de salida del comando: react-doctor
 * sale != 0 solo cuando encuentra ERRORES, así que un warning pasaría de
 * largo. Acá el criterio es el del proyecto: score 100 y CERO diagnósticos.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Los proyectos que el gate TIENE que medir; crece con cada app nueva.
 *
 * No está solo para armar el comando: si uno no aparece en el informe, la
 * medición está incompleta y el push se frena. Sin eso, un informe con un
 * proyecto de menos se leería igual que «cero hallazgos». El alcance vive
 * acá y en el script del package.json, a la vista, nunca en un
 * `doctor.config.*` (AGENTS.md §5.8).
 */
const PROYECTOS = ["apps/sitio/src"];

const AZUL = "\x1b[1m";
const GRIS = "\x1b[2m";
const ROJO = "\x1b[31m";
const VERDE = "\x1b[32m";
const FIN = "\x1b[0m";

let salida;
try {
  salida = execFileSync(
    "pnpm",
    ["dlx", "react-doctor", "--no-supply-chain", "--json", "--project", PROYECTOS.join(",")],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], shell: process.platform === "win32" },
  );
} catch (e) {
  // El comando sale != 0 cuando ENCUENTRA errores: eso no es una falla de
  // ejecución y su stdout sirve igual.
  salida = e?.stdout ?? "";
}

let informe;
try {
  informe = JSON.parse(salida);
} catch {
  // Dos desenlaces muy distintos, y confundirlos es lo que convierte un gate
  // en decoración:
  //
  //  - stdout vacío → el comando no llegó a correr (sin red, registry caído,
  //    pnpm ausente). No es un problema del código y no frena a nadie.
  //  - stdout con algo que no parsea → react-doctor SÍ corrió y su informe
  //    vino roto: un crash a mitad de escritura, un formato que cambió. Eso
  //    es una medición incompleta, y una medición incompleta no es un
  //    aprobado (AGENTS.md §5.8).
  if (salida.trim() === "") {
    console.log(
      `\n${GRIS}  react-doctor no pudo correr (¿sin red, o el registry caído?). No frena el push.${FIN}\n`,
    );
    process.exit(0);
  }
  console.log(`\n${ROJO}${AZUL}  react-doctor devolvió una salida que no se puede leer.${FIN}`);
  console.log(
    `${GRIS}  Corrió, pero su informe no es JSON válido, así que la medición no existe.\n  Lo primero que devolvió:${FIN}`,
  );
  console.log(`${GRIS}  ${salida.trim().slice(0, 200)}${FIN}`);
  console.log(`${GRIS}  Corré \`pnpm react-doctor\` a mano para ver qué pasó.${FIN}\n`);
  process.exit(1);
}

const resumen = informe.summary ?? {};
const raiz = informe.directory ?? process.cwd();

// react-doctor devuelve rutas absolutas; el gate razona en rutas del repo.
const porProyecto = new Map();
for (const p of informe.projects ?? []) {
  const relativo = path.relative(raiz, p.directory ?? "").split(path.sep).join("/");
  porProyecto.set(relativo, p);
}

const faltantes = PROYECTOS.filter((nombre) => !porProyecto.has(nombre));
const incompletos = [...porProyecto].filter(
  ([, p]) => p.complete === false || (p.skippedChecks ?? []).length > 0,
);

// Una medición incompleta NO es un aprobado: react-doctor arma su lista de
// archivos con el índice de git, así que un borrado sin commitear le hace
// fallar el análisis de mantenibilidad y ESCONDER el score. Y un proyecto que
// no vino en el informe es lo mismo, pero más silencioso.
if (faltantes.length > 0 || incompletos.length > 0 || resumen.score == null) {
  console.log(`\n${ROJO}${AZUL}  react-doctor no pudo completar la medición.${FIN}`);
  // Cuando la herramienta misma rechaza la corrida (una ruta que no existe,
  // un nombre de proyecto mal escrito) el motivo viene acá y es la pista.
  if (informe.error?.message) console.log(`  ${informe.error.message}`);
  if (faltantes.length) {
    console.log(`  Proyectos que no vinieron en el informe: ${faltantes.join(", ")}`);
    console.log(
      `${GRIS}  Revisá que sigan existiendo y que estén en PROYECTOS, acá arriba.${FIN}`,
    );
  }
  if (incompletos.length) {
    for (const [nombre, p] of incompletos) {
      const salteados = p.skippedChecks ?? [];
      if (salteados.length) console.log(`  ${nombre} — chequeos salteados: ${salteados.join(", ")}`);
      for (const [check, razon] of Object.entries(p.skippedCheckReasons ?? {})) {
        console.log(`${GRIS}  ${check}: ${String(razon).split("\n")[0]}${FIN}`);
      }
    }
    // Esta pista explica un chequeo salteado, no un proyecto que falta:
    // imprimirla siempre manda a buscar un borrado que puede no existir.
    console.log(
      `${GRIS}  Suele ser un archivo borrado y todavía no commiteado: react-doctor lo busca\n  porque sigue en el índice de git. Commiteá el borrado y volvé a probar.${FIN}`,
    );
  }
  console.log("");
  process.exit(1);
}

// El score del proyecto es un objeto; el del resumen, un número.
const puntaje = (p) => (typeof p.score === "number" ? p.score : p.score?.score);
const bajos = PROYECTOS.filter((nombre) => puntaje(porProyecto.get(nombre)) !== 100);

if (bajos.length === 0 && resumen.totalDiagnosticCount === 0) {
  const detalle = PROYECTOS.map(
    (nombre) => `${nombre}: ${porProyecto.get(nombre).analyzedFileCount} archivos`,
  ).join(" · ");
  console.log(`\n${VERDE}  react-doctor: 100/100, sin diagnósticos${FIN} ${GRIS}(${detalle})${FIN}\n`);
  process.exit(0);
}

console.log(
  `\n${ROJO}${AZUL}  react-doctor: ${resumen.score}/100 con ${resumen.totalDiagnosticCount} diagnóstico(s).${FIN}`,
);
console.log(`${GRIS}  El push se frena hasta que vuelva a 100. Qué hay:${FIN}\n`);

const porRegla = new Map();
for (const [nombre, p] of porProyecto) {
  for (const d of p.diagnostics ?? []) {
    if (!porRegla.has(d.rule)) porRegla.set(d.rule, []);
    porRegla.get(d.rule).push({ ...d, proyecto: nombre });
  }
}
for (const [regla, ds] of porRegla) {
  console.log(`  ${AZUL}${regla}${FIN} ${GRIS}×${ds.length}${FIN}`);
  console.log(`${GRIS}    ${ds[0].message}${FIN}`);
  for (const d of ds) console.log(`    ${d.proyecto}/${d.filePath}:${d.line}`);
  console.log("");
}
console.log(
  `${GRIS}  Se arregla por código: nada de react-doctor-disable, doctor.config ni\n  suprimir la regla (AGENTS.md §5.8). El informe completo, con \`pnpm react-doctor\`.${FIN}\n`,
);
process.exit(1);
