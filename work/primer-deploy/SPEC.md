# SPEC — El primer deploy

- **Fecha:** 2026-09-21
- **Estado:** aprobado por el owner en conversación; pendiente de plan
- **Decide:** Facundo (owner), diseñado en conversación
- **Tier:** S · rama `chore/primer-deploy`
- **Habilita:** la lane [`metricas`](../metricas/SPEC.md) y, más adelante,
  que ED pruebe el admin en una URL real

---

## 1. Qué se quiere

**El sitio y su admin publicados en Vercel, en el plan gratis, con la base en
Neon (gratis) y las migraciones corriendo en cada deploy.** Todavía sin
dominio propio: la URL de `vercel.app` alcanza para probar y para empezar a
medir. El dominio `empoderamientodocente.org` se conecta cuando ED decida
cuenta y plan.

## 2. Cómo queda

- **Proyecto en Vercel**, conectado al repo `bygama/Empoderamiento-Docente`,
  con **Root Directory `apps/sitio`** (Vercel detecta el workspace pnpm e
  instala desde la raíz). Producción desde `main`; cada PR con su preview.
- **Neon** por la integración nativa del Marketplace (plan gratis): escribe
  `DATABASE_URL` y `DATABASE_URL_UNPOOLED` en el proyecto. Producción usa la
  rama principal de Neon; los previews, una rama por deploy si la
  integración lo permite en el plan gratis (si no, comparten la principal y
  queda anotado).
- **El build**, declarado en `apps/sitio/vercel.json` (Vercel lo lee desde el
  Root Directory) para que quede versionado y no en un panel:

  ```json
  { "buildCommand": "pnpm -w run generate && pnpm -w run migrate:deploy && next build" }
  ```

  Genera el cliente de Prisma (`prisma/generado` está ignorado por git, así
  que se genera en cada build), aplica las migraciones que falten (`migrate
  deploy`, por la guarda que bloquea `db push`) y recién después compila. Los
  scripts `generate` y `migrate:deploy` viven en la raíz del workspace y
  **desde `apps/sitio` solo se alcanzan con `pnpm -w run`**: un
  `pnpm migrate:deploy` a secas ahí falla con «Command not found» (verificado
  el 2026-09-21). Un deploy con una migración rota no llega a publicarse.
- **Variables** cargadas en Vercel: las de Neon, `BETTER_AUTH_SECRET` (uno
  por entorno), `NEXT_PUBLIC_SITE_URL` (la URL de producción de `vercel.app`
  hasta que haya dominio). Blob y Resend siguen sin conectar: ningún código
  los lee todavía.
- **Mientras el sitio viva en `vercel.app`, no se indexa.** Los canonicals y
  `metadataBase` salen de `siteConfig.url` (`empoderamientodocente.org`,
  fijo en `src/config/site.ts`) y apuntan a un dominio que todavía no sirve
  el sitio; `NEXT_PUBLIC_SITE_URL` hoy solo la lee better-auth. Hasta que el
  dominio esté conectado, `robots.ts` responde `Disallow: /` cuando
  `NEXT_PUBLIC_SITE_URL` no coincide con `siteConfig.url`, así Google no
  indexa la URL provisoria ni canonicals rotos. Es el único cambio de código
  de esta lane.
- **«Include source files outside of the Root Directory» encendido** en el
  proyecto de Vercel: el build corre `scripts/guarda-prisma.mjs`, que vive en
  la raíz del repo, fuera de `apps/sitio`. Se verifica en el primer paso, no
  después de un deploy fallido.
- **Web Analytics activada** en el proyecto, para que la lane de métricas
  tenga qué copiar desde el primer día.
- **La primera cuenta del admin** en producción se crea con
  `pnpm --filter sitio crear-cuenta` corrido en local contra la base de
  Neon, y la contraseña se elige por «olvidé mi contraseña» (el link sale por
  los logs del deploy mientras Resend no esté).

## 3. Lo que hay que decidir con el owner al arrancar

- **En qué cuenta de Vercel vive el proyecto.** Recomendación: la de Facundo
  por ahora, y transferir el proyecto a la cuenta de ED cuando exista (Vercel
  permite transferir proyectos entre cuentas). Lo que cuesta si está mal: una
  transferencia y volver a cargar los secretos.
- **Quién hace el login de la CLI.** Los pasos que abren el navegador (login,
  vincular el proyecto, instalar Neon) los corre Facundo en su terminal.

## 4. Criterio de cierre

- `https://<proyecto>.vercel.app/` responde 200 con el sitio, y
  `/admin` manda a `/admin/entrar`.
- El log del deploy muestra las migraciones aplicadas y el build en verde.
- Entrar al admin en producción con la cuenta creada y ver la portada.
- Web Analytics muestra visitas en el dashboard de Vercel al día siguiente.
- README con la sección de deploy real (hoy dice «pendiente de definir» y
  promete Blob y Resend desde el Marketplace: pasa a decir lo que hay), y
  `apps/sitio/vercel.json` sumado al árbol de AGENTS.md §3.

## 5. Fuera de alcance

Dominio propio, Blob, Resend, plan Pro, protección de previews con
contraseña, y cualquier cambio de código del sitio o del admin que no sea el
`robots.ts` de §2 y lo mínimo para que el build de Vercel pase.
