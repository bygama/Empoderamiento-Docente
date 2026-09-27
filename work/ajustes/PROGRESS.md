# PROGRESS — Ajustes

## In progress

- 2026-09-26 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado y apuntado a la base propia `ed_ajustes` (creada en `ed-postgres`),
  `pnpm migrate:deploy` con todas las migraciones de `main`. SPEC.md escrito
  desde el brief del padre (lane 10), con la API de inspección de URL de
  Search Console verificada contra su referencia.
- 2026-09-26 — SPEC aprobado por el padre con las cuatro recomendaciones
  (DECISIONS). Rebasada sobre `main` en `293e7ba` (Cuentas mergeada: la
  migración `segundo_factor_y_cuentas` aplicada en `ed_ajustes`). PLAN.md
  escrito: 20 pasos. Arranca work-run.

- 2026-09-26 — **Paso 1** (`557b908`): `datos_del_sitio` (modelo en
  `prisma/schema/ajustes.prisma`, migración `20260927021916_datos_del_sitio`
  con `CHECK (id = 1)` y el `INSERT` de los datos de hoy),
  `config/datos-del-sitio.ts` (tipo, esquema Zod, `DATOS_INICIALES`) y
  `datos/consultas/sitio.ts` (`datosDelSitio()`, respaldo como
  `contenidoDe`). `pnpm migrate:status` al día; `T` de los dos tests: 11/11;
  `pnpm typecheck` verde. Una segunda fila la rechaza el `CHECK` (probado a
  mano con psql).
- 2026-09-26 — **Paso 2** (`c402143`): Contacto y CV validan el país contra
  `datosDelSitio().paises` (`camposDelCV(paises)` en `config/cv.ts`,
  `camposDeContacto` en `datos/formularios/contacto.ts`), el formulario de CV
  recibe sus campos por props, y el «escribinos a …» sale del correo de la
  base (`escribinosA`). Arreglo en `lib/formularios/campos.ts`: la unión del
  campo opción opcional decía «Invalid input» (DECISIONS). `T` de
  `config/cv`, `formularios/contacto`, `formularios/cv` y `lib/formularios/campos`:
  20/20; typecheck verde.
- 2026-09-26 — **Paso 3** (`166c9ed`): el layout del sitio lee
  `datosDelSitio()` y pasa correo, redes y países al pie y al menú del
  celular; Contacto, Sumate y Novedades a sus features. `config/site.ts` queda
  con la marca, sin las personas de referencia. `git grep -nE
  "siteConfig.(contacto|paises|redes|direccion)"` sale 1; typecheck y lint
  verdes. En el dev server (3025), `/contacto` trae el correo, la oficina,
  los cinco países en el pie y «a los 24 meses».
- 2026-09-26 — **Pasos 4 y 5, en un commit** (`8024dd8`, DECISIONS):
  `plazos_de_retencion` (migración `20260927023035_plazos_de_retencion` con
  los tres de antes desde 1970), `config/privacidad.ts` puro con la regla del
  menor (`plazoPara`, `vencidos`, `seBorraEl(m, plazos)`, topes,
  `esquemaDePlazos`, `aLos`), `datos/privacidad.ts` (`plazosDeLaBase` sin
  respaldo para la retención, `plazosDeGuarda` con respaldo para mostrar,
  `llegoVencido`), y todos sus consumidores. `git grep -nE
  "MESES_DE_GUARDA|DIAS_DE_SPAM"` sale 1; `T` de `config/privacidad`,
  `datos/privacidad`, `tareas/retencion-de-mensajes` e
  `inicio/de-los-mensajes`: 16/16; typecheck, lint y `migrate:status` verdes.
- 2026-09-26 — **Paso 6** (`1044e27`): `config/avisos.ts` (el registro) y
  `datos/avisos.ts` sobre él, con `avisosDeTodas(rol)` (vacío sin
  `usarAjustes`) y `ponerQuienRecibe`; Mi cuenta dibuja el registro. Una
  cuenta suspendida deja de recibir avisos (DECISIONS). `T src/datos/avisos.test.ts`:
  5/5; typecheck y lint verdes.
