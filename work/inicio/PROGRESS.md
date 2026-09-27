# PROGRESS — El Inicio del admin

## In progress

- 2026-09-26 — Worktree `inicio` desde `5a07368`, rama `mateo/inicio`,
  `pnpm install` y `pnpm generate` en verde, `.env.local` copiado. SPEC.md
  escrito desde el brief del padre (lane 3c); pedida la aprobación por
  `orca orchestration ask`.
- 2026-09-26 — SPEC aprobado por el padre con un cambio (DECISIONS). PLAN.md
  escrito: 10 pasos.
- 2026-09-26 — **Rebase sobre `origin/main` en `48ed711`** (la 4a,
  `paginas-inicio`, mergeada): conflictos de texto en DESIGN.md §11, el árbol
  de AGENTS.md y el README, resueltos sumando los dos lados. La 4a sumó tres
  tipos de actividad y el tipado los pidió en `QUIEN_VE` y `frase.ts`, como
  estaba previsto: `56c2ae4` (DECISIONS). La 3b sigue sin mergear: «Ver toda
  la actividad» sigue afuera. Los hashes de los pasos son los de después del
  rebase.
- 2026-09-26 — **En pausa con el PR abierto:** los 10 pasos hechos, la
  verificación M en PASS (abajo) y el PR contra `main`. Falta la revisión de
  cierre, que lanza el padre. **Lo que sigue:** los hallazgos de esa revisión
  (si los hay), el rebase sobre el `main` que haya (si la 3b ya está, sumar
  «Ver toda la actividad»; si la 7 sumó tipos de actividad, filas o números,
  conciliar `QUIEN_VE`, `frase.ts` y los registros), y el cierre de la lane
  en el mismo PR.

### Pasos

- **1. El Número en el armazón** — `f9396c2`. `admin/metricas/Tarjeta.tsx` →
  `admin/armazon/Numero.tsx` (`valor: number | null` dibuja «—» con «Sin
  datos» para el lector y «Todavía no hay datos»; `periodo` y `nota`
  opcionales). `PanelMetricas` y `ConDatos` lo importan de ahí, mismas props.
  `pnpm typecheck` exit 0, `pnpm lint` exit 0, `grep -rn "metricas/Tarjeta"
  apps/sitio/src` sin resultados (exit 1).
- **2. Quién ve cada tipo y cómo se lee** — `369d98a`. `datos/actividad.ts`:
  `QUIEN_VE: Record<TipoDeActividad, Capacidad>` (los cuatro, `usarCuentas`)
  y `tiposQueVe(rol)`. `admin/actividad/frase.ts`: `fraseDe({ tipo, quien,
  sobre })` desde un `Record`. Test nuevo en `actividad.test.ts` (sin base):
  dirige y administra ven los cuatro de las cuentas, edita ninguno, un rol
  inválido nada. `pnpm --filter sitio exec tsx --test
  src/datos/actividad.test.ts`: 5 pasan, exit 0; typecheck y lint exit 0.
- **3. El registro de pendientes** — `02578b5`. `datos/inicio/registro.ts`
  (`enOrden`, `visiblesPara`, `leerAisladas`); `datos/inicio/pendientes.ts`
  (`URGENCIAS` con las seis del SPEC §3, `CLAVES_DE_PENDIENTES`, `PENDIENTES`
  con las dos filas, `filasDePendientes(registro, rol)` y
  `pendientesPara(rol)`); `datos/inicio/de-las-paginas.ts`
  (`paginasSinPublicar`, consulta propia sobre `paginas.borradorEn`). Test con
  registro falso: orden por urgencia y registro, la fila que el rol no ve no
  se consulta, `null` no aparece, la que tira queda como fallo.
  `pnpm --filter sitio exec tsx --test src/datos/inicio/pendientes.test.ts`:
  4 pasan, exit 0; typecheck y lint exit 0.
- **4. Esta semana** — `42218e2`. `datos/consultas/metricas.ts` exporta
  `tarjetaDe(dias)` (sale de `tarjetas()`, que la usa);
  `datos/consultas/busquedas.ts` exporta `totalDeBusquedas(desde, hasta)` (lo
  usa también `resumenDeBusquedas`). `datos/inicio/esta-semana.ts`:
  `CLAVES_DE_NUMEROS`, `NUMEROS` (visitantes de la ventana de 7 días; clics de
  los 7 días que terminan en el último copiado contra los 7 anteriores; CV
  con `verCV` y materiales en `null`, con la lane que los conecta) y
  `numerosPara(rol)`. `pnpm typecheck` y `pnpm lint` exit 0;
  `pnpm --filter sitio test`: 156 tests, 155 pasan, 0 fallan, 1 saltado (el
  de antes), exit 0.
