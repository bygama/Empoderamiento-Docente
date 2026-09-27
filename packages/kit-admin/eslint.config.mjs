import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Las reglas de la app: este paquete sí tiene React adentro (los controles
// del admin), así que pasa por las mismas que el sitio. Las reglas de Next
// buscan las rutas en la raíz de la app que corren; el kit no tiene rutas y
// se usa desde la app, así que se le dice cuál es.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { settings: { next: { rootDir: "../../apps/sitio/" } } },
  globalIgnores(["node_modules/**"]),
]);

export default eslintConfig;
