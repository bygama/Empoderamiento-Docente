# PROGRESS — Equipo

## In progress

- 2026-09-27 — Worktree listo: `pnpm install`, `pnpm generate`, `.env.local`
  copiado y apuntado a la base propia `ed_equipo` (creada en `ed-postgres`),
  `pnpm migrate:deploy` con las 22 migraciones de `main` (`d051c6a0`).
- 2026-09-27 — SPEC.md escrito desde el brief del padre (lane 8b), con 16
  propuestas (§13); la cuenta de las publicaciones, en DECISIONS.
- 2026-09-27 — **SPEC aprobado por el padre** con el cambio J (sin arrastre:
  «Subir» y «Bajar» como Aliados) y las precisiones H y N (DECISIONS).
  PLAN.md escrito: 13 pasos; el 11 y el 12 esperan a la lane 9.

## Hecho

- **Paso 1 — los esquemas de una persona** (`13140059`):
  `features/quienes-somos/contenido/` suma `modelo-del-equipo.ts` (niveles
  con su rótulo y sus lugares, colores, composiciones, figuras, topes y
  `rotuloDePublicacion`, los cuatro rótulos de §5.2), `campos-de-persona.ts`
  (slug, foto, renglones, clave, `sinRepetir`), `etapa.ts` (hitos, ramas,
  territorios y la publicación `biblioteca | sin-link`, una destacada por
  etapa, un material una vez por etapa), `persona.ts` (`esquemaPersona` y
  `esquemaBorrador`, el recorrido con sus categorías, figura y cierre, la
  categoría de cada etapa entre las del recorrido al publicar, foto o «Sin
  foto») y `persona-vacia.ts`; `/equipo/` entra a `esSrcDeFoto`. Los textos
  de una línea reusan `linea`/`opcional`/`deLaLista` de la Biblioteca.
  `pnpm --filter sitio exec tsx --test src/features/quienes-somos/contenido/persona.test.ts`
  → 7 pass, 0 fail; `pnpm typecheck` 0; eslint de los archivos nuevos 0.
- **Paso 2 — la migración `equipo` y la FK** (`4b5daf56`):
  `prisma/schema/equipo.prisma` (modelo `Persona`, tabla `equipo`) y
  `Autoria.personaId` con su relación `SET NULL`; la migración
  `20260927060356_equipo` (esquema de `migrate diff`, partido para mover los
  datos antes del `DROP`): la tabla, el índice parcial de la Dirección
  general, los 15 perfiles con ids fijos (generados por un script que valida
  con `esquemaPersona`: 64 referencias a la Biblioteca, 14 `sin-link`, 7
  detalles vacíos), `persona` → `persona_id` con un `RAISE` si alguna clave
  no mapea, los borradores de materiales reescritos, los 5 materiales nuevos
  con sus autorías y los 2 títulos corregidos (DECISIONS). La Biblioteca:
  `persona` pasa a `z.uuid()` y `personaQueNoEsta` la chequea al crear,
  guardar y publicar; las opciones salen de `equipo`
  (`ficha-de-material.ts`); `publicadoDe`, `autoriasDe` y `conPersonas` leen
  `personaId`. Probado antes de aplicar con un borrador sembrado con
  `karla-gomez`, `null` y `no-existe` → quedó `[id de Karla, null, null]`.
  En `ed_equipo`: 15 en `equipo`, 62 en `materiales`, 74 autorías con
  persona y 0 huérfanas; `pnpm migrate:status` al día; `migrate diff` →
  «This is an empty migration.»; el checksum resiste el checkout en CRLF.
  `pnpm --filter sitio exec tsx --test` de los 6 archivos de la Biblioteca
  → 21 pass, 0 fail (con «una persona que no está en el Equipo no se
  guarda»); `pnpm test` → sitio 427 pass, 0 fail, 1 saltado (el de
  antes); auth 46; kit 3; `pnpm --filter sitio typecheck` 0; eslint de
  `src/datos` y `src/features/biblioteca` 0.
