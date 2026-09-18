# Architecture Decision Records (ADRs)

> Un **ADR** documenta una decisión arquitectónica importante: por qué se
> tomó, qué se descartó, qué consecuencias trae. La idea es que un developer
> futuro (humano o IA) entienda **el porqué** sin tener que arquear las
> arqueologías del repo.

Formato resumido (Nygard adaptado al proyecto). Los ADRs son **inmutables
una vez aceptados**: si una decisión cambia, se crea un ADR nuevo que
referencia al anterior con `Status: Superseded by ADR-NNNN`.

---

## Cuándo escribir un ADR

- Elegimos una tecnología grande (framework, base de datos, ORM, hosting).
- Tomamos una decisión arquitectónica que cuesta revertir (estructura de
  monorepo, esquema de auth, organización de carpetas src/).
- Aparece un trade-off con varias opciones razonables y queremos que la
  decisión quede explícita para el equipo.

**No escribir ADR** para decisiones triviales (qué color usar para un
botón — eso vive en `DESIGN.md`) ni para cambios de implementación
internos (refactors).

---

## Listado

| #     | Título                                        | Status   |
| ----- | --------------------------------------------- | -------- |
| 0001  | [Stack base del sitio](0001-stack-base.md)    | Accepted (persistencia superseded por 0002) |
| 0002  | [Adoptar Supabase para backend y persistencia](0002-adoptar-supabase-persistencia.md) | Superseded by ADR-0003 |
| 0003  | [Adoptar Neon y Payload para el panel de contenido](0003-adoptar-neon-y-payload.md) | Superseded by ADR-0005 (solo Payload; Neon sigue vigente) |
| 0004  | [Pasar el repo a monorepo con `apps/`](0004-monorepo-apps.md) | Accepted (enmendado por 0006) |
| 0005  | [Construir el admin a medida y sacar Payload](0005-admin-a-medida.md) | Accepted (reemplaza Payload de 0003; enmendado por 0008) |
| 0006  | [Abrir `packages/` ahora, con la reutilización como requisito](0006-packages-reutilizables.md) | Accepted (enmienda 0004) |
| 0007  | [Usar Prisma como ORM, en la versión 7.10.0 exacta](0007-prisma-como-orm.md) | Accepted (enmendado por 0008) |
| 0008  | [Adaptador de Postgres y scrypt](0008-correcciones-de-la-fase-1.md) | Accepted (corrige 0005 y 0007) |

---

## Cómo crear uno

Usar el template `_template.md` (cuando exista la skill, alternativamente
`skills/adr-create/SKILL.md` te guía paso a paso).

Numeración: 4 dígitos con zero-pad, en orden creciente. Una vez asignado,
no se reasigna aunque el ADR quede deprecado.
