import { defineConfig, globalIgnores } from "eslint/config";
import nextTs from "eslint-config-next/typescript";

// Solo las reglas de TypeScript: este paquete no tiene React adentro, y no
// debería tenerlo nunca (AGENTS.md §3, la primera frontera).
const eslintConfig = defineConfig([...nextTs, globalIgnores(["node_modules/**"])]);

export default eslintConfig;