- 2026-09-26 — **Paso 7** (`f0f276b`): `rutasDelSitio()`, `app/sitemap.ts` y la
  línea `Sitemap:` en robots. `T` de `rutas-del-sitio`: 3/3; en el 3025,
  `/sitemap.xml` trae las 9 rutas con el dominio real y `/robots.txt` la línea.
- 2026-09-26 — **Paso 8** (`760324a`): migración `redirecciones_a_mano`,
  `lib/seo/redirecciones.ts` (validación y `rutaDeSegmentos`),
  `datos/consultas/redirecciones.ts`, `datos/acciones/editar-redirecciones.ts`
  (DECISIONS: el PLAN decía `datos/redirecciones.ts`) y la ruta atrapa-todo,
  dinámica, con el 308. `T` de la validación y de la base: 9/9; con curl, una
  fila en la base da `308 -> /contacto` (con «ñ» en la ruta) y, borrada, 404
  sin caché.
- 2026-09-26 — **Paso 9** (`492d4ab`): migración `indexacion_de_urls`,
  `lib/busquedas/inspeccion.ts` con su respuesta grabada, la tarea
  `indexacion-de-google` en `TAREAS_DIARIAS` y `leerIndexacion(rol)`. `T` de
  la inspección y de la tarea: 8/8 (tope de 20, orden, borrado de las viejas,
  corte con 429, freno de 35 s, sin variables).
- 2026-09-26 — **Paso 10** (`ee40f44`): `config/conexiones.ts` y
  `estadoDeLasConexiones`. `T src/datos/conexiones.test.ts`: 5/5 (nunca el
  valor de una variable).
- 2026-09-26 — **Paso 11** (`a613676`): los cinco tipos de actividad, con su
  frase y el módulo «Ajustes» del filtro de Cuentas › Actividad. `T` de
  actividad, frase y filtros: 10/10.
- 2026-09-27 — **Paso 12** (`9f61bbd`): `admin/armazon/Tabla.tsx` (y `SiONo`);
  la tabla de permisos la consume; DESIGN.md §11 «Tabla». En el 3025, la de
  permisos sale igual: caption, encabezados con `scope`, «Sí» dicho, scroll de
  costado.
- 2026-09-27 — **Paso 13** (`1d7171d`): el módulo, su índice con las cinco
  tarjetas leídas aisladas, y la guía de Ajustes fuera de `por-hacer/`.
  `guarda.test.ts` 7/7. Hubo que reiniciar el dev server: guarda el cliente de
  Prisma en `global` y no veía la tabla nueva.
- 2026-09-27 — **Paso 14** (`2175513`): Datos del sitio. En el 3025: un correo
  inválido vuelve a su campo con el foco y el resumen; editarlo borra el
  error; con cambios, el encabezado navy (verificado terminando las
  transiciones: la pestaña está oculta y no avanzan); guardar publica —el
  aviso, «Cambiados el 27/9/2026 por Ada Ajustes», `/contacto` con el correo
  nuevo, la fila y la actividad—. El correo volvió al original.
- 2026-09-27 — **Paso 15** (`18e53ab`): SEO. En el 3025: «desde» una página
  que existe y «desde = hacia» vuelven a su campo (el de «hacia» no se veía:
  arreglado en el mismo paso); una válida se agrega, se sigue con 308 y se
  borra confirmando, con el foco en «Cancelar»; el aviso sobrevive a la tabla
  vacía. Con variables de Search Console falsas y filas de prueba, la tabla de
  indexación y la revisión fallida en rojo; todo eso se sacó después.
- 2026-09-27 — **Paso 16** (`53c57a0`): Avisos. Apagar el de CV de la única
  que lo recibe: «Nadie va a recibir…», la insignia fuerte en el índice y la
  casilla apagada en Mi cuenta; se volvió a prender.