- **Paso 3 — el sitio lee el equipo de la base** (`refactor` de los esquemas
  genéricos en `publicar` + `feat(quienes-somos)`): `datos/consultas/equipo.ts`
  (`publicadoDe`, `personasVisibles`, `firmadosPorPersona`, `equipoDelSitio`
  con `leerSinRomper` y `cache`), `contenido/del-sitio.ts` (`personaDelSitio`:
  la foto encuadrada, el recorrido y cada publicación resuelta contra lo
  que el sitio muestra y la persona firma, el detalle vacío leyendo la
  fuente) y `contenido/perfil-del-sitio.ts` (los tipos de los componentes,
  mudados, sin `bio`, `linkedin` ni `pubs`); la página le pasa las personas a
  `ImpulsanEd`; `PersonCard` y `PerfilShell` leen `persona.foto` y
  `rotuloDelNivel`; `revalidar-materiales.ts` suma `/quienes-somos`;
  `docs/content/equipo-sin-publicar.md` con la bio y el LinkedIn; `data/equipo.ts`
  borrado. `pnpm --filter sitio exec tsx --test src/datos/consultas/equipo.test.ts src/features/quienes-somos/contenido/persona.test.ts`
  → 11 pass, 0 fail. `pnpm build` 0 aquí y en un worktree de `main`
  (`C:/tmp/ed-antes`, detached en `d051c6a0`, contra `ed_equipo_antes` recién
  migrada); `node scripts/comparar-render.mjs C:/tmp/ed-antes/apps/sitio apps/sitio`
  → todas «igual» salvo `biblioteca.html` («DISTINTA en texto»: solo «57
  materiales» → «62»; las filas nuevas quedan fuera de la primera página
  del HTML); `quienes-somos.html` igual, con −221 802 bytes de JS (el
  `data.ts` ya no viaja en el bundle). El script de las tarjetas (scratch,
  en `C:/tmp/tmp-comparar-perfiles.ts`): 15 personas, 78 tarjetas, 18
  diferencias, todas las de DECISIONS (14 títulos, 2 rótulos, 2 detalles).
  `pnpm lint` 0; `node scripts/verificar-react-doctor.mjs` → 100/100 sin
  diagnósticos; `pnpm test` → sitio 431 pass, 0 fail, 1 saltado; auth 46;
  kit 3.
- **Paso 4 — el ciclo de un perfil en la base** (`938704b7`):
  `datos/acciones/editar-equipo.ts` (crear —último en el orden—, guardar con
  choque, descartar, borrar: la fila, sus redirecciones y la persona en los
  borradores de materiales, con la fk `SET NULL` para las autorías
  publicadas), `publicar-equipo.ts` (publicar con el 308 de
  `/quienes-somos/equipo/<viejo>`, al final de su nivel si es la primera vez
  o cambió de nivel; despublicar), `chequeos-del-perfil.ts`
  (`publicacionQueNoFirma`, `nivelSinLugar` con los nombres de quienes
  ocupan el lugar), `indices-del-equipo.ts` (el slug y la Dirección general
  que saltan en la transacción), `equipo-en-base.ts` y
  `features/quienes-somos/contenido/etiquetas-de-persona.ts` («Etapa 3 ›
  Publicación 1 › Material de la Biblioteca»). Fixtures en
  `equipo-de-prueba.ts`, con un prefijo por archivo (los archivos de test
  corren a la vez y la limpieza de uno borraba el material del otro: visto y
  corregido). `pnpm --filter sitio exec tsx --test src/datos/acciones/editar-equipo.test.ts src/datos/acciones/publicar-equipo.test.ts`
  → 6 pass, 0 fail; `ed_equipo` queda con sus 15 y 62.
- **Paso 5 — mover dentro del nivel** (`a51447a8`): `mover-equipo.ts`, con la
  forma de `moverAliadoEnBase` de la lane 9 (`hacia: "antes" | "despues"`,
  renumera el nivel en una transacción, en la punta no se mueve); el nivel
  de quien nunca se publicó es el de su borrador (`nivelEnLaLista`).
  `mover-equipo.test.ts` → 1 pass (con perfiles sin nivel, un grupo solo de
  la prueba: los 15 no se tocan, comprobado en psql).
- **Paso 6 — las Server Actions, la vista previa y la actividad**
  (`48b0cf12`, `501a6ac8`): los cinco tipos (`publico-`, `despublico-`,
  `descarto-cambios-de-`, `borro-un-perfil`, `movio-un-perfil`) en
  `datos/actividad.ts` (`editarContenido`, todos al Inicio), su frase, su
  módulo (Contenido) y su link en Cuentas › Actividad
  (`perfilesQueExisten`; `pantallaDe` ya no manda todo lo de Contenido al
  editor de páginas, solo sus tres tipos, como hace la lane 9);
  `datos/acciones/equipo.ts` y `ciclo-de-equipo.ts` (sesión +
  `editarContenido` primero; revalidan `/quienes-somos` y
  `/admin/contenido`), `revalidar-equipo.ts` y `abrirVistaPreviaDePersona`
  (`/quienes-somos?persona=<slug>`). `pnpm --filter sitio exec tsx --test src/datos/acciones/acciones-con-sesion.test.ts src/datos/actividad.test.ts src/admin/actividad/frase.test.ts`
  → 22 pass, 0 fail; typecheck 0; eslint 0; react-doctor 100/100.
