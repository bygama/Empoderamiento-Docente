# PROGRESS — Mensajes

## In progress

- **Estado (2026-09-26): cerrada.** Revisión de cierre r1 (Opus 5.5, medium,
  «el cambio entero contra su SPEC») en PASS sobre `dce306f`: 0 Critical,
  0 Important, 4 Minor y dos notas fuera de su lente. Ronda de arreglos
  hecha (abajo, «Ronda r1»); la lane se cierra en el PR #185 con el commit
  que borra `work/mensajes/`.

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

- **Paso 1 — las tablas** (`f38ddb2`). `prisma/schema/mensajes.prisma`
  (`mensajes`, `limites_por_ip`, `avisos`) y las relaciones en `User`;
  migración `20260926231819_mensajes` con `pnpm migrate`. `pnpm
  migrate:status` → «Database schema is up to date!»; `pnpm typecheck` exit 0.
- **Paso 2 — las listas en un solo lugar** (`3ab5a85`). `config/mensajes.ts`
  (bandejas, estados, `capacidadDe`), `config/privacidad.ts`
  (`MESES_DE_GUARDA`, `DIAS_DE_SPAM`, `seBorraEl`, los bordes),
  `config/cv.ts` (la lista PROVISORIA, `COLUMNAS_DEL_CV`, `MAXIMO_DEL_CV`,
  `cvAbierto`), `lib/formularios/campos.ts` (`esquemaDe`, `valoresDe`,
  `datosDe`). `tsx --test src/config/*.test.ts src/lib/formularios/*.test.ts`
  → 10 pasan, 0 fallan; typecheck y lint exit 0.
- **Paso 3 — el tope por IP** (`282e1b3`). `lib/formularios/limite.ts`
  (`ipDelPedido`, `claveDeLimite` con HMAC) y `datos/limites-por-ip.ts`
  (`sumarEnvio` en un solo `INSERT … ON CONFLICT … RETURNING`,
  `podarLimites`). `tsx --test src/datos/limites-por-ip.test.ts
  src/lib/formularios/limite.test.ts` → 5 pasan (diez envíos a la vez cuentan
  diez); typecheck y lint exit 0.
- **Paso 4 — el almacén privado** (`884976a`).
  `lib/formularios/almacen-privado.ts` (Blob `access: "private"` con token
  explícito, disco con clave `carpeta/uuid.ext`, y sin token donde no hay
  disco propio, error), `lib/formularios/pdf.ts` (`esPdf` por los bytes),
  `.cv/` en el `.gitignore` de la app. 4 pasan; typecheck y lint exit 0.
- **Paso 5 — recibir** (`c2c2583`). `datos/formularios/recibir.ts` (la
  respuesta `{ ok }`, el tope, `motivoSinDatos` para que el log no lleve lo
  que llegó), `contacto.ts` (JSON, 5 por hora) y `cv.ts` (multipart, 3 por
  hora, archivo antes que la fila, 503 en Vercel sin token), y las dos rutas
  que solo delegan. Ruling: «sin disco» es `VERCEL` y no `NODE_ENV`, para que
  un `next start` local pueda guardar (DECISIONS). `tsx --test
  src/datos/formularios/*.test.ts src/lib/formularios/*.test.ts` → 19 pasan;
  las pruebas dejan `mensajes` y `limites_por_ip` en 0 filas.
- **Paso 6 — los avisos por correo** (`d9fdfa2` refactor, `a32ac16`).
  `segundoPlano` y `urlDelSitio` salen de `datos/auth.ts` a `lib/` para
  compartirse (sin cambio de comportamiento); `correos/mensaje-nuevo.ts`
  (recibe solo la bandeja y el link), `datos/avisos.ts`
  (`destinatariosDe`, `avisosDe`, `guardarAviso`, `avisarMensajeNuevo`) y el
  envío después de contestar desde `recibir.ts`. `tsx --test
  src/datos/avisos.test.ts src/correos/*.test.ts src/datos/formularios/*.test.ts`
  → 18 pasan (el aviso a tres cuentas no lleva «Zoe», su correo ni su texto).
