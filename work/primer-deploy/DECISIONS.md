# DECISIONS — El primer deploy

Append-only: fecha — decisión — por qué.

---

**2026-09-21 — Vercel Hobby y Neon gratis.**
Facundo: «por ahora manejémonos en lo free sin pagos». Los términos de Hobby
son de uso no comercial: riesgo aceptado por escrito hasta que ED decida el
plan (ver también `work/metricas/DECISIONS.md`).

**2026-09-21 — Sin dominio propio en esta lane.**
La URL de `vercel.app` alcanza para probar el admin y para que la analítica
empiece a contar. El dominio se conecta cuando ED defina cuenta y plan, y es un
cambio de DNS, no de código.

**2026-09-21 — Las migraciones corren en el build, no a mano.**
Es lo que manda la spec del admin (§8) y la guarda de `scripts/guarda-prisma.mjs`
que bloquea `db push`. Un deploy con una migración rota no se publica.

**2026-09-21 — Web Analytics se activa acá, no en la lane de métricas.**
Activarla no cuesta nada y hace que la lane de métricas encuentre datos desde
su primer día en producción en vez de esperar uno más.

**2026-09-21 — El Build Command va en `apps/sitio/vercel.json`, con `pnpm -w run`.**
De la revisión del spec: los scripts `generate` y `migrate:deploy` viven en la
raíz del workspace y desde el Root Directory (`apps/sitio`) solo se alcanzan
con `pnpm -w run`; `pnpm migrate:deploy` a secas ahí falla. Y el cliente de
Prisma está ignorado por git: sin `generate` en el build, `next build` no
compila. Versionado en `vercel.json` y no en el panel de Vercel, para que se
lea en el repo.

**2026-09-21 — Sin dominio, `noindex`.**
Los canonicals y `metadataBase` salen de `siteConfig.url`, fijo en
`empoderamientodocente.org`; en `vercel.app` apuntan a un dominio que todavía
no sirve el sitio. Hasta conectar el dominio, `robots.ts` cierra el sitio a los
buscadores cuando `NEXT_PUBLIC_SITE_URL` no coincide con `siteConfig.url`.
Único cambio de código de la lane.

**2026-09-21 — `vercel.json` es de esta lane.**
Lo crea `primer-deploy` con el Build Command; `metricas` solo le suma `crons`.
Dos lanes en paralelo no pueden pelearse por el mismo archivo.

**2026-09-21 — El sitio ya estaba en producción: la lane cambia de «crear» a «poner al día».**
Comprobado con curl: https://empoderamientodocente.org responde 200 con
`Server: Vercel`; `/admin` da 404, `/robots.txt` devuelve la 404 del sitio y no
hay analítica: es un build anterior al monorepo. La cuenta la administran
Mateo y Gastón (Facundo no tiene acceso). GitHub no muestra deployments ni
checks de Vercel: la integración Git no está conectada a este repo o no
publica. Los pasos de Vercel pasan a ser un checklist para ellos.

**2026-09-21 — `robots.ts` cierra los previews por `VERCEL_ENV`, no por URL.**
El criterio anterior (comparar `NEXT_PUBLIC_SITE_URL` con `siteConfig.url`)
habría cerrado el dominio real a Google si en producción faltara esa variable,
cosa que no podemos verificar. `VERCEL_ENV` lo fija Vercel solo: `preview` se
cierra, `production` y local no cambian.
