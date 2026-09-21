# SPEC — Poner al día el deploy

- **Fecha:** 2026-09-21 (reescrito el mismo día: el sitio ya estaba en producción)
- **Estado:** aprobado por el owner en conversación; revisado; en ejecución
- **Decide:** Facundo (owner), diseñado en conversación
- **Tier:** S · rama `chore/primer-deploy`
- **Habilita:** la lane [`metricas`](../metricas/SPEC.md) y que ED pruebe el
  admin en la URL real

---

## 1. Qué hay y qué se quiere

**El sitio ya está en producción en Vercel con el dominio definitivo**
(`https://empoderamientodocente.org` responde con `Server: Vercel`, comprobado
el 2026-09-21), en una cuenta a la que tienen acceso **Mateo y Gastón**, no
Facundo. GitHub no muestra deployments ni checks de Vercel en los PRs: el
proyecto no está conectado a `bygama/Empoderamiento-Docente` por la
integración Git (o no publica), y **lo publicado es viejo**: no tiene `/admin`
(404), no tiene `robots.txt` (devuelve la 404 del sitio) y no tiene analítica.
Es un build anterior a la mudanza a monorepo del 2026-09-18.

Lo que se quiere: **que ese proyecto publique el `main` de hoy, con el admin
andando**, la base en Neon (gratis), las migraciones corriendo en cada build y
Web Analytics activada. Sin cambiar de cuenta ni de dominio.

## 2. Cómo queda

- **Del lado del repo** (esta lane, lo hace Facundo con Claude):
  `apps/sitio/vercel.json` con el build (generar el cliente de Prisma, aplicar
  migraciones, compilar; con `pnpm -w run` porque los scripts viven en la raíz),
  `robots.ts` que cierra los **previews** a los buscadores (por `VERCEL_ENV`,
  que Vercel fija solo; producción no cambia), y el README describiendo el
  deploy real.
- **Del lado de Vercel** (lo hace quien tiene la cuenta, Mateo o Gastón, con
  el checklist de `PLAN.md` Task 5):
  1. Conectar el proyecto al repo `bygama/Empoderamiento-Docente` con
     producción desde `main` y un preview por PR (si ya está conectado a otro
     repo o rama, cambiarlo).
  2. **Root Directory = `apps/sitio`** e «Include source files outside of the
     Root Directory» encendido (el build corre `scripts/guarda-prisma.mjs`).
  3. **Neon** por la integración del Marketplace (plan gratis): escribe
     `DATABASE_URL` y `DATABASE_URL_UNPOOLED`.
  4. Variables: `BETTER_AUTH_SECRET` (una por entorno) y
     `NEXT_PUBLIC_SITE_URL=https://empoderamientodocente.org` en Production.
     Blob y Resend siguen sin conectar: ningún código los lee.
  5. **Web Analytics** activada.
  6. Un deploy de `main`, y después la primera cuenta del admin con
     `pnpm --filter sitio crear-cuenta` contra la base de Neon.
- **Lo que no toca nadie:** el dominio, la cuenta, los DNS.

## 3. Lo que hay que saber de ellos antes de tocar

Preguntas para Mateo y Gastón (van en el mensaje del checklist):

- ¿En qué cuenta o equipo de Vercel vive el proyecto y cómo se llama?
- ¿Cómo se deployó lo que está hoy: a mano con la CLI, o conectado a un repo?
  ¿A cuál?
- ¿Qué variables tiene cargadas hoy el proyecto (solo nombres)?
- ¿Tiene Neon o alguna base conectada?

Sin esas respuestas el checklist se sigue igual: cada paso dice qué verificar
y qué cambiar si no está.

## 4. Criterio de cierre

- `https://empoderamientodocente.org/` sigue en 200, y ahora `/admin` manda a
  `/admin/entrar`, `/robots.txt` existe y permite el sitio, y la respuesta trae
  las cabeceras de seguridad del middleware.
- El log del deploy muestra el cliente generado, las migraciones aplicadas y
  el build en verde.
- Un PR de prueba recibe su preview de Vercel, y en el preview `/robots.txt`
  dice `Disallow: /`.
- Entrar al admin en producción con la cuenta creada y ver la portada.
- Web Analytics muestra visitas en el dashboard de Vercel al día siguiente.
- README con la sección de deploy real y `apps/sitio/vercel.json` en el árbol
  de AGENTS.md §3.

## 5. Fuera de alcance

Cambiar de cuenta o de dominio, Blob, Resend, plan Pro, protección de previews
con contraseña, y cualquier cambio de código del sitio o del admin que no sea
`robots.ts` y lo mínimo para que el build de Vercel pase.
