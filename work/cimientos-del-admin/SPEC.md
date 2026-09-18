# SPEC — Fase 1: los cimientos del admin

- **Fecha:** 2026-09-18
- **Tier:** L · rama `mateo/cimientos-del-admin`, **sobre el checkout
  principal** (ver `DECISIONS.md`: el worktree se probó y no sobrevivió)
- **Base:** `6d72bc0` (= `origin/main`, con la fase 0 ya mergeada)
- **Autoridad:** `docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`
  §9, fase 1. Este archivo es la **rebanada** que ejecuta esta lane, no una
  spec nueva: cuando los dos digan algo distinto, manda la del repo.

---

## 1. Qué entra

Los cimientos, y nada de contenido:

- **`packages/db`** — cliente Prisma sobre Neon, y las utilidades que no saben
  nada de ED: normalización de slugs y la tabla de redirecciones.
- **`packages/auth`** — better-auth configurado con `prismaAdapter`, los dos
  roles y la guarda de sesión.
- **`apps/sitio/prisma/`** — el esquema y sus migraciones, commiteadas.
- **`apps/sitio/src/middleware.ts`** — cabeceras de seguridad, `X-Robots-Tag`
  en `/admin` y rate limit por IP y por cuenta.
- **`/admin`** — entrar, salir y «olvidé mi contraseña». Nada más.
- **`scripts/guarda-prisma.mjs`** — bloquea `prisma db push`.
- Los `packages/` sumados a **las dos listas del gate** y a
  `pnpm-workspace.yaml`.

## 2. Qué NO entra

- **Ninguna entidad de contenido.** Ni novedades, ni materiales, ni casos, ni
  equipo, ni aliados, ni páginas, ni ajustes: eso es la fase 2 y la 3.
- **Ningún primitivo de UI del admin.** `packages/kit-admin` nace en la fase 2,
  contra una entidad real, para que no se diseñe en el vacío.
- La vista previa (fase 2) y las 26 URLs nuevas (fase 4).
- El sitio no se toca. Sigue leyendo sus `data.ts`.

## 3. Decisiones que ya están tomadas y no se rediscuten

Vienen de los ADRs y no son de esta lane:

- **Prisma en `7.10.0` exacta, sin `^`.** Revalidado hoy contra el registry:
  `latest` sigue resolviendo a `8.0.0-rc.15` y el último estable, `7.10.0`,
  está en el tag `prev` (ADR-0007).
- **better-auth** (1.7.5, MIT) autohospedado sobre la misma base, con
  `prismaAdapter`. Su telemetría viene apagada por defecto; se fija explícita
  igual (ADR-0005).
- **Server Actions, no API REST propia.** `/api` queda libre (ADR-0005).
- **Las cuatro fronteras** son criterio de review: `packages/` no sabe nada de
  ED, `datos/` es la única puerta a la base, `app/` son rutas, `features/` no
  se entera.

## 4. Seguridad — lo que esta fase tiene que cerrar

De los seis hallazgos del SPEC de la fase 0, tres son de esta lane:

| # | Qué | Cómo |
| --- | --- | --- |
| 1 | Cero cabeceras | CSP, HSTS, `frame-ancestors` en `none` para `/admin`, `Referrer-Policy`, `Permissions-Policy` |
| 5 | Rate limit solo por cuenta | por IP **y** por cuenta, en el middleware |
| 6 | `/admin` dependía de `robots.txt` | `X-Robots-Tag: noindex` real en la respuesta |

Más lo que trae la capa nueva: **Argon2id**, rotación de sesión al login,
tokens de reset de un solo uso hasheados en reposo, y errores genéricos para no
permitir enumerar usuarios.

**La sesión se verifica en el middleware, antes de renderizar.** Nunca dentro
del componente.

## 5. El entorno local, tal como está hoy

- El contenedor `ed-postgres` está arriba en el puerto **5435** y contiene la
  base **`ed_panel`** con las 9 tablas que dejó Payload.
- Pero el `.env.example` y el `README` de la fase 0 apuntan a una base llamada
  **`ed`**, que **no existe**. Hay que reconciliarlo: esta lane crea `ed`.
- **`ed_panel` no se toca.** Borrar una base es destructivo y es del owner;
  queda huérfana y él decide cuándo la tira. Se deja dicho en el README.

## 6. Criterios de aceptación

- `pnpm typecheck`, `pnpm lint` y `pnpm build` en verde.
- `node scripts/verificar-react-doctor.mjs` en **100/100 sin diagnósticos**,
  con los `packages/` adentro de las dos listas y **nombrados en el informe**.
- `node scripts/comparar-render.mjs` contra `6d72bc0`: **render idéntico**. El
  sitio público no puede cambiar en esta fase.
- `prisma migrate status` sin migraciones pendientes contra la base local.
- `scripts/guarda-prisma.mjs` sale 1 ante `prisma db push`.
- Una persona puede entrar a `/admin`, cerrar sesión y pedir un mail de reset
  (que sale por consola sin clave de Resend).
- Sin sesión, `/admin` no renderiza: corta en el middleware.
- Las cabeceras de §4 están en la respuesta, comprobadas con `curl -I`.
- Los estándares de contenido de AGENTS.md §6 valen para las etiquetas y
  ayudas del admin: lenguaje inclusivo, nunca «alumnos».