- 2026-09-27 — **Paso 17** (`738d1f4`): Privacidad. Con un CV de prueba de
  hace 8 meses, CV a 6: la confirmación cuenta «1 CV» en el lugar del botón;
  confirmar guarda, anota «CV, de 12 meses a 6 meses», la línea dice desde
  cuándo rige y el Inicio muestra el pendiente con el plazo nuevo. Fila y CV
  de prueba borrados. `T src/datos/privacidad.test.ts`: 5/5, en una
  transacción que se descarta.
- 2026-09-27 — **Paso 18** (`0d99268`): Conexiones. En el 3025, las seis, con
  las variables que faltan por nombre y la corrida fallida en rojo con «Nunca
  salió bien».
- 2026-09-27 — **Paso 19** (`c63df95`): ADR-0014 (enmienda al 0012) y su fila
  en el índice. `git diff --stat HEAD~1 -- docs/architecture/adrs`: el ADR y
  el índice.
- 2026-09-27 — **Paso 20** (`e74915a`, `83a51e2`, `2408e31`, `ddbd346`, en
  commits por scope): AGENTS.md §5.3 y §3; README (Ajustes, la indexación,
  los plazos); `docs/README.md` y AI_GUIDELINES §13, que mandaban los datos
  de contacto a `config/site.ts` (no estaban en el SPEC §10: quedaban
  diciendo algo falso); el spec del admin (§5, §6 y §9); DESIGN.md §11 (los
  usos de Ajustes, el apartado de un solo formulario y la coma de la casilla).
  `git grep -n "config/site.ts" -- AGENTS.md`: solo la línea de la marca y el
  tilde histórico de §13.
- 2026-09-27 — Los 20 pasos hechos. Arranca work-verify.
- 2026-09-27 — **Rebase sobre `main` (`77611c1`) y conciliación**, en siete
  commits (DECISIONS); después, el gate entero y la verificación (abajo).
- 2026-09-27 — PR #190 abierto y `worker_done`. Revisión r1 del padre (Opus
  5.5, medium) sobre `7c49911`: PASS con 1 Important y 1 Minor (el veredicto
  lo tiene el padre; acá, lo que trajo la tarea de la ronda).
- 2026-09-27 — **Ronda de arreglos 1:**
  - **Important — éxito falso en las redirecciones a mano:** «desde» se
    chequeaba solo contra el sitemap. Arreglo: `config/rutas.ts`
    (`RUTAS_DE_LA_APP`), `lib/seo/rutas.ts` y `config/rutas.test.ts`, que
    recorre `app/` y `public/`; borrar y la tabla dicen si la ruta la
    contesta el sitio (DECISIONS).
  - **Minor — avisos:** `cambio-quien-recibe-un-aviso` solo si cambió algo.
  - **Queda como está** (lo decidió el padre): los hashes viejos de este
    archivo, que se borra al cerrar, y el texto de «Nadie recibe…».
- **Observación para ED** (de la revisión, fuera de esta lane): los países que
  nombran «En números» del Inicio y la meta description siguen escritos en el
  contenido de la página: no salen de los datos del sitio. Los dos se editan desde
  el admin (la sección «En números» de Inicio y su pestaña SEO), así que si ED
  suma o saca un país en Ajustes, conviene revisar también esos dos textos.
- 2026-09-27 — Re-revisión r2 (el mismo revisor) sobre `79b545d`: **PASS**, el
  Important y el Minor cerrados (13 rutas vivas rechazadas, el caso bueno con
  308, la mutación del test que falla como debe, las 60 rutas del manifiesto
  cubiertas). Un Minor de borde para el cierre (lo trajo la tarea; el
  veredicto lo tiene el padre).
