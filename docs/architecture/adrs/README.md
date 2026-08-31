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
| 0002  | [Adoptar Supabase para backend y persistencia](0002-adoptar-supabase-persistencia.md) | Accepted (reemplaza MongoDB de 0001) |
| 0003  | [Correo del formulario por el SMTP de Hostinger](0003-correo-del-formulario-por-smtp-de-hostinger.md) | Accepted |

---

## Cómo crear uno

Usar el template `_template.md` (cuando exista la skill, alternativamente
`skills/adr-create/SKILL.md` te guía paso a paso).

Numeración: 4 dígitos con zero-pad, en orden creciente. Una vez asignado,
no se reasigna aunque el ADR quede deprecado.
