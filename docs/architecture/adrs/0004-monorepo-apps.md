# ADR-0004: Pasar el repo a monorepo con `apps/`, con una sola app

- **Status:** Accepted
- **Date:** 2026-09-18
- **Decision-makers:** @mateo
- **Consulted:** @bygama

---

## Contexto

El repo era un único proyecto Next en la raíz. Dos fuerzas lo empujaron a
cambiar de forma:

1. **El panel ya está adentro.** La fase 0 del
   [diseño del panel](../specs/2026-09-15-panel-admin-diseno.md) montó
   Payload 3 en `/admin` dentro de la misma app ([ADR-0003](0003-adoptar-neon-y-payload.md)):
   route groups `(sitio)` y `(payload)`, la definición en `src/cms/`,
   migraciones versionadas y tipos generados. El repo dejó de ser «un sitio»
   para ser «un sitio y su panel», y le faltan cuatro fases más.
2. **ED puede crecer a más de un producto web.** Un portal de inscripción, un
   campus, la landing de una diplomatura. La pregunta concreta que disparó
   esta decisión fue si el sitio y el panel debían ser **dos apps** desde ya,
   pensando en ese crecimiento.

Y una restricción que no se negocia: el gate de `AGENTS.md` §5.8
(react-doctor 100/100 en el `pre-push`). El verificador leía
`informe.projects[0]`, así que con más de un proyecto habría medido uno y
dicho «todo en verde».

## Decisión

**El repo pasa a un workspace pnpm con `apps/`, y por ahora hay una sola app:
`apps/sitio`.** El sitio y el panel siguen siendo un solo deployable y viven
juntos ahí adentro, con los route groups que ya tenían. **No se crea
`packages/`** hasta que exista un segundo consumidor real.

Son dos ejes distintos y se separan a propósito:

- **El layout del repo** (`apps/` + `packages/`) es lo que hace barato crecer.
  Se adopta ahora.
- **La cantidad de deployables** es lo que hace caro operar. No se toca.

El alcance del gate pasa a declararse por proyecto (`apps/sitio/src`) en el
script `react-doctor` de la raíz y en la lista `PROYECTOS` del verificador,
que ahora recorre todos y frena si alguno falta en el informe.

## Consecuencias

### Positivas

- Sumar una segunda app es crear `apps/<nombre>` y agregarla a dos listas. No
  hay que rediseñar el repo ni mover lo que esté en vuelo.
- El gate mide por proyecto y deja de tener un punto ciego cuando el repo
  crece.
- La mudanza fue mecánica: **504 archivos viajaron como renombres**, sin un
  solo cambio de contenido en `src/`, y la medición dio los mismos **356
  archivos** antes y después.
- Las dependencias quedan en la app: qué necesita cada deployable se lee de
  un vistazo, y una segunda app no hereda Payload por estar en la misma raíz.

### Negativas

- Una capa más de carpetas entre la raíz y el código.
- Las rutas de toda la documentación se alargaron con el prefijo de la app.
- Aparecieron dos fricciones propias del workspace: `turbopack.root` hay que
  apuntarlo a la raíz o el build no encuentra `next`, y `eslint-config-next`
  requiere `next` sin declararlo, así que dejó de verlo cuando la raíz se
  quedó sin dependencias.
- Los comandos del panel (`migrate`, `generate:types`, …) dejan de correrse
  desde la raíz y piden `--filter sitio`.
- El sitio y el panel comparten deployable: un upgrade de Payload obliga a
  redeployar el sitio, y el build del admin se suma al del sitio.

### Mitigaciones

- Las dos fricciones quedaron resueltas y **comentadas donde se leen**:
  `turbopack.root` en `apps/sitio/next.config.ts` y el `publicHoistPattern`
  en `pnpm-workspace.yaml`, cada uno con el síntoma que provoca su ausencia.
- El acoplamiento del deployable tiene salida preparada: `src/contenido/` —la
  capa de lectura que define el spec del panel para sus fases 1 a 3— es la
  costura por la que el sitio va a leer contenido, sin importar Payload
  directo. El día que el panel se mude a `apps/panel`, esa capa cambia de
  local API a fetch y ningún componente se entera.

## Alternativas consideradas

### Alternativa A: dos apps desde ya (`apps/sitio` + `apps/panel`)

- **Qué hubiera implicado:** un `packages/cms` compartido, dos proyectos en
  Vercel apuntando a la misma base, un webhook con secreto para que publicar
  en el panel regenere las rutas del sitio, y vista previa cross-origin.
- **Por qué se descarta:** el costo no está en leer el contenido —el local
  API de Payload funciona con el config y la base, viva donde viva— sino en
  el **loop de publicación**, que con dos apps cruza la red. Es mucha
  operación para un panel que usan tres personas, y además implicaría
  deshacer parte de la fase 0, que ya montó Payload adentro de la app.

### Alternativa B: quedarse con el proyecto en la raíz

- **Qué hubiera implicado:** cero trabajo ahora.
- **Por qué se descarta:** el costo de mudarse crece con el repo, y al panel
  le faltan cuatro fases que tocan 46 componentes y borran un `data.ts` por
  sección. Mudarse ahora es una carpeta; en la fase 3 es conflicto con cada
  PR abierto. Y deja el punto ciego del gate para cuando aparezca el segundo
  proyecto, que es justo cuando hace daño.

### Alternativa C: monorepo con `packages/` desde el día uno

- **Qué hubiera implicado:** crear `packages/tokens`, `packages/ui`,
  `packages/cms` con un solo consumidor cada uno.
- **Por qué se descarta:** un paquete con un solo consumidor es indirección
  sin nada a cambio. Se crean cuando aparezca el segundo, que es cuando el
  paquete empieza a pagar.

### Alternativa D: sacar lo generado por Payload fuera de `src/`

- **Qué hubiera implicado:** `typescript.outputFile` y `db.migrationDir`
  apuntando a la raíz de la app, para que `payload-types.ts` y las
  migraciones no entraran en la medición del gate.
- **Por qué se descarta:** **se midió y no hacía falta.** Con todo lo
  generado adentro de `src/`, el gate da 100/100 (356 archivos,
  `payload-types.ts` incluido con sus 430 líneas). Era config extra para
  proteger un score que no estaba en riesgo, y para pelearse con los defaults
  que cualquiera espera al llegar desde la documentación de Payload.

## Referencias

- [Diseño del monorepo](../specs/2026-09-17-monorepo-apps-diseno.md) — layout
  exacto, gate multi-proyecto, orden de la mudanza y las señales que
  dispararían cada puerta futura.
- [ADR-0003](0003-adoptar-neon-y-payload.md) y el
  [diseño del panel](../specs/2026-09-15-panel-admin-diseno.md) — el panel que
  esta mudanza envuelve. Su §3 describe el árbol relativo a la raíz; desde
  este ADR, ese mismo árbol cuelga de `apps/sitio/`.
- `AGENTS.md` §3 (estructura), §5.8 (el gate) y §6 (estándares de código).
