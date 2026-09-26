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
- **Paso 6 — los avisos por correo** (`b93422c` refactor, `6ed8c6d`).
  `segundoPlano` y `urlDelSitio` salen de `datos/auth.ts` a `lib/` para
  compartirse (sin cambio de comportamiento); `correos/mensaje-nuevo.ts`
  (recibe solo la bandeja y el link), `datos/avisos.ts`
  (`destinatariosDe`, `avisosDe`, `guardarAviso`, `avisarMensajeNuevo`) y el
  envío después de contestar desde `recibir.ts`. `tsx --test
  src/datos/avisos.test.ts src/correos/*.test.ts src/datos/formularios/*.test.ts`
  → 18 pasan (el aviso a tres cuentas no lleva «Zoe», su correo ni su texto).
- **Paso 7 — Contacto envía de verdad** (`74e6c64`).
  `lib/formularios/enviar.ts` (`enviarFormulario`, la respuesta `{ ok }` del
  lado del navegador); `features/contacto/`: envío por `fetch`, «Enviando…»
  con `aria-busy`, el error `role="alert"` en `rojo-error`, el campo trampa,
  la línea de privacidad con `MESES_DE_GUARDA`, el cierre sin «listo en tu
  correo» ni «Copiar mensaje». En el navegador de Orca (3019, perfil aislado
  `mensajes`): un envío llegó al cierre («Recibimos tu mensaje…») y dejó la
  fila (`POST /api/contacto 200`; tema «Investigación», la institución en
  `datos`); con el tope agotado (4 envíos por `fetch` + el del formulario) el
  formulario se quedó con lo tipeado, el botón volvió a «Enviar consulta» y el
  error dijo «Ya nos mandaste varios seguidos…». No se probó con la base
  apagada: `ed-postgres` es compartido con otras lanes.
- **Paso 8 — `/sumate-al-equipo`** (`c89f2df`). `features/cv/` (la página
  con el lenguaje de Contacto, `FormularioCV` desde `CAMPOS_DEL_CV`, la
  confirmación que toma el foco), la ruta con 404 si `!cvAbierto()`, el link
  de Contacto por prop; `PaisDropdown` suma `etiqueta` para anunciar «Nivel
  en que enseñás». Sin `CV_ABIERTO`: `/sumate-al-equipo` 404, `POST /api/cv`
  404, el HTML de `/contacto` con 0 links a la página y el `mailto:` del CV.
  Con `CV_ABIERTO=si` en el `.env.local` local: 200, 1 link; un CV mandado
  desde el navegador (México, «Secundaria o media», un PDF de 193 bytes) dejó
  la fila con `datos` y el archivo en `.cv/cv/<id>.pdf`; el archivo da 404 por
  `/.cv/…` y `/cv/…`. Las capturas del navegador embebido fallan («the
  browser tab may not be visible»): la evidencia es por DOM y por la base.