- 2026-09-27 — **Ronda 2 y cierre:** «desde» con «/_» se rechaza entero
  (`/_*/[[...todo]]` en `config/rutas.ts`, en lugar de `/_next`), con
  `/_not-found` y `/_global-error` en su test (`b6bf33e`). Barrido: sin
  servidores en pie, las pestañas y los perfiles `ajustes` y `ajustes-edita`
  del navegador de Orca borrados, nada sin commitear. La base `ed_ajustes`
  queda (la borra quien cierre el worktree). Lane cerrada: el commit que
  sigue a este borra `work/ajustes/`, adentro del PR #190.

## Verification

### 2026-09-27 — L DoD, ronda 2 y cierre — PASS

Sobre `b6bf33e`; `main` sigue en `77611c1`.

- L1 static, en limpio (sin `next-env.d.ts` ni `.next`): `pnpm typecheck` →
  exit 0; `pnpm lint` → exit 0; `node scripts/verificar-react-doctor.mjs` →
  exit 0, «react-doctor: 100/100, sin diagnósticos (apps/sitio/src: 844
  archivos · packages/db/src: 3 archivos · packages/auth/src: 27 archivos ·
  packages/kit-admin/src: 19 archivos)».
- L2 behavioral: `pnpm test` → exit 0: kit-admin 3/3, auth 46/46, sitio
  369/370 (el salteado de siempre). Mutación: con `/_next/[[...todo]]` en vez
  de `/_*/[[...todo]]`, `config/rutas.test.ts` falla 2 de 5 (en
  `/_not-found`); restaurado, 5/5. `pnpm build` → exit 0 (`.next` borrada
  justo antes). Cruce con el manifiesto del build: **60 rutas**, las 43
  concretas las contesta el sitio solo (ninguna se acepta como «desde») y las
  17 con segmentos están declaradas. Arranca: `next start -p 3026` → `/`,
  `/contacto`, `/admin/entrar` y `/sitemap.xml` en 200; `/_not-found` 404 y
  `/_global-error` 500, los contesta Next sin pasar por la atrapa-todo.
- L3: el flujo de las redirecciones no cambió desde la ronda 1 (abajo); el
  arreglo es la declaración, y lo prueban su test y el cruce.
- Close review — r2, el mismo revisor (Opus 5.5, medium): PASS sobre
  `79b545d`, con el Minor de «/_» arreglado acá (mecánico: su prueba es el
  test y la mutación de arriba).

### 2026-09-27 — L DoD, ronda de arreglos 1 — PASS

Sobre `7c49911` más los arreglos de la ronda; `main` sigue en `77611c1`.

- L1 static, en limpio (sin `next-env.d.ts` ni `.next`): `pnpm typecheck` →
  exit 0; `pnpm lint` → exit 0; `node scripts/verificar-react-doctor.mjs` →
  exit 0, «react-doctor: 100/100, sin diagnósticos» (sitio 844 archivos, db 3,
  auth 27, kit-admin 19).
- L2 behavioral: `pnpm test` → exit 0: kit-admin 3/3, auth 46/46, sitio
  369/370 con el mismo salteado de antes («falta correr A1»). Nuevos: los 4 de
  `lib/seo/rutas.test.ts`, los 5 de `config/rutas.test.ts` (el recorrido de
  `app/` y `public/`, las cuatro rutas de la revisión y el caso bueno) y 2 de
  `editar-redirecciones.test.ts` contra la base. `pnpm build` → exit 0. El
  cruce de `RUTAS_DE_LA_APP` con `.next/app-path-routes-manifest.json`: 58
  de sus 60 rutas, ninguna sin cubrir. *(El cruce salteaba las que empiezan con
  «/_»: son 60, y `/_not-found` y `/_global-error` las cubría la atrapa-todo;
  lo encontró r2 y se arregló en la ronda 2.)*
