# PROGRESS — Mensajes

## In progress

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, base propia
  `ed_mensajes` con las 12 migraciones de `main` aplicadas
  (`pnpm migrate:deploy`), `.env.local` apuntado a ella. SPEC.md escrito
  desde el brief del padre (lane 7 de `work/mapa-del-admin/`).
- 2026-09-26 — Investigado para el SPEC §3: Vercel Blob privado está en GA
  desde el 2026-06-30 y pide `@vercel/blob` ≥ 2.3; el repo tiene la 2.8.0 y
  sus tipos traen `get(…, { access: "private" })` con `stream` (verificado en
  `node_modules/.pnpm/@vercel+blob@2.8.0/…/dist/index.d.ts`). Neon gratis:
  0,5 GB por proyecto. Cuerpo de una función de Vercel: 4,5 MB.
- 2026-09-26 — SPEC aprobado por el padre con las seis propuestas y tres
  condiciones para `/sumate-al-equipo` (DECISIONS). PLAN.md escrito: 14
  pasos.

- **Paso 1 — las tablas** (`6aab99c`). `prisma/schema/mensajes.prisma`
  (`mensajes`, `limites_por_ip`, `avisos`) y las relaciones en `User`;
  migración `20260926231819_mensajes` con `pnpm migrate`. `pnpm
  migrate:status` → «Database schema is up to date!»; `pnpm typecheck` exit 0.
- **Paso 2 — las listas en un solo lugar** (`a3d6072`). `config/mensajes.ts`
  (bandejas, estados, `capacidadDe`), `config/privacidad.ts`
  (`MESES_DE_GUARDA`, `DIAS_DE_SPAM`, `seBorraEl`, los bordes),
  `config/cv.ts` (la lista PROVISORIA, `COLUMNAS_DEL_CV`, `MAXIMO_DEL_CV`,
  `cvAbierto`), `lib/formularios/campos.ts` (`esquemaDe`, `valoresDe`,
  `datosDe`). `tsx --test src/config/*.test.ts src/lib/formularios/*.test.ts`
  → 10 pasan, 0 fallan; typecheck y lint exit 0.
- **Paso 3 — el tope por IP** (`9c2e622`). `lib/formularios/limite.ts`
  (`ipDelPedido`, `claveDeLimite` con HMAC) y `datos/limites-por-ip.ts`
  (`sumarEnvio` en un solo `INSERT … ON CONFLICT … RETURNING`,
  `podarLimites`). `tsx --test src/datos/limites-por-ip.test.ts
  src/lib/formularios/limite.test.ts` → 5 pasan (diez envíos a la vez cuentan
  diez); typecheck y lint exit 0.
- **Paso 4 — el almacén privado** (`dc93750`).
  `lib/formularios/almacen-privado.ts` (Blob `access: "private"` con token
  explícito, disco con clave `carpeta/uuid.ext`, y sin token donde no hay
  disco propio, error), `lib/formularios/pdf.ts` (`esPdf` por los bytes),
  `.cv/` en el `.gitignore` de la app. 4 pasan; typecheck y lint exit 0.
- **Paso 5 — recibir** (`d780701`). `datos/formularios/recibir.ts` (la
  respuesta `{ ok }`, el tope, `motivoSinDatos` para que el log no lleve lo
  que llegó), `contacto.ts` (JSON, 5 por hora) y `cv.ts` (multipart, 3 por
  hora, archivo antes que la fila, 503 en Vercel sin token), y las dos rutas
  que solo delegan. Ruling: «sin disco» es `VERCEL` y no `NODE_ENV`, para que
  un `next start` local pueda guardar (DECISIONS). `tsx --test
  src/datos/formularios/*.test.ts src/lib/formularios/*.test.ts` → 19 pasan;
  las pruebas dejan `mensajes` y `limites_por_ip` en 0 filas.
