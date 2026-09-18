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

**Abierto para el owner:** aceptar el desvío y anotarlo en §6 como excepción
(junto a la de los hooks de coreografía), o pedir la partición.
