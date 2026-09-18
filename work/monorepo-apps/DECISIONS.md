# DECISIONS — Mudanza a monorepo (`apps/sitio`)

Rulings tomados durante la corrida. Todos se suben al resumen final: una
decisión tomada en nombre del owner no queda muda.

## 2026-09-17 — `turbopack.root` se absorbe en el paso 1

**Qué.** El PLAN lo tenía como paso 3, aparte de la mudanza.

**Por qué cambió.** Sin ese cambio la app movida no compila: Turbopack toma
`apps/sitio` como raíz, deja afuera el store de pnpm que está por encima y
`pnpm build` muere con «Could not find the Next.js package». Era parte de la
mudanza, no un ajuste posterior; el paso 1 no podía cerrar su aceptación sin
él.

**Consecuencia.** El paso 3 deja de ser un commit propio: queda como
verificación de comportamiento (las siete rutas en 200) y se corre en
`work-verify`.

## 2026-09-17 — `publicHoistPattern` para `next`, y no otra salida

**Qué.** `eslint-config-next` hace
`require("next/dist/compiled/babel/eslint-parser")` sin declarar `next` ni en
`dependencies` ni en `peerDependencies`. Con el sitio en la raíz lo encontraba
igual; con el workspace, la raíz quedó sin dependencias y el lint muere.

**Alternativas descartadas.**

- `packageExtensions` (declararle el peer que le falta) — es la más precisa,
  pero pnpm 11 no la aplicó desde `pnpm-workspace.yaml`: el lockfile no generó
  `packageExtensionsChecksum` y la corrida quedó igual.
- `nodeLinker: hoisted` — apaga el layout aislado de pnpm para todo el árbol
  por un paquete.
- `next` como dependencia de la raíz — declara la versión dos veces y se
  desincroniza sola.

**Elegido.** `publicHoistPattern` con `next`, en `pnpm-workspace.yaml` (pnpm
11 ya no lee `.npmrc` para sus settings: el estado mostraba
`publicHoistPattern: []` con la config puesta ahí). Publica un solo paquete en
la raíz y deja el resto del árbol como está. Los dos patrones default
(`*eslint*`, `*prettier*`) se repiten porque declarar la lista la reemplaza
entera.

## 2026-09-17 — El verificador queda en 137 líneas, sobre el tope de 100

**Qué.** AGENTS.md §6 pide utilidades ≤ 100 líneas.
`scripts/verificar-react-doctor.mjs` venía en 95 y quedó en **137**: la lista
de proyectos esperados, el matcheo de rutas absolutas a rutas del repo, el
score por proyecto (que es objeto, no número) y el mensaje de error de la
herramienta. Sin comentarios ni líneas en blanco son 89.

**Ruling.** Queda en un archivo y se sube al owner, en vez de partirlo. Partir
un script de gate en dos lo vuelve más difícil de auditar, y auditarlo de una
lectura es exactamente para lo que existe. La alternativa —recortar los
comentarios que explican el porqué— sale más cara: son el «nunca se apaga en
silencio» de §5.8 escrito donde se lee.

**Resuelto.** El owner aceptó el desvío en conversación y quedó escrito como
excepción en `AGENTS.md` §6, al lado de la de los hooks de coreografía.

**Pendiente de una línea:** después de la close review el script creció a
**160 líneas** (cerrar el hueco del `catch`, abajo), así que el 137 que cita
§6 quedó viejo. Corregirlo requiere confirmación humana (§5.6).

## 2026-09-17 — El `catch` del `JSON.parse` deja de ser puerta de salida

**Qué.** La seat de «fallas silenciosas» de la close review encontró que
cualquier salida que no parsea caía en el mismo `exit 0` que «no hay red»: un
crash de react-doctor a mitad de escribir el informe dejaba pasar el push con
el mensaje «no pudo correr». Es **código heredado** —idéntico en `bb7fcd7`,
antes de la mudanza— pero esta lane endureció los otros dos huecos silenciosos
y dejaba este intacto, en un gate cuyo contrato dice «nunca se apaga en
silencio».

**Ruling.** Se arregla, aunque no sea una regresión de esta lane: el costo es
chico y §5.8 es explícito. Los dos desenlaces se separan por si hubo salida:

- `stdout` vacío → la herramienta no llegó a correr. Exit 0, no frena.
- `stdout` con algo que no parsea → corrió y su informe vino roto. Es una
  medición incompleta. Exit 1, e imprime los primeros caracteres de lo que
  devolvió, que es la pista.

**Verificado** con dos copias del script fuera del repo, una por camino:
vacío → exit 0; JSON truncado → exit 1.

## 2026-09-17 — `perl -pi` con backticks: qué se hace en vez

**Qué.** Un `perl -pi -e 's|…|…|'` con backticks adentro del patrón destruyó
`docs/README.md`: pegó el reemplazo al principio de las 68 líneas. Lo encontró
la seat de documentación, no la aceptación del paso 4 — cuyo grep excluía toda
línea con `apps/sitio/src`, y después de la corrupción **todas** la tenían.

**Ruling.** Para reemplazos de una línea en markdown se usa una edición
puntual sobre el texto exacto, no `perl -pi`. `perl` queda para lo que no
tiene alternativa: normalizar finales de línea (`s/\r?\n/\r\n/`), que no
depende de comillas ni de backticks.

**Y la aceptación cambia de forma:** un grep que excluye el patrón nuevo no
puede detectar un archivo que quedó lleno del patrón nuevo. Además del grep,
el paso mira el diff (`git diff --stat`): un `.md` que cambia 68 líneas cuando
se esperaba una es la señal que el grep no da.