- **Paso 7 — Contacto envía de verdad** (`4565585`).
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
- **Paso 8 — `/sumate-al-equipo`** (`afad613`). `features/cv/` (la página
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
- **Paso 9 — el número** (`fcd9e51`). `admin/armazon/Numero.tsx`,
  `numero` en `ItemDeNavegacion` y en `Pestanas`, `nuevosPorBandeja(rol)` en
  `datos/consultas/mensajes.ts`, `BarraLateral` lo cuenta junto con el punto.
  Cuentas de prueba en `ed_mensajes`: `admin.mensajes@ed.test` (administra) y
  `edita.mensajes@ed.test` (edita), contraseña elegida por «Olvidé». En el
  navegador, con 5 contactos y 1 CV nuevos: la entrada dice «Mensajes 6 (6
  sin leer)» para administra y «Mensajes 5 (5 sin leer)» para edita. Colores
  leídos por `getComputedStyle` en los tres temas (cookie `tema-del-admin`):
  claro blanco sobre `#1F2D4D` (13,63:1), mixto `#33466C` sobre blanco
  (9,40:1), oscuro `#172239` sobre `#E8EEF7` (13,59:1). DESIGN.md §11 «El
  número». Typecheck y lint exit 0.
- **Paso 10 — la bandeja** (`49ee86e`). Rutas `mensajes/` (layout con la
  guarda de Contacto, `page.tsx` que redirige con `bandejaConMasNuevos`,
  `[bandeja]/page.tsx` con la guarda de su capacidad, `error.tsx`),
  `admin/mensajes/` (encabezado con pestañas-bandeja y su número, la lista,
  los vacíos por estado), `admin/armazon/Filtro.tsx` y `Buscador.tsx`,
  `listarMensajes`; la guía de Mensajes sale de `guias.ts`. `guarda.test.ts`
  → 4 pasan. En el navegador: `/admin/mensajes` → `/admin/mensajes/contacto`
  («Contacto · Admin ED», pestañas «Contacto 5 · CV 1», filtro «Nuevo 5» activo);
  `?q=talleres` deja una fila; `?estado=spam` y `?estado=cerrado&q=zzz` dicen
  su vacío; como edita, sin pestañas y `/admin/mensajes/cv` en «Esta sección
  es de quien dirige o administra». A 390 de ancho: sin desborde de página
  (`scrollWidth` 375), el filtro scrollea de costado adentro de su fila y el
  buscador ocupa el ancho. DESIGN.md §11 «Filtro» y «Buscador».
- **Paso 11 — la ficha y sus acciones** (`b86573a`). La ficha
  (`FichaDelMensaje`, `AccionesDelMensaje`, `formato.ts`), `Volver` en el
  slot `volver` del `Encabezado`, `Confirmacion`; `mover-mensajes.ts` (la
  lógica, probada contra la base) y las cuatro Server Actions que solo
  verifican y delegan; cinco tipos en `actividad.ts`;
  `ficha-de-mensaje.ts` aparte para que `consultas/mensajes.ts` quede en 85
  líneas; la descarga `descargarCV` y su ruta. `tsx --test
  src/datos/acciones/acciones-con-sesion.test.ts
  src/datos/acciones/mover-mensajes.test.ts` → 16 pasan. En el navegador:
  Nuevo → «Lo tomo yo» → En curso («Tomado por vos», «Responder» primario) →
  «Cerrar» → «Marcar como spam» («Se borra el 27/10/2026») → «Lo tomo yo»;
  la actividad quedó con el tema («Investigación») y sin el nombre. «Borrar
  ahora» muestra la pregunta con el foco en «Cancelar» (que la lleva como
  descripción); «Sí, borrar» vuelve a `?borrado=1` con «Se borró el mensaje
  para siempre.» y deja `borro-un-mensaje` sin `sobre_id`. Descarga del CV:
  como administra 200, `application/pdf`, adjunto «CV de Bruno Prueba
  CV.pdf», `no-store`, 193 bytes que empiezan por `%PDF-`; sin cookie el
  proxy da 307 a entrar (antes que la ruta: el 401 del SPEC §3 lo da la ruta
  con una cookie que no es una sesión, probado con una falsa); como edita
  403 «No tenés permiso para hacer eso.». DESIGN.md §11 «Volver» y
  «Confirmar lo que no se deshace».
- **Paso 12 — Mi cuenta › Avisos** (`b9677e5`). `FormularioDeAvisos` en un
  `Apartado` nuevo de `MiCuenta`, `guardarMisAvisos` (en `SIN_CAPACIDAD` con
  su motivo; solo toca las bandejas del rol). `acciones-con-sesion.test.ts` →
  13 pasan. En el navegador: Ana (administra) ve «mensaje nuevo de Contacto»
  y «CV nuevo», las dos marcadas; apagó Contacto («Listo: tus avisos quedaron
  así.», fila `avisos` con `activo = f`); Eva (edita) ve solo Contacto. Un
  contacto nuevo («Carla Aviso») mandó el aviso solo a
  `edita.mensajes@ed.test`, y el correo no dice «Carla». DESIGN.md §11
  registra la casilla (ya la usaba el editor) y suma Avisos a los apartados.
- **Paso 13 — la retención** (`d7122e1`). `datos/tareas/retencion-de-mensajes.ts`
  (`retencionDeContacto`, `retencionDeCV` con los archivos,
  `podaDeLimitesPorIp`) en `TAREAS_DIARIAS`. `tsx --test
  src/datos/tareas/retencion-de-mensajes.test.ts src/datos/tareas/poda-de-actividad.test.ts`
  → 4 pasan (con «hoy» en 2001: «Se borraron 2 mensajes de Contacto: 1 de
  más de 24 meses y 1 de spam de más de 30 días.»; «Se borró 1 CV con su
  archivo.», el archivo fuera y la corrida registrada).
- **Paso 14 — la documentación** (`829b906`). ADR-0012 (con el porqué del
  correo sin datos), su fila en el índice, README (variables y «Mensajes»,
  con los pasos para encender el CV), `.env.example`, el spec del admin §5 y
  §7, AGENTS.md §3. Chequeo de links relativos de los `.md` tocados: 70
  links, 1 roto que no es de esta lane (`work/edicion-de-paginas/` en el
  README, que vino de `main`; ver Abierto).
- 2026-09-26 — **Rebase sobre `origin/main`** (entró la lane 4a,
  `paginas-inicio`, con `versiones_de_paginas`). Conflictos resueltos a mano,
  quedándose con los dos lados: `Pestanas.tsx` (su `sobreAzul` más el
  `gap-2` del número), la intro de DESIGN.md §11 y la sección Lista,
  `actividad.ts` (sus tipos y los de Mensajes), `acciones-con-sesion.test.ts`
  (sus excepciones ya no están; queda la de avisos), AGENTS.md §3 y el README.
  Mi migración (`…231819_mensajes`) queda después de la suya
  (`…231213_versiones_de_paginas`) y no se tocan: `pnpm migrate:deploy`
  aplicó la suya en `ed_mensajes` y `pnpm prisma migrate diff
  --from-config-datasource --to-schema prisma/schema --script` dio «This is
  an empty migration.». Los hashes de arriba son los de después del rebase.
- 2026-09-26 — **react-doctor dio 87/100 con 7 diagnósticos** en código de
  esta lane (awaits en serie, awaits en un loop, `includes` en un loop, un
  `fetch` leído sin mirar el estado); arreglados por código en `91e4a0c`,
  sin apagar nada.
- 2026-09-26 — **Arreglo encontrado en el e2e** (`66b43e4`): «Se borra el…»
  salía en hora universal y «Llegó el…» en la de quien mira (un contacto de
  las 21:18 del 26/9 decía que se borraba el 27/9/2028). `Momento` suma `dia`
  y la ficha lo usa.

- 2026-09-26 — **Ronda r1** (lo que pidió el padre con el PASS de r1):
  - Minor 1 (`f2e52d4`): el detalle de la retención de CV desglosa el spam
    («Se borraron 2 CV con sus archivos (1 de spam).»); el test suma un CV
    de spam vencido. `tsx --test src/datos/tareas/retencion-de-mensajes.test.ts`
    → 2 pasan.
  - Minor 2 (`4d690f1`): el ADR-0012 suma «Lo que no se hace» (exportar a
    planilla, responder desde el admin, guardar el origen en un CV).
  - Fuera de lente, el cuerpo sin tope (`98c816a`): `lib/formularios/cuerpo.ts`
    (`leerConTope`, que corta al pasar el máximo y cancela la fuente; la
    cabecera, si ya se pasa, frena antes; `comoJson`, `comoFormData`);
    `/api/contacto` y `/api/cv` lo usan y `largoDelPedido` sale. Un cuerpo
    chunked de más, sin `Content-Length`, recibe 413 habiendo leído menos
    de 10 de 100 pedazos de 16 KB (Contacto) y menos de 300 de 400 (CV).
    `tsx --test src/datos/formularios/*.test.ts src/lib/formularios/*.test.ts`
    → 23 pasan.
  - Fuera de lente, la cabecera de la descarga (`9b19505`): con `next start`
    en el 3029 el proxy también pisaba la de la ruta (401 con
    `cache-control: no-store, max-age=0`). Arreglado en la fuente: el proxy
    pone `private, no-store, max-age=0` en todo `/admin` (DECISIONS). Con
    `next start` después del cambio: la descarga como administra da 200,
    `cache-control: private, no-store, max-age=0`, `application/pdf`,
    adjunto «CV de Bruno Prueba CV.pdf», `nosniff`, 193 bytes que empiezan
    por `%PDF-`; `/admin/entrar` sale con la misma cabecera.
    `tsx --test src/proxy.test.ts` → 9 pasan.
  - Quedan como están (el padre): Minor 3 (el 429 y el 500 dicen «escribinos
    a…» igual) y «PDF · 1,2 MB».
  - Minor 4, por qué no se probó el error con la base apagada: `ed-postgres`
    es un solo contenedor para todas las lanes en vuelo (`ed`, `ed_mensajes`
    y las demás); apagarlo tira los dev servers y los tests de otras
    sesiones. El camino de error del formulario se probó con el 429 (mismo
    `{ ok: false, error }`, misma línea en el formulario), y el 500 es la
    misma respuesta con otro texto (`noSePudo`).

## Verification

### 2026-09-26 — L DoD (PLAN.md) — PASS, sobre `66b43e4` rebasado en `origin/main` (`48ed711`)
- L1 static: `pnpm typecheck` → exit 0; `pnpm lint` → exit 0;
  `node scripts/verificar-react-doctor.mjs` → exit 0 («react-doctor: 100/100,
  sin diagnósticos (apps/sitio/src: 596 archivos · packages/db/src: 3
  archivos · packages/auth/src: 17 archivos)»). Topes: el componente más
  largo que toca la lane es `ContactoExperiencia.tsx` con 198 líneas; la
  utilidad más larga, `datos/formularios/cv.ts` con 97.
- L2 behavioral: `pnpm test` → exit 0 (`@ed/auth` 28 pasan; `sitio` 215: 214
  pasan, 0 fallan, 1 saltado que ya estaba); `pnpm build` → exit 0 (las rutas
  `/admin/mensajes`, `/admin/mensajes/[bandeja]`, `…/[id]`, `…/[id]/archivo`,
  `/api/contacto`, `/api/cv` y `/sumate-al-equipo` en el informe); arranca:
  `next dev -p 3019` → «Ready in 366ms». Migraciones: `pnpm migrate:status`
  → «Database schema is up to date!» con 14.
- L3 end-to-end (navegador de Orca, dev server del 3019, perfiles aislados
  `mensajes` y `mensajes-edita`), después del rebase: `/contacto?tema=formacion`
  → «Enviando…» → cierre «Recibimos tu mensaje…», fila `contacto · nuevo ·
  Formación y acompañamiento`; `/admin/mensajes` → Contacto con «Contacto 6 ·
  CV 1» y la sidebar «Mensajes 7 (7 sin leer)»; la ficha → «Lo tomo yo» → En
  curso, «Tomado por vos», «Se borra el 26/9/2028»; el aviso del contacto
  salió solo para Eva (Ana lo apagó); la descarga del CV: Ana 200
  `application/pdf` que empieza por `%PDF-`, Eva 403. Antes del rebase, en
  la misma sesión: tope 429 y error en el formulario, CV cerrado (404, sin
  link) y abierto (200, PDF guardado en `.cv/`), filtros, búsqueda, vacíos,
  «Sin permiso» de edita, 390 de ancho, los tres temas, tomar · cerrar ·
  spam · borrar con confirmación y la actividad (ver pasos 7 a 12).
- Close review: la abre el padre al recibir `worker_done` (1 revisor Opus
  5.5, medium, «el cambio entero contra su SPEC», DECISIONS del padre); esta
  lane no la corre.

## Abierto

- **Las filas del Inicio** («CV nuevos», «mensajes sin leer», «CV que se
  borran en 7 días»): la lane 3c (`inicio`) no está en `main` al rebasear.
  Quien llegue segundo las suma con `nuevosPorBandeja(rol)`
  (`datos/consultas/mensajes.ts`) para las dos primeras; la tercera necesita
  una consulta más (CV con `recibidoEn` a menos de 7 días de
  `bordeDeGuarda("cv", hoy)`), que no se escribe sin su consumidor (SPEC §11).
- **Buscador y «volver»**: nacen acá; si la lane 3b (`cuentas`) deja los
  suyos en `main` antes, al rebasear se consumen los suyos y se borran estos
  (DECISIONS).
- **De afuera**: el store privado de Blob (`CV_BLOB_READ_WRITE_TOKEN`), los
  campos del CV y la política de privacidad (ED) antes de `CV_ABIERTO=si`; el
  dominio de Resend para que los avisos salgan en producción.
- **No es de esta lane, visto al pasar**: el README de `main` linkea
  `work/edicion-de-paginas/`, una carpeta que ya no existe.
- **Sin capturas**: `orca screenshot` falla con «the browser tab may not be
  visible or the window may not have focus»; la evidencia visual es por DOM
  (`getComputedStyle`, `innerText`) y la base.
- Local, fuera del repo: `CV_ABIERTO=si` quedó en el `.env.local` de este
  worktree para probar el CV, y `ed_mensajes` tiene las cuentas y los
  mensajes de prueba.
