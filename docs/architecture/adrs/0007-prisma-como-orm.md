# ADR-0007: Usar Prisma como ORM, en la versión 7.10.0 exacta

- **Status:** Accepted, corregido en un detalle por el ADR-0008
- **Amended by:** [ADR-0008](0008-correcciones-de-la-fase-1.md) — el adaptador
  es `@prisma/adapter-pg`, no el de Neon. La elección de Prisma no cambia.
- **Date:** 2026-09-18
- **Decision-makers:** @mateo

---

## Contexto

El [ADR-0005](0005-admin-a-medida.md) saca Payload, que traía su propio
adaptador de base (`@payloadcms/db-postgres`). La base sigue siendo Postgres en
Neon, pero hace falta elegir con qué se la consulta.

Los dos candidatos reales, medidos el 2026-09-18:

| | Prisma | Drizzle |
| --- | --- | --- |
| Descargas/semana | 15.5 M (CLI) · 14.9 M (client) | **20.0 M** (orm) · 16.6 M (kit) |
| Última estable | **7.10.0** — 2026-08-25 | **0.45.2** — 2026-03-27 |
| Dónde está el major | 8.0 en `rc.15` | 1.0 en `rc.4`, tras 22 betas |
| ¿Llegó a 1.0? | va por la 7 | todavía no |
| Adaptador de better-auth | `@better-auth/prisma-adapter` | `@better-auth/drizzle-adapter` |

Los dos sirven y los dos están a mitad de una transición de major. Drizzle tiene
más descargas; es el número que le juega a favor y no se esconde.

## Decisión

**Prisma, fijado en la versión `7.10.0` exacta.**

Pesan tres cosas, en este orden:

1. **Las migraciones son la parte más madura de Prisma**, y es justo lo que más
   va a evolucionar en un admin de contenido: siete entidades más las páginas y
   los ajustes, creciendo por fases.
2. **Drizzle no movió su estable en seis meses** mientras su 1.0 acumula 22
   betas y cuatro release candidates. Adoptar una 0.x en esa situación es
   comprarse la migración a la 1.0 en el medio del proyecto.
3. **El owner ya trabaja con Prisma en otros repos**, así que el
   `packages/db` que salga de acá llega a un terreno conocido — que es el
   requisito del [ADR-0006](0006-packages-reutilizables.md).

**La versión va exacta, sin `^`, y esto no es una preferencia de estilo.** El
tag `latest` de npm resuelve hoy a `8.0.0-rc.15`: el equipo de Prisma publicó
un release candidate en `latest`, y el último estable quedó en el tag `prev`.
Un `pnpm install` con `^` se trae un RC a producción.

## Consecuencias

### Positivas

- `prisma migrate` da historial, estado y un flujo de despliegue probado.
- Los tipos se generan del esquema: no hay que escribirlos ni mantenerlos.
- El adaptador de Neon (`@prisma/adapter-neon`) es oficial.
- La integración con better-auth está documentada y es de una sola dirección:
  su CLI escribe los modelos en `schema.prisma` y Prisma hace la migración.

### Negativas

- **Prisma genera código**, igual que Payload. La diferencia que importa: el
  client va a `node_modules`, no a `src/`. Las 430 líneas de `payload-types.ts`
  vivían adentro del proyecto y el gate tenía que medirlas; el client de Prisma
  no lo ve nunca.
- El esquema es un DSL propio (`schema.prisma`), no TypeScript.
- Fijar una versión exacta significa que las actualizaciones son manuales y a
  propósito, incluidos los parches de seguridad.
- La 8.0 va a llegar, y va a haber una migración de major por delante.

### Mitigaciones

- **`scripts/guarda-prisma.mjs` bloquea `prisma db push` con exit 1.** `push`
  crea tablas sin generar el archivo de migración, y el síntoma aparece recién
  en producción como «la tabla no existe». La guarda se copia de un repo donde
  ese incidente ya pasó.
- Las migraciones se commitean y se aplican con `migrate deploy` en el build,
  nunca a mano contra la base.
- La 8.0 se adopta cuando salga estable y a propósito, con su propia entrada
  en el log de decisiones.

## Alternativas consideradas

### Alternativa A: Drizzle

- Qué hubiera implicado: esquema en TypeScript, tipos inferidos sin paso de
  generación, y `drizzle-kit` para las migraciones.
- Por qué se descarta: su estable lleva seis meses sin moverse con la 1.0 en
  RC. Es el candidato a revisar si Prisma 8 resulta una migración cara.

### Alternativa B: SQL a mano con un driver (`@neondatabase/serverless`)

- Qué hubiera implicado: consultas escritas a mano, sin ORM ni generación de
  tipos, y las migraciones como archivos `.sql` propios.
- Por qué se descarta: el admin son siete entidades con ABM completo; escribir
  y tipar eso a mano es exactamente el trabajo que el ORM evita, y los tipos
  quedarían desincronizados del esquema a la primera distracción.

## Referencias

- [ADR-0005](0005-admin-a-medida.md), que motiva la elección.
- [ADR-0006](0006-packages-reutilizables.md) — `packages/db`.
- [Prisma](https://www.prisma.io/docs) ·
  [adaptador de Neon](https://www.prisma.io/docs/orm/overview/databases/neon) ·
  [better-auth con Prisma](https://better-auth.com/docs/adapters/prisma)
