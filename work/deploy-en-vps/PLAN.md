# PLAN — deploy-en-vps

SPEC aprobado por el padre el 2026-09-27, con el cambio «Código para los dos»
(DECISIONS).

## Restricciones (valen para todos los pasos)

- **Código para los dos hosts**: nada de Vercel se borra (`vercel.json`,
  `@vercel/analytics`, Blob, el cliente de Vercel); lo del VPS se elige por
  variables y no cambia nada cuando corre en Vercel.
- **Ningún secreto en git, en una imagen ni en `.compilado/`.** Nunca un `.env`
  con valores; los ejemplos, sin valores reales.
- `*.sh` y `deploy/**` en LF (`.gitattributes`): los lee Linux.
- Cada paso deja typecheck, lint y `pnpm test` en verde; utilidades ≤ 100
  líneas, componentes ≤ 200. Código, comentarios, docs y commits en español.
- Los servicios del compose se llaman `db`, `migrar`, `construir`, `app`,
  `analitica`, `proxy`, `cron` y `respaldo`, en la red `interna`; solo `proxy`
  publica puertos.

## Pasos

1. **La copia sin sintaxis de Vercel.** `ClienteDeAnaliticas` y
   `ErrorDeAnaliticas` pasan a `lib/metricas/cliente.ts`; el filtro de `porDia`
   pasa de string OData a `FiltroDePais = { pais: string } | { fueraDe:
   readonly string[] }` (`lib/metricas/tipos.ts`), y `vercel.ts` lo traduce al
   OData de hoy; `consultas-de-vercel.ts` arma filtros tipados. Comportamiento
   idéntico. Acepta: `pnpm typecheck && pnpm --filter sitio test` → 0.
   *(integration · high)*
2. **La tarea pasa a `copia-de-visitas`.** Clave, nombre («Copia de las
   visitas»), `datos/tareas/metricas-de-vercel.ts` → `copia-de-visitas.ts`,
   `consultas-de-vercel.ts` → `consultas-de-la-copia.ts`, y sus referencias
   (`diarias.ts`, `a-mano.ts`, `config/conexiones.ts`, tests). Acepta: `pnpm
   typecheck && pnpm --filter sitio test` → 0 y `git grep -n
   "metricas-de-vercel"` sin resultados en `apps/`. *(mechanical · low)*
3. **La imagen.** `Dockerfile` multi-etapa en la raíz (targets `fuente` y
   `app`), `.dockerignore`, y `next.config.ts` con `output: "standalone"` y
   `outputFileTracingRoot`. `fuente` = Node 24 alpine + pnpm + install
   congelado + `pnpm generate`; `app` = el standalone copiado desde el
   contexto `.compilado/`, usuario `node`, `cwd` `/app/apps/sitio`, con `.fotos`
   y `.cv` creados y del usuario. Acepta: `docker build --target fuente -t
   ed-fuente:prueba .` → 0 y `pnpm build` local → 0. *(integration · high)*
4. **El compose y el deploy.** `compose.yaml` (`db` con `deploy/db/` que crea
   `ed` y `umami` con su usuario, `migrar`, `construir` en perfil, `app`,
   `proxy` con `deploy/Caddyfile`), `.env.example` de la raíz,
   `.gitignore` (`.compilado/`, `respaldos/`), `.gitattributes` (`deploy/**`
   LF), `scripts/desplegar.sh` (build `fuente` → `up -d db` → migrar →
   construir → build `ed-sitio:<commit>` → tag `actual` → `up -d` → deja las
   últimas 5) y `scripts/volver.sh <commit>`. Acepta: con un `.env` local
   (`DOMINIO=localhost`), `bash scripts/desplegar.sh` desde cero → 0; `curl -sk
   https://localhost/ -o /dev/null -w "%{http_code}"` → 200; `docker compose
   ps --format "{{.Service}} {{.Ports}}"` muestra puertos solo en `proxy`.
   *(integration · high)*
5. **Umami en el compose.** Servicio `analitica` (v3.4.0, base `umami`), y en el
   `Caddyfile` solo `/umami/script.js` y `/umami/api/send` hacia él. Acepta:
   `curl -sk https://localhost/umami/script.js` → 200 y
   `https://localhost/umami/api/websites` → 404 (no se publica). *(integration ·
   medium)*
