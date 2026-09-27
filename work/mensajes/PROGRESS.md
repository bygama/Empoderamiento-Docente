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
- **Paso 9 — el número** (`8e1efdb`). `admin/armazon/Numero.tsx`,
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
- **Paso 10 — la bandeja** (`e636d15`). Rutas `mensajes/` (layout con la
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
- **Paso 11 — la ficha y sus acciones** (`e5c614b`). La ficha
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