- **5. Lo nuevo desde tu visita** — `a8b71ca`.
  `datos/inicio/desde-tu-visita.ts`: `ultimaVisita(cuentaId,
  comienzoDeEstaSesion)` (la «entro» más reciente con `en <` el comienzo),
  `CLAVES_DE_LO_NUEVO`, `LO_NUEVO` (`paginas-publicadas`) y
  `loNuevoPara(rol, desde)`; `de-las-paginas.ts` suma
  `paginasPublicadasDesde(desde)`. Test contra la base: la anterior (ni la de
  esta sesión, ni un `salio`, ni otra cuenta) y `null` sin ninguna.
  `pnpm --filter sitio exec tsx --test src/datos/inicio/desde-tu-visita.test.ts`:
  2 pasan, exit 0; typecheck y lint exit 0.
- **6. La actividad reciente y todo junto** — `7fa3be2`.
  `datos/inicio/actividad-reciente.ts`: `actividadReciente(rol, cuantos = 8)`
  con `tiposQueVe` (sin tipos visibles no consulta), el nombre de la cuenta y
  `en` en ISO, el tipo cerrado recuperado sin `as`. `datos/inicio/inicio.ts`:
  `inicioPara(sesion)` → `{ nombre, desdeTuVisita, pendientes, numeros,
  actividad, verMetricas }`, en paralelo; la última visita y la actividad
  aisladas con `oNull` (en `null`, el bloque dice que no se pudo leer). Sin
  `verTodaLaActividad`: la 3b no está en `main` (`git log HEAD..origin/main`
  vacío), así que el link lo suma ella (DECISIONS). typecheck y lint exit 0.
- **7. La pantalla del Inicio** — `85ef692`. `admin/inicio/`: `Inicio.tsx`
  (encabezado «Hola, <nombre>» con `DesdeTuVisita` en el detalle y los
  accesos rápidos en las acciones; grilla `lg:grid-cols-5`: pendientes y
  actividad en 3, esta semana en 2 con `row-span-2`, así el DOM y el celular
  van pendientes → semana → actividad), `Pendientes.tsx` (`Lista`/`Fila`, la
  insignia fuerte con la cuenta en el `h2`, «Todo al día» con `EstadoVacio`),
  `EstaSemana.tsx` (`Numero` de a dos, el impar a lo ancho, «Ver métricas»
  terciario), `ActividadReciente.tsx` (`fraseDe` y `Momento` relativo; vacío
  y aviso de error), `DesdeTuVisita.tsx` (un solo `<p>`). `modulos.ts` suma
  `accesoRapido?`. `(protegido)/page.tsx`: sesión → `inicioPara` →
  `<Inicio>`. `PanelMetricas` y el link a Páginas salen; comentarios de
  `metricas/page.tsx` y `PanelMetricas` al día. `pnpm typecheck` y
  `pnpm lint` exit 0; `node scripts/verificar-react-doctor.mjs` exit 0,
  100/100 sin diagnósticos (con los archivos nuevos en el índice).
  Dirección visual con `frontend-design` dentro de §11: la única pieza con
  peso fuerte es la insignia de la cuenta de pendientes; lo demás, callado.
- **8. DESIGN.md §11** — `2b3c5d2`. «### Número» (etiqueta, cifra y
  comparación con sus contrastes, sin color en la comparación, «—» sin
  datos) y «### Inicio» (orden de lectura, dos columnas desde `lg`, sin
  primario, la insignia fuerte como único peso, lo que falla lo dice en su
  lugar); `Lista` y `Estado vacío` suman el Inicio a sus consumidores; la
  línea de fechas de §11 suma `work/inicio/`. `git diff --stat -- DESIGN.md`:
  61+ 5−; `grep` encuentra las dos secciones (líneas 650 y 674).
- **9. AGENTS.md §3 y §12** — `8020283`. El árbol suma `datos/inicio/`,
  `admin/inicio/`, `admin/actividad/`, el número en `armazon/` y `QUIEN_VE`
  en `actividad.ts`; §12 suma la regla de sumar al Inicio por registro.
  `grep -n "datos/inicio\|inicio/  " AGENTS.md`: líneas 173, 177 y 661.