- **Paso 7 — la ficha: la tarjeta** (`04b733a3`): `/admin/contenido/equipo/nuevo`
  y `/[id]` (cada una chequea `editarContenido` antes de leer),
  `datos/consultas/ficha-de-persona.ts` (la ficha, lo que firma, quiénes
  ocupan cada nivel), `admin/equipo/` con `FichaDelPerfil` (el molde de un
  material), `formulario.ts` (claves estables, listas de texto en renglones,
  la foto siempre un valor del campo), los hooks de guardar, publicar y
  salida, `BloqueDeLaTarjeta` (nombre, rol, país, nivel con sus lugares,
  «Sin foto», la foto, el acercamiento, la URL), `PanelDelPerfil` («Se ve
  en»), `SalidaDelPerfil` y «Qué cambió» (`cambios.ts`, campo por campo y
  etapa por etapa, con `cambios.test.ts` → 2 pass).
- **Paso 8 — la ficha: el recorrido** (`bb06c883`): `BloqueDelRecorrido`
  («Tiene recorrido», que no borra nada hasta guardar; quién es, titular,
  bajada, formación en renglones), `CategoriasDelRecorrido`,
  `BloqueDeLaFigura` (marco, recorte o sin foto; la foto y «apaisada») y
  `BloqueDelCierre`.
- **Paso 9 — la ficha: las etapas y sus publicaciones** (`e4bf7b68`,
  `7dfe6014`): `EtapasDelRecorrido` y `EtapaDelRecorrido` (lo común y lo que
  usa cada composición, en `etapa-del-recorrido/composiciones.ts`), con
  `HitosDeLaEtapa`, `RamasDeLaEtapa`, `PublicacionesDeLaEtapa` y
  `PublicacionDeLaEtapa` (de la Biblioteca —lo que firma— o sin link), y
  `EnLaBiblioteca` (una `Lista` de lo que firma, dónde está en el recorrido,
  «Abrir» y «Agregar en Biblioteca»). react-doctor marcó el encabezado
  duplicado con el de un material y dos exports que no eran componentes: el
  encabezado subió al armazón (`EncabezadoDeFicha`, el refactor aparte) y
  los colores a `colores.ts`; queda en 100/100.
- **Paso 10 — «Agregar en Biblioteca» con la persona elegida** (`95c5a0cc`):
  `/admin/biblioteca/nuevo?persona=<id>` (la persona que no existe se
  ignora), `personaParaAutoria`, `AgregarMaterial` (a mano: primera autora;
  con datos de afuera: `vincularPersona`, palabra por palabra sin tildes ni
  mayúsculas, o el aviso «Ningún autor de este material es…») y el aviso
  inicial de la ficha de un material. `vincular-persona.test.ts` → 2 pass.
- **Paso 13, en parte** (`7600dc32`, `20c58d2c`): AGENTS.md §3 y §13, el
  README (Equipo), el spec del admin §6 y DESIGN.md §11 (el encabezado de la
  ficha en el armazón y la lista variable anidada). Falta «Lista que se
  ordena», que es del paso 11.
- **El navegador de Orca, trabado** (pasos 7 a 10 sin su prueba de punta a
  punta todavía): las pestañas del perfil aislado `equipo` se cierran solas
  o el runtime corta la conexión en el primer `snapshot`/`eval`; con el
  perfil `default` un `eval` anduvo una vez y la pestaña se cerró en el
  siguiente comando. Consultado al padre (abajo).

## Abierto

- La lane 9 (`casos-aliados-fotos`) no está en `main`: el registro de usos de
  fotos, los cambios de la tabla `fotos` y el orden de Aliados son suyos
  (SPEC §6.2 y §9; PLAN pasos 11 y 12).
- Fase 4: los ~110 KB del recorrido viajan en el payload del HTML de
  `/quienes-somos` (lo mismo que hoy pesa el `data.ts` en el bundle); cargar
  el perfil al abrirlo es de la fase 4 (nota del padre al aprobar).
