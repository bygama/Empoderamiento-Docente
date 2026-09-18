# ADR-0004: Pasar el repo a monorepo con `apps/`, con una sola app

- **Status:** Accepted
- **Date:** 2026-09-17
- **Decision-makers:** @mateo
- **Consulted:** @bygama

---

## Contexto

El sitio vivía como un único proyecto Next en la raíz del repo, y dos fuerzas
lo empujaron a cambiar de forma al mismo tiempo:

1. **El panel de administración.** El
   [diseño del panel](../specs/2026-09-15-panel-admin-diseno.md) suma Payload 3
   montado en `/admin` dentro de la misma app, con su definición (`src/cms`),
   su capa de lectura (`src/contenido`), migraciones y tipos generados. Es
   bastante código nuevo, y una parte no es nuestra.
2. **ED puede crecer a más de un producto web.** Un portal de inscripción, un
   campus, la landing de una diplomatura. La pregunta concreta que disparó
   esta decisión fue si el sitio y el panel debían ser **dos apps** desde ya,
   pensando en ese crecimiento.

Y una restricción que no se negocia: el gate de `AGENTS.md` §5.8
(react-doctor 100/100 en el `pre-push`). El verificador leía
`informe.projects[0]`, así que con más de un proyecto habría medido uno y
dicho «todo en verde» — el desenlace exacto que ese archivo existe para
evitar.

## Decisión

**El repo pasa a un workspace pnpm con `apps/`, y por ahora hay una sola app:
`apps/sitio`.** El sitio y el panel viven adentro de esa app, en route groups.
No se crea `packages/` hasta que haya un segundo consumidor real.

Son dos ejes distintos y se separan a propósito:

- **El layout del repo** (`apps/` + `packages/`) es lo que hace barato crecer.
  Se adopta ahora.
- **La cantidad de deployables** es lo que hace caro operar. No se toca.

El alcance del gate pasa a declararse por proyecto: `apps/sitio/src`, en el
script `react-doctor` del `package.json` de la raíz y en la lista `PROYECTOS`
de `scripts/verificar-react-doctor.mjs`, que ahora recorre todos los
proyectos y frena si alguno falta en el informe.

## Consecuencias

### Positivas

- Sumar una segunda app es crear `apps/<nombre>` y agregarla a dos listas. No
  hay que rediseñar el repo ni mover lo que esté en vuelo.
- El gate mide por proyecto y deja de tener un punto ciego cuando el repo
  crece.
- La mudanza fue mecánica: 479 archivos viajaron como renombres, sin un solo
  cambio de contenido en `src/`, y la medición dio los mismos 333 archivos
  antes y después.
- Las dependencias quedan en la app, no en la raíz: qué necesita cada
  deployable se lee de un vistazo.

### Negativas

- Una capa más de carpetas entre la raíz y el código.
- Las rutas de toda la documentación se alargaron con el prefijo de la app.
- Aparecieron dos fricciones propias del workspace: `turbopack.root` hay que
  apuntarlo a la raíz o el build no encuentra `next`, y `eslint-config-next`
  requiere `next` sin declararlo, así que dejó de verlo cuando la raíz se
  quedó sin dependencias.
- El sitio y el panel comparten deployable: un upgrade de Payload obliga a
  redeployar el sitio, y el build del admin se suma al del sitio.

### Mitigaciones

- Las dos fricciones quedaron resueltas y **comentadas donde se leen**:
  `turbopack.root` en `apps/sitio/next.config.ts` y el `publicHoistPattern`
  en `pnpm-workspace.yaml`, cada uno con el síntoma que provoca su ausencia.
- El acoplamiento del deployable tiene salida preparada y barata:
  `src/contenido/` es la capa por la que el sitio lee contenido, y nunca
  importa Payload directo. El día que el panel se mude a `apps/panel`, esa
  capa cambia de local API a fetch y ningún componente se entera.

## Alternativas consideradas

### Alternativa A: dos apps desde ya (`apps/sitio` + `apps/panel`)

- **Qué hubiera implicado:** un `packages/cms` compartido, dos proyectos en
  Vercel apuntando a la misma rama de Neon, un webhook con secreto para que
  publicar en el panel regenere las rutas del sitio, y vista previa
  cross-origin con cookies de otro host.
- **Por qué se descarta:** el costo no está en leer el contenido —el local
  API de Payload funciona con el config y la base, viva donde viva— sino en
  el **loop de publicación**, que con dos apps cruza la red. Es mucha
  operación para un panel que usan tres personas, y cierra una puerta que hoy
  se puede dejar abierta gratis.

### Alternativa B: quedarse con el proyecto en la raíz

- **Qué hubiera implicado:** cero trabajo ahora; el árbol del diseño del
  panel colgando de la raíz, como estaba escrito.
- **Por qué se descarta:** el costo de mudarse crece con el repo, y el repo
  está por engordar: el panel toca 46 componentes en cinco fases y borra un
  `data.ts` por sección. Mudarse hoy es una carpeta; en la fase 3 es
  conflicto con cada PR abierto. Y deja el punto ciego del gate para más
  adelante, justo cuando aparezca el segundo proyecto.

### Alternativa C: monorepo con `packages/` desde el día uno

- **Qué hubiera implicado:** crear `packages/tokens`, `packages/ui`,
  `packages/cms` con un solo consumidor cada uno.
- **Por qué se descarta:** un paquete con un solo consumidor es indirección
  sin nada a cambio. Se crean cuando aparezca el segundo, que es cuando el
  paquete empieza a pagar.

## Referencias

- [Diseño del monorepo](../specs/2026-09-17-monorepo-apps-diseno.md) — el
  documento largo: layout exacto, gate multi-proyecto, orden de la mudanza y
  las señales que dispararían cada puerta.
- [Diseño del panel de administración](../specs/2026-09-15-panel-admin-diseno.md)
  — este ADR corrige su §3: el árbol pasa a colgar de `apps/sitio/`, y los
  generados de Payload salen de `src/`.
- `AGENTS.md` §3 (estructura), §5.8 (el gate) y §6 (estándares de código).
- El número **0003 queda reservado** para el ADR de Payload + Neon, anunciado
  en el diseño del panel y pendiente de su fase 0.