- **10. README** — `bc08368`. «La portada del admin» → Métricas (variables)
  y «un Inicio con lo pendiente, los números de la semana y la actividad
  reciente» (Admin). `grep -n "portada" README.md`: sin resultados.

### Arreglos de la verificación

- **Lo que se vio en las capturas** — `c7243fc` (código) y `10a365a`
  (DESIGN.md §11): la semana apilada en la columna angosta, la segunda fila
  de la grilla flexible, los dos títulos de arriba al mismo alto, el detalle
  de Search Console más corto (DECISIONS). typecheck, lint y react-doctor
  100/100 otra vez; `pendientes.test.ts` 4 pasan.

## Verification

### 2026-09-26 — M DoD después del rebase — PASS

Sobre `56c2ae4`, rebaseado sobre `origin/main` en `48ed711` (con la 4a).

- L1 static: `pnpm typecheck` → exit 0 · `pnpm lint` → exit 0 ·
  `node scripts/verificar-react-doctor.mjs` → exit 0 («react-doctor:
  100/100, sin diagnósticos», apps/sitio/src 549 archivos · packages/db/src
  3 · packages/auth/src 17). Antes de `56c2ae4`, el typecheck frenaba en
  `frase.ts` y `actividad.ts` por los tres tipos de la 4a: el `Record` hizo
  lo suyo.
- L2 behavioral: `pnpm migrate:status` contra `ed` → «Database schema is up
  to date!». `pnpm test` contra `ed` → exit 0: packages/auth 28 pasan, 0
  fallan; apps/sitio 185, 184 pasan, 0 fallan, 1 saltado (el de antes).
  `actividad.test.ts` suma que los tres roles ven lo de las páginas.
  `pnpm build` → exit 0 («Compiled successfully», `ƒ /admin`).
- L3 end-to-end, la conciliación (navegador de Orca, perfil aislado nuevo,
  `ed_inicio` con `migrate deploy` de la migración de la 4a y resembrada):
  Raquel (edita) aprieta «Publicar» en el editor de Inicio →
  `POST /admin/contenido/paginas/inicio 200` (`publicar`), `borradorEn` en
  null, fila `publico-una-pagina | Inicio`. Su Inicio: «Desde tu última
  visita, …: se publicó Inicio.», Pendientes 1 («1 página con cambios sin
  publicar» / «Qué hacemos») y la actividad con «Raquel Ayala publicó
  Inicio», sin eventos de sesión. El de Daniela (dirige): los dos pendientes
  y la actividad con los dos tipos. Captura:
  `inicio-edita-actividad-de-paginas.png` (la ventana volvió a 1012 px: se ve
  el rango `sm`–`lg`, números de a dos y el impar a lo ancho).
- La pantalla del Inicio no cambió con el rebase (sus archivos son los
  mismos; `frase.ts` suma tres frases): los contrastes, el 390, el teclado y
  las otras capturas de la corrida de abajo siguen valiendo.
- Close review: la lanza el padre al recibir `worker_done`.

### 2026-09-26 — M DoD (las aceptaciones del PLAN + SPEC §9) — PASS

Sobre `10a365a` (antes del rebase); `origin/main` en `5a07368`.

- L1 static: `pnpm typecheck` → exit 0 · `pnpm lint` → exit 0 ·
  `node scripts/verificar-react-doctor.mjs` → exit 0 («react-doctor:
  100/100, sin diagnósticos», apps/sitio/src 498 archivos · packages/db/src
  3 · packages/auth/src 17). Topes: el componente más largo es `Inicio.tsx`
  (63 líneas), la utilidad más larga `pendientes.ts` (96).
- L2 behavioral: `pnpm test` contra la base `ed` compartida (como el gate
  del padre) → exit 0: packages/auth 28 pasan, 0 fallan; apps/sitio 158, 157
  pasan, 0 fallan, 1 saltado (de antes: «las respuestas grabadas de la API se
  mapean enteras», falta correr A1). Los nuevos: `actividad.test.ts` (quién
  ve cada tipo), `pendientes.test.ts` (orden por urgencia, capacidad antes de
  consultar, `null` no aparece, la que tira queda como fallo),
  `desde-tu-visita.test.ts` (contra la base). `pnpm build` → exit 0
  («Compiled successfully», `ƒ /admin` en la tabla), con el dev server parado.
  Arranca: `next dev -p 3018` en su pestaña de Orca, sirve `/admin/entrar`
  200.