6. **El cliente de Umami.** `lib/metricas/umami.ts`,
   `crearClienteDeUmami({ url, apiKey, sitio, fetchImpl })` que cumple
   `ClienteDeAnaliticas` (paso 1) contra `/pageviews`, `/metrics/expanded` y
   `/stats`, con `FiltroDePais` traducido a `country=eq.…` / `neq.…` y los
   nombres de dispositivo, sistema y navegador normalizados; tests con
   respuestas grabadas de la instancia del paso 5. Acepta: `pnpm --filter sitio
   test` → 0 con los tests nuevos. *(integration · high)*
7. **La fuente activa.** `lib/metricas/entorno.ts` da `fuenteDeVisitas()` y
   `clienteDesdeEntorno()` elige Umami, Vercel o ninguno; `PLAN_DE_VERCEL` →
   `PLANES_DE_LA_FUENTE` + `planDeLaFuente()` (Umami: sin ventana, con UTM);
   la copia, las cifras, Links para compartir, Origen, los textos «de Vercel»
   del admin y `config/conexiones.ts` (Umami o Vercel Analytics; el cron sin
   «de Vercel») leen la fuente. Acepta: `pnpm typecheck && pnpm --filter sitio
   test` → 0 y `git grep -n "PLAN_DE_VERCEL"` sin resultados. *(integration ·
   high)*
8. **Un solo script de analítica.** `scriptDeAnalitica(entorno)` (Vercel en
   Vercel, Umami fuera de Vercel con `UMAMI_WEBSITE_ID`, ninguno si no) con su
   test de las combinaciones, y el layout del sitio lo usa; el comentario de la
   CSP dice por qué Umami pasa sin cambiarla. Acepta: `pnpm --filter sitio test`
   → 0; en el compose, el HTML de `/` trae `/umami/script.js` y ningún
   `_vercel`. *(integration · medium)*
9. **La IP real.** `header_up X-Real-IP {remote_host}` en el `Caddyfile` y los
   comentarios de `limite.ts` y better-auth que dicen por qué la app confía en
   esas cabeceras. Acepta: por Caddy, un pedido con `X-Forwarded-For: 1.2.3.4`
   y `X-Real-IP: 1.2.3.4` falsificados llega a la app con la IP de la conexión
   (salida en PROGRESS). *(integration · medium)*
10. **El cron.** Servicio `cron` (alpine, busybox `crond`, 04:00 UTC) con
    `deploy/cron/correr.sh`, y el comentario de `app/api/cron/diario/route.ts`
    con los dos que la llaman. Acepta: `docker compose exec cron
    /etc/ed-cron/correr.sh` → la respuesta de las corridas en `docker compose
    logs cron`. *(integration · medium)*
11. **Los respaldos.** Servicio `respaldo` (03:30 UTC, 14 días) con
    `deploy/respaldo/respaldar.sh` y `restaurar.sh`. Acepta: respaldar, borrar
    los volúmenes de la base y de fotos, restaurar, y la foto subida y las filas
    vuelven (salida en PROGRESS). *(integration · high)*
12. **El ADR-0018**, «Deploy en Vercel o en un VPS: el código no depende del
    host», con qué cambia del 0005, 0009 y 0011, por qué el build necesita la
    base y A frente a B, C y D, por qué Umami y por qué la app confía en la IP
    de Caddy. Acepta: el archivo existe y `docs/architecture/adrs/README.md` lo
    lista. *(judgment · medium)*
13. **El runbook y la guía de Vercel.** `docs/deploy/vps.md` (§3.9 del SPEC,
    con el recorrido del §11 del padre al final) y `docs/deploy/vercel.md`,
    cada uno con la mudanza al otro. Acepta: los dos archivos existen y cada
    comando que nombran existe en el repo (`git grep` de los scripts y
    servicios). *(judgment · medium)*
14. **README, AGENTS.md y los `.env.example`.** Getting started y deploy con
    los dos caminos (sin la línea «cuando llegue la fase 1…»); AGENTS.md §1,
    §2, §3 (el árbol con `Dockerfile`, `compose.yaml`, `deploy/`, los
    `scripts/` nuevos y `docs/deploy/`), §12 y §13; `apps/sitio/.env.example`
    con Umami al lado de Vercel. Acepta: `git grep -n "cuando llegue la fase 1"`
    sin resultados y `pnpm lint` → 0. *(mechanical · medium)*

Después del paso 14: work-verify (el gate, `desplegar.sh` desde cero y la lista
del SPEC §6, `comparar-render.mjs` contra `main`), PR y `worker_done`.
