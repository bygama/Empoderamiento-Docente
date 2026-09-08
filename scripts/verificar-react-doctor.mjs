/**
 * Verifica que react-doctor dé 100/100 sin diagnósticos.
 *
 * Se usa desde `.githooks/pre-push`, y distingue tres desenlaces:
 *
 *  - 100/100 y cero diagnósticos → exit 0, el push sigue.
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

const AZUL = "[1m";
const GRIS = "[2m";
const ROJO = "[31m";
const VERDE = "[32m";
const FIN = "[0m";

let salida;
try {
  salida = execFileSync(
    "pnpm",
    ["dlx", "react-doctor", "--no-supply-chain", "--json", "src"],
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
  console.log(
    `\n${GRIS}  react-doctor no pudo correr (¿sin red, o el registry caído?). No frena el push.${FIN}\n`,
  );
  process.exit(0);
}

const proyecto = informe.projects?.[0] ?? {};
const resumen = informe.summary ?? {};
const diagnosticos = proyecto.diagnostics ?? [];
const salteados = proyecto.skippedChecks ?? [];

// Una medición incompleta NO es un aprobado: react-doctor arma su lista de
// archivos con el índice de git, así que un borrado sin commitear le hace
// fallar el análisis de mantenibilidad y ESCONDER el score. Sin esta rama, esa
// salida se leería como «cero hallazgos».
if (salteados.length > 0 || proyecto.complete === false || resumen.score == null) {
  console.log(`\n${ROJO}${AZUL}  react-doctor no pudo completar la medición.${FIN}`);
  if (salteados.length) console.log(`  Chequeos salteados: ${salteados.join(", ")}`);
  for (const [check, razon] of Object.entries(proyecto.skippedCheckReasons ?? {})) {
    console.log(`${GRIS}  ${check}: ${String(razon).split("\n")[0]}${FIN}`);
  }
  console.log(
    `${GRIS}  Suele ser un archivo borrado y todavía no commiteado: react-doctor lo busca\n  porque sigue en el índice de git. Commiteá el borrado y volvé a probar.${FIN}\n`,
  );
  process.exit(1);
}

if (resumen.score === 100 && resumen.totalDiagnosticCount === 0) {
  console.log(
    `\n${VERDE}  react-doctor: 100/100, sin diagnósticos${FIN} ${GRIS}(${proyecto.analyzedFileCount} archivos)${FIN}\n`,
  );
  process.exit(0);
}

console.log(
  `\n${ROJO}${AZUL}  react-doctor: ${resumen.score}/100 con ${resumen.totalDiagnosticCount} diagnóstico(s).${FIN}`,
);
console.log(`${GRIS}  El push se frena hasta que vuelva a 100. Qué hay:${FIN}\n`);

const porRegla = new Map();
for (const d of diagnosticos) {
  if (!porRegla.has(d.rule)) porRegla.set(d.rule, []);
  porRegla.get(d.rule).push(d);
}
for (const [regla, ds] of porRegla) {
  console.log(`  ${AZUL}${regla}${FIN} ${GRIS}×${ds.length}${FIN}`);
  console.log(`${GRIS}    ${ds[0].message}${FIN}`);
  for (const d of ds) console.log(`    src/${d.filePath}:${d.line}`);
  console.log("");
}
console.log(
  `${GRIS}  Se arregla por código: nada de react-doctor-disable, doctor.config ni\n  suprimir la regla (AGENTS.md §5.8). El informe completo, con \`pnpm react-doctor\`.${FIN}\n`,
);
process.exit(1);
