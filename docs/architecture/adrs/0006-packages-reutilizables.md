# ADR-0006: Abrir `packages/` ahora, con la reutilización como requisito

- **Status:** Accepted
- **Date:** 2026-09-18
- **Decision-makers:** @mateo
- **Enmienda:** ADR-0004 (monorepo con `apps/`), en su regla sobre `packages/`

---

## Contexto

El [ADR-0004](0004-monorepo-apps.md) fijó el monorepo con una sola app y dejó
escrita una regla clara: **`packages/` aparece recién cuando haya un segundo
consumidor de algo.** La regla es buena y evita la abstracción especulativa.

El [ADR-0005](0005-admin-a-medida.md) trae un requisito que el 0004 no tenía a
la vista: el owner quiere que **el kit del admin sirva en sus proyectos
futuros**. Ese es el motivo de construirlo a medida, no un extra.

Eso cambia la premisa. La regla del 0004 dice que la reutilización se descubre;
acá está pedida de antemano, y es parte de la definición de terminado.

## Decisión

**`packages/` se abre ahora, con tres packages, y el repo sigue teniendo un
solo deployable.**

```
packages/
├── db/          cliente Prisma + Neon, slugs, redirecciones
├── auth/        better-auth configurado, permisos, guarda
└── kit-admin/   tabla, formulario, controles, imágenes, avisos
```

**La frontera es el criterio de review, no una sugerencia: `packages/` no sabe
nada de ED.** Si aparece la palabra «novedad» en `kit-admin`, está mal puesto.
Ese es el test de si el package sirve para el próximo proyecto.

Lo que **no** cambia: el sitio y su admin siguen siendo **un solo deployable**,
`apps/sitio`. Partir la app no agrega ni un gramo de reutilización — lo que
viaja son los packages, no las apps.

## Consecuencias

### Positivas

- La reutilización queda como estructura desde el día uno, no como intención.
  Extraer packages después siempre cuesta más que empezar con ellos.
- La frontera obliga a que el kit no se contamine de dominio, que es la única
  forma de que sirva en otro proyecto.
- Si algún día el admin tiene que vivir en otro origen —lo único que dos apps
  compran de verdad es aislamiento frente a un XSS en el sitio público—,
  promoverlo a `apps/admin` es mudar una carpeta, justamente porque los
  packages ya existen.

### Negativas

- **Contradice la letra del ADR-0004.** Se registra acá en vez de dejarlo
  implícito, que es lo que haría daño.
- Tres packages es más ceremonia que una carpeta: hay que mantener sus
  `package.json`, sus exports y sus fronteras.
- El riesgo que el ADR-0004 quería evitar sigue vivo: un package sin segundo
  consumidor real puede volverse abstracción especulativa.

### Mitigaciones

- **El gate mide por proyecto y los proyectos están declarados** (AGENTS.md
  §5.8): los packages con React se suman a `PROYECTOS` en
  `scripts/verificar-react-doctor.mjs` y al script `react-doctor` de la raíz,
  igual que se haría con una app nueva.
- El primer consumidor real llega en la fase 2, que construye el kit contra una
  entidad entera antes de replicarlo: si algo no generaliza, se ve ahí y no
  después de siete.

## Alternativas consideradas

### Alternativa A: respetar el ADR-0004 al pie de la letra

- Qué hubiera implicado: el admin vive entero en `apps/sitio/src/admin/`, y se
  extrae a `packages/` cuando aparezca el segundo proyecto.
- Por qué se descarta: «que sirva en proyectos futuros» quedaría como
  intención, no como estructura, y la extracción posterior es la parte cara.

### Alternativa B: dos apps, `apps/sitio` y `apps/admin`

- Qué hubiera implicado: dos deployables, el admin en su propio dominio.
- Por qué se descarta: la reutilización no mejora —eso lo dan los packages—, y
  se pierde que el sitio lea la base directo en el build, sin HTTP de por
  medio, que es el motivo de tener la base ahí. Queda disponible después, y
  barato, gracias a esta misma decisión.

## Referencias

- [ADR-0004](0004-monorepo-apps.md), que este enmienda.
- [ADR-0005](0005-admin-a-medida.md), que trae el requisito.
- Spec del admin: `docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`
