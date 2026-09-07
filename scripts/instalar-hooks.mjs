/**
 * Apunta los hooks de git a `.githooks/`, que sí se commitea.
 *
 * Corre en el `prepare` de package.json, así cada quien los tiene con solo
 * instalar dependencias — sin husky ni ninguna dependencia extra. Si no hay
 * repo git (un CI que clona sin `.git`, un tarball), sale en silencio: el
 * install no se rompe por esto.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

if (!existsSync(new URL("../.git", import.meta.url))) process.exit(0);

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
    stdio: "ignore",
  });
} catch {
  // Sin git en el PATH, o el repo en un estado raro: que siga el install.
}