- L3 end-to-end (`next start` en 3026, navegador de Orca, perfil `ajustes`,
  Ada): `/sumate-al-equipo`, `/sitemap.xml`, `/robots.txt` y
  `/novedades/rss.xml` dan el error en «Desde» («… ya existe en el sitio: una
  redirección ahí nunca se aplicaría.»), y `/equipo/daniela-reyes.jpg` el de
  los archivos; siguen dando 404/200/200/200 (curl). `/taller-ronda-1` se
  agrega («Listo…»), da 308 a `/`, y borrada dice «vuelve a dar la página de
  error» y da 404. Una fila a mano desde `/robots.txt` puesta en la base: la
  fila dice «No se aplica…», la confirmación y el aviso dicen que no cambia
  nada, y `/robots.txt` sigue en 200. Filas de prueba borradas.
- Close review: la vuelve a abrir el padre, con el mismo revisor.

### 2026-09-27 — L DoD — PASS

Sobre `main` en `77611c1`, HEAD `8f69840` (rebasada y conciliada: DECISIONS).

- L1 static: `pnpm typecheck` → exit 0 (db, kit-admin, auth, sitio: Done);
  `pnpm lint` → exit 0; `node scripts/verificar-react-doctor.mjs` → exit 0,
  «react-doctor: 100/100, sin diagnósticos» (sitio 840 archivos, db 3, auth 27,
  kit-admin 19). La primera corrida después del rebase dio 90/100 con dos
  diagnósticos, arreglados por código en `92483b9` y `8f69840` (DECISIONS).
- L2 behavioral: `pnpm test` → exit 0: kit-admin 3/3, auth 46/46, sitio
  358/359 con 1 salteado que ya estaba (las respuestas grabadas de Vercel, «falta
  correr A1»). `pnpm build` → exit 0: `/contacto`, `/` y `/sitemap.xml`
  estáticas, `/[...resto]` y las seis de Ajustes dinámicas.
  `pnpm migrate:status` → «Database schema is up to date!». Arranca:
  `next start -p 3026` → «Ready in 215ms»; `next dev -p 3025` sirve todo.
- L3 end-to-end, en el navegador de Orca (perfiles aislados `ajustes` y
  `ajustes-edita`) y con curl:
  - **Revalidación en producción** (`next start`, 3026, como Ada, administra):
    Datos del sitio con un correo nuevo → `/contacto`, `/` y `/que-hacemos`
    (estáticas) lo muestran en la visita siguiente; de vuelta al original,
    igual. Privacidad, Contacto de 24 a 18 → `/contacto` dice «a los 18
    meses»; de vuelta a 24, «a los 24». Filas de prueba borradas.
  - **Permiso** (`next start`, como Eli, edita): las seis pantallas de
    Ajustes dicen «Esta sección es de quien dirige o administra», y el HTML
    entero (fetch con su sesión) no trae ninguno de 16 textos de Ajustes
    (correos de las cuentas, `VERCEL_TOKEN`, «Rige desde», la dirección…).
    Control: la misma sonda como Ada los encuentra en cada pantalla.
  - **Redirecciones:** agregada desde la pantalla, `/taller-2025` → 308 a
    `/contacto`; borrada con la confirmación en su lugar (foco en «Cancelar»),
    404 otra vez; con «ñ» en la ruta, 308 (curl). Errores de «desde» y de
    «hacia» en su campo.
  - **Contraste WCAG** medido sobre cada texto visible de las seis pantallas,
    en claro, mixto y oscuro (3026): ninguno por debajo de AA; el mínimo,
    4,54:1 (el primario naranja de §7), 6,01:1 en el oscuro.
  - **390 de ancho:** ninguna de las seis desborda; Datos del sitio lleva la
    barra fija de abajo (65 px) con 112 px reservados.
  - **Teclado:** todo lo enfocable (5, 13, 6, 6, 5 y 1 elementos) tiene su
    anillo de foco declarado o es un control nativo, y nombre accesible. El
    recorrido con Tab no se pudo manejar: el navegador embebido no mueve el
    foco con la pestaña oculta (DECISIONS: sin capturas, por lo mismo).
- Close review: la abre el padre al recibir `worker_done` (hija supervisada).


## Done
