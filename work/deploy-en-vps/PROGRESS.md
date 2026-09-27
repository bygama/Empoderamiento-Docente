# PROGRESS — deploy-en-vps

## In progress

- Paso 5 del PLAN.

## Done

- 2026-09-27 — Worktree listo (`pnpm install`, `pnpm generate`, `.env.local`
  copiado). Relevado el código que toca la lane y la API de Umami v3.4.0.
  Decidida con el padre la forma del build (A, DECISIONS). SPEC escrito y
  aprobado por el padre con el cambio «Código para los dos»; PLAN escrito.
- 2026-09-27 — **Paso 1** (`8765bb9d`): `lib/metricas/cliente.ts` con
  `ClienteDeAnaliticas`, `ErrorDeAnaliticas` y `paisesDelFiltro`;
  `FiltroDePais` en `tipos.ts`; `vercel.ts` lo traduce con `filtroOData` (mismo
  OData que antes, mismos tests). `pnpm typecheck` → 0; `pnpm --filter sitio
  test` → 570 pass, 0 fail. Los tests ahora corren contra la base propia
  `ed_vps` (creada y migrada con `pnpm migrate:deploy`), no contra `ed`.
- 2026-09-27 — **Paso 2** (`d5dc85f4`): la tarea pasa a `copia-de-visitas`
  («Copia de las visitas»); `copia-de-visitas.ts`, `consultas-de-la-copia.ts` y
  sus referencias. Typecheck → 0; tests → 570 pass. `git grep
  "metricas-de-vercel" -- apps` solo encuentra la migración
  `20260926213050_busquedas_y_tareas`, que no se edita (una migración aplicada
  no se toca).
- 2026-09-27 — **Paso 3** (`96ef41cf`, y `8d9d59cb` para la salida del build):
  `Dockerfile` (targets `fuente` y `app`), `.dockerignore`,
  `deploy/construir.sh` y `next.config.ts` con `output: "standalone"` fuera de
  Vercel y `outputFileTracingRoot`. `docker build --target fuente` → 0 (1,51 GB);
  `pnpm build` local → 0.
- 2026-09-27 — **Paso 4** (`b77036eb`, `8d9d59cb`): `compose.yaml` (`db`,
  `migrar`, `construir`, `app`, `proxy`), `deploy/db/crear-bases.sh`,
  `deploy/Caddyfile`, `.env.example`, `scripts/desplegar.sh` y
  `scripts/volver.sh`. **Hallazgo:** la primera corrida falló al armar la
  imagen `app` desde `.compilado/`: los node_modules del standalone son symlinks
  de pnpm y en una carpeta compartida con Windows no sobreviven («The file cannot
  be accessed by the system»). Arreglo: `construir` saca el contexto como un
  tar por stdout y `desplegar.sh` lo pasa directo a `docker build -`; no queda
  nada del build en el host (DECISIONS). Segunda corrida (el volumen de la
  base y la imagen `fuente` venían de la primera; la imagen `app` no existía;
  la corrida desde cero de verdad va en la verificación): `bash scripts/desplegar.sh` → exit 0, «Listo:
  https://localhost corre 8d9d59cb471a». Por Caddy: `/` 200, `/novedades` 200
  (con la novedad de UNESCO que vino de la base: el prerender leyó la base),
  `/quienes-somos` 200, `/admin` 307 → `/admin/entrar`, `/_next/image` 200
  (sharp anda). `docker compose ps`: solo `proxy` publica
  (`0.0.0.0:80->80`, `443->443`, `443/udp`); `app` (3000/tcp) y `db` (5432/tcp)
  solo exponen, sin `->`.
- 2026-09-27 — **Paso 4b** (`037a2270`): `RESEND_API_URL` opcional
  (`urlDesviada`, `crearClienteDeResend({ url })`), el aviso en la fila de
  Resend de Conexiones (`Conexion.avisar`, cuenta como error) y en el log del
  arranque (`src/instrumentation.ts`), y `compose.prueba.yaml` con el servicio
  `correo`. Tests nuevos en `resend.test.ts` y `conexiones.test.ts`; `pnpm
  --filter sitio test` → 572 pass, 0 fail; typecheck y lint → 0.