- L3 end-to-end (navegador de Orca, perfil aislado `inicio-3018`, base de
  demo `ed_inicio` sembrada con una cuenta por rol):
  - dirige (Daniela) → «Hola, Daniela» · «Desde tu última visita, el 24/9 a
    las 18:47: se publicó Inicio.» (su «entro» anterior, 50 h antes; Inicio
    publicado 28 h antes) · Pendientes 2: «2 páginas con cambios sin
    publicar» / «Inicio y Qué hacemos» y «Conectá Search Console» · los
    cuatro números: Visitantes 1.204 «+12 % contra la semana anterior»,
    Clics desde Google 84 «−7 %» (84 contra 90, a mano), CV y materiales «—»
    «Todavía no hay datos» · 8 eventos de 11.
  - administra (Gastón) → lo mismo, con «Nada nuevo desde tu última visita»
    (su «entro» anterior es de hace 3 h, después de la publicación).
  - edita (Raquel) → Pendientes 1 (sin Search Console), tres números (sin
    CV, el tercero a lo ancho), y en la actividad «Todavía no hay actividad
    para mostrarte».
  - «Todo al día» sin borradores; «Desde la próxima vez que entres…» sin
    visita anterior; con la tabla `paginas` renombrada a mano, la fila dice
    «No se pudo revisar las páginas», la frase «no se pudo revisar las
    páginas» y el resto de la pantalla sale (tabla restaurada).
  - «Ir a Páginas» lleva a `/admin/contenido/paginas`. Métricas › Resumen
    sigue con sus cuatro tarjetas y «contra el período anterior» (con
    variables de Vercel de mentira en el dev server; el render no llama a la
    API), y su «Visitantes, últimos 7 días» es el mismo 1.204.
  - Contraste medido en el DOM (WCAG 2.x), sobre `10a365a`: mixto y claro
    13,63 (título, filas, número, insignia) · 4,83 (detalles, etiquetas,
    comparación, cuándo) · 5,11 («Ver métricas»); oscuro 13,59 · 7,08 · 7,14.
  - 390 × 844: sin scroll horizontal (`scrollWidth` 375), orden pendientes →
    semana → actividad. Teclado: Tab recorre «Ir a Páginas», «Ver los
    pasos», «Ver métricas», con el foco de 2 px `azul-medio` separado 2 px.
  - Capturas en `%TEMP%\ed-orq\capturas\inicio\`: `inicio-dirige-mixto`,
    `inicio-administra-mixto`, `inicio-edita-mixto`, `inicio-dirige-claro`,
    `inicio-dirige-oscuro`, `inicio-todo-al-dia`, `inicio-fila-que-fallo`,
    `inicio-dirige-390` y `inicio-dirige-390-abajo` (`.png`).
- Close review: la lanza el padre al recibir `worker_done` (1 revisor Opus
  5.5, medium, «el cambio entero contra su SPEC»). No corrida acá, a
  propósito.

## Tried and failed

- 2026-09-26 — `pnpm build` → exit 1, dos veces: «Module not found: Can't
  resolve '@vercel/turbopack-next/internal/font/google/font'» / «next/font/
  google queries have exactly one entry», en `(sitio)/layout.tsx`. Con el dev
  server parado, igual. Causa: la caché de `apps/sitio/.next` inconsistente
  (el primer build corrió con `next dev` abierto sobre la misma carpeta).
  Con `.next` apartada a `%TEMP%` → exit 0. No es del código.

## Hecho

## Abierto

- Al cerrar la lane: borrar la base de demo `ed_inicio`
  (`docker exec ed-postgres psql -U postgres -c "DROP DATABASE ed_inicio;"`)
  y volver el `.env.local` a `ed` (DECISIONS). Hasta entonces el
  `.env.local` apunta a `ed_inicio`, sembrada con tres cuentas de prueba
  (`daniela@ed.test` dirige, `gaston@ed.test` administra, `raquel@ed.test`
  edita). El script de la siembra, fuera del repo:
  `%TEMP%\ed-inicio-sembrar-demo.tmp.ts` (se corre desde `apps/sitio/` con
  `CONTRASENA_DEMO` puesta; la contraseña está en
  `%TEMP%\ed-inicio-demo-pass.txt`).
- Barrido de la pausa: sin `TODO`, `console.log` ni `debugger` nuevos en el
  diff; el script de la siembra salió del repo; el dev server, la pestaña y
  el perfil del navegador (`inicio-3018`), cerrados.
