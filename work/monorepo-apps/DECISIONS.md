# DECISIONS — Mudanza a monorepo (`apps/sitio`)

Rulings tomados durante la corrida. Todos se suben al resumen final: una
decisión tomada en nombre del owner no queda muda.

## 2026-09-18 — Rehacer la mudanza en vez de rebasar

**Qué.** La rama original (`mateo/refactor-monorepo-apps`) se hizo sobre el
`main` viejo. Cuando `main` recibió la fase 0 del panel, el rebase dio
rename/rename en siete archivos: sus renombres apuntaban a
`apps/sitio/src/app/page.tsx` y el `main` nuevo los tiene en
`apps/sitio/src/app/(sitio)/page.tsx`.

**Ruling.** Se rehace el `git mv` sobre el `main` nuevo, en una rama limpia.
Resolver a mano decenas de conflictos de renombre a lo largo de 13 commits es
más caro y más riesgoso que repetir una operación que es mecánica por diseño
— que es exactamente para lo que la mudanza se escribió como un solo commit
de renombres.

**Consecuencia.** El PR #155 se cierra sin mergear y esta rama lo reemplaza.
Su close review no se reusa: el diff es otro.

## 2026-09-18 — Lo generado por Payload se queda adentro de `src/`

**Qué.** El §4.4 del spec pedía sacar `payload-types.ts` y las migraciones
fuera de `src/` para que no entraran en la medición del gate.

**Por qué cambió.** Se pudo medir en vez de suponer: con la fase 0 en `main`,
el gate da **100/100 con todo lo generado adentro** (356 archivos,
`payload-types.ts` con sus 430 líneas). La justificación era proteger un score
que no estaba en riesgo.

**Ruling.** No se toca `typescript.outputFile` ni `db.migrationDir`. El spec
queda corregido con una nota fechada arriba del apartado —no borrando lo que
decía— y `AGENTS.md` §5.8 registra que lo generado se mide y pasa.

**Lección, más que el caso:** el spec justificaba una decisión de config con
un riesgo que nadie había medido. Cuando apareció la forma de medirlo, el
número lo tumbó.

## 2026-09-18 — Los comandos del panel pasan a `--filter sitio`

**Qué.** `migrate`, `generate:types`, `payload`, `build:vercel` y compañía
vivían en el `package.json` de la raíz.

**Ruling.** Se mudan al `package.json` de la app. La raíz se queda con lo que
es del repo: el gate, y los que cruzan todas las apps (`lint`, `typecheck`
con `-r`). `dev`, `build` y `start` siguen delegando en `sitio` por comodidad,
y habrá que revisarlos cuando exista una segunda app.

**Por qué.** Un comando de una app en la raíz del workspace es una mentira en
cuanto haya dos apps: `pnpm migrate` no sabría a cuál. Mejor que el prefijo
moleste hoy a que el comando mienta mañana.

## 2026-09-18 — `turbopack.root` y el hoist de `next`

Los dos vienen de la rama anterior y se mantienen, ahora verificados también
con Payload adentro:

- **`turbopack.root` a la raíz del workspace.** Sin eso Turbopack toma
  `apps/sitio` como raíz, deja afuera el store de pnpm y el build muere con
  «Could not find the Next.js package». Con esto, `next build` sale 0 y lista
  las rutas del panel.
- **`publicHoistPattern` con `next`.** `eslint-config-next` hace
  `require("next/dist/compiled/babel/eslint-parser")` sin declarar `next` ni
  como dependencia ni como peer. Alternativas descartadas: `packageExtensions`
  (pnpm 11 no la aplicó), `nodeLinker: hoisted` (afloja el árbol entero) y
  declarar `next` en la raíz (duplica la versión). Va en
  `pnpm-workspace.yaml`: pnpm 11 ya no lee `.npmrc` para sus settings.
