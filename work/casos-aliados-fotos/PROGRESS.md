# PROGRESS — Casos, Aliados y Fotos

## In progress

- 2026-09-27 — Lane 9 del XL `work/mapa-del-admin/`, rama
  `mateo/casos-aliados-fotos` desde `main` en `77611c1`. Worktree listo:
  `pnpm install`, `pnpm generate`, `.env.local` apuntado a la base propia
  `ed_casos` (creada en `ed-postgres`) y `pnpm migrate:deploy` con las 16
  migraciones de `main`. SPEC escrito desde el brief del padre, con doce
  propuestas (§12); la aprobación la da el padre por `orca orchestration ask`.
- 2026-09-27 — SPEC aprobado por el padre con las doce propuestas y tres
  resguardos (DECISIONS). PLAN de 20 pasos escrito; arranca el paso 1.

## Hecho

- **Paso 1 — el recorrido de fotos** (`d1c164b`): `lib/contenido/fotos-en.ts`
  (`fotosEn`, `cambiarFoto`) y su test. `pnpm --filter sitio exec tsx --test
  src/lib/contenido/fotos-en.test.ts` → 4 pass, 0 fail; typecheck 0.
- **Paso 2 — las fotos de `public/` en la tabla**: `Foto.url` única y
  `subidaPor` nulo; la migración `20260927030903_fotos_de_public` (creada con
  `--create-only` en una terminal de Orca, porque el aviso del índice único
  pide confirmar y el shell del agente no es interactivo) con las 47 filas
  medidas por un script que no se commitea y el dedupe de
  `origen-03-pregunta.webp` (novedad `relime-2025` → `/fotos/`); se borró
  `public/quienes-somos/`; `esSrcDeFoto` suma `investigacion` y `aliados` y
  saca `quienes-somos`. `pnpm migrate:deploy` → aplicada; `select count(*)
  from fotos where "subidaPor" is null` → 47; la novedad apunta a
  `/fotos/origen-03-pregunta.webp`; `fotos.test.ts` + `fotos-en.test.ts` → 9
  pass, 0 fail; typecheck 0; `migrate:status` al día. Commit `6ba6403`.
- **Paso 3 — los diez tipos de actividad**: `datos/actividad.ts` (tipos,
  `QUIEN_VE` todos `editarContenido`, `VA_AL_INICIO` todos sí menos
  `subio-una-foto`), sus frases en `admin/actividad/frase.ts`, su módulo
  (Contenido) y «Ver» solo para los casos en
  `admin/cuentas/actividad/modulos.ts` (DECISIONS), con `modulos.test.ts`
  nuevo. `tsx --test frase.test.ts actividad.test.ts filtros.test.ts
  modulos.test.ts` → 11 pass, 0 fail; typecheck 0. Commit `f4bd728`.
- **Paso 4 — subir una foto, probado**: `datos/acciones/subir-foto.ts`
  (`subirFotoEnBase`, con la base y el almacén inyectados; el esquema de la
  subida se mudó ahí) y `fotos.ts` queda con la sesión, la capacidad y la
  actividad `subio-una-foto`; el resultado trae el id (la grilla va a la
  ficha). `subir-foto.test.ts` (un SVG con `<script>` llamado `logo.png`
  recibe «El archivo no es una imagen jpg, png o webp.» sin fila ni archivo;
  un webp crea la fila con `subidaPor`; sin alt no sube) +
  `acciones-con-sesion.test.ts` → 16 pass, 0 fail, 0 skipped (contra
  `ed_casos`); typecheck 0. Commit `9eafc8c`.
- **Paso 5 — los casos en la base**: `features/investigacion/contenido/caso.ts`
  (`esquemaCaso` y `esquemaBorradorDeCaso`) y `modelo-de-casos.ts` (los
  cuatro fijos, sujeciones, estados, topes, slugs reservados); `Caso` en
  `prisma/schema/casos.prisma` y la migración `20260927031538_casos` con los
  cuatro, generados por un script que no se commitea y validados con
  `esquemaCaso`; `publicadoDeCaso` en `datos/consultas/casos.ts`.
  `migrate:deploy` → aplicada (los cuatro, 5/5/4/9 evidencias);
  `caso.test.ts` → 3 pass, 0 fail, 0 skipped; typecheck 0. Commit `19851f5`.
- **Paso 6 — el sitio lee los casos de la base**: `casosDelSitio()` y
  `casoParaElSitio()` en `datos/consultas/casos.ts` (vista previa por
  borrador válido, tinte por número en `tintes.ts`, id y rótulo de cada
  evidencia por posición); los tipos del sitio pasan a
  `features/investigacion/casos/tipos.ts`; la página lee los casos y los
  pasa por prop a `InvestigacionEnAccion` → `CasosInvestigacion` → los dos
  hooks (por ref en los efectos de montaje); `CASO_DE_CADA_LINEA` pasa a ids
  en `modelo-de-casos.ts` y las líneas reciben `{ id, slug }`; `Papel` va
  sin «Ver en acción» si no hay slug (sitio sin base). Se borró
  `data/casos.ts`. Aceptación: `pnpm build` acá y en un worktree de `main`
  (`%TEMP%\ed-main-render`, base `ed_casos_main` con las migraciones de
  `main`) y `node scripts/comparar-render.mjs <main> apps/sitio` → 12
  páginas; **`investigacion.html` igual** (−20 084 bytes de JS: los casos ya
  no van en el bundle); `novedades.html` y `novedades/relime-2025.html`
  DISTINTAS en imágenes, y un diff de sus `<img>` cambiando
  `quienes-somos/origen-03` por `fotos/origen-03` en `main` da igual: es el
  dedupe aprobado (propuesta K). El script sale 1 por esas dos. Suite entera
  `pnpm --filter sitio test` → 319 tests, 318 pass, 0 fail, 1 skipped (el
  de antes); typecheck 0. Commit `219c19d5`.
- **Paso 7 — los aliados en la base**: `features/aliados/contenido/aliado.ts`
  (`esquemaAliado`, `esquemaBorradorDeAliado`; la URL solo `https://`) y
  `modelo.ts` (`TAMANOS` chico/mediano/grande con sus clases, `altoDe`,
  topes); `Aliado` en `prisma/schema/aliados.prisma` y la migración
  `20260927032338_aliados` con los cinco (publicados, autorizados, con la
  nota de dónde consta; Techint con el pendiente de confirmar con Raquel),
  generados por un script que no se commitea y validados con
  `esquemaAliado`; `publicadoDeAliado` en `datos/consultas/aliados.ts`.
  `migrate:deploy` → aplicada; `aliado.test.ts` → 4 pass, 0 fail, 0
  skipped; typecheck 0. Commit `844cdb60`.
- **Paso 8 — el sitio lee los aliados de la base**: `aliadosDelSitio()` y
  `aliadosVisibles()` en `datos/consultas/aliados.ts` (filtra `autorizado`
  en la consulta y otra vez en la función pura, también en la vista previa;
  las medidas y el tipo salen de la foto por su url); `LogoDeAliado`
  compartido (`features/aliados/components/`), con link en otra pestaña si
  hay URL; el layout del sitio pasa a `async` y le da los aliados al pie;
  el Inicio (`DatosDuros`) y Qué hacemos (`MiradaPasos` → `BandaAliados`)
  los reciben por prop. Se borró `config/aliados.ts`. Aceptación:
  `aliados.test.ts` (sin marca no sale ni en la vista previa; orden y
  medidas; borrador en la vista previa solo si se puede publicar; un logo
  que no está en Fotos no se dibuja y el SVG va sin optimizar) → 4 pass, 0
  fail; typecheck 0; `pnpm build` y `comparar-render` contra `main` → las
  12 páginas iguales salvo las dos de Novedades del dedupe (el diff de sus
  `<img>` con la ruta nueva da igual), y los cinco logos con el mismo
  `<img>` (p. ej. Techint 147×195, `h-12`, sin optimizar). `pnpm --filter
  sitio lint` 0. Commit `eef941d4` (enmendado: el primer `git add` falló por
  una ruta ya borrada y el commit se había llevado solo el borrado).
- **Paso 9 — el registro de usos**: `datos/fotos/uso.ts` (el uso, `Donde`,
  `Regenerar`, `UsosDeUnModulo`, `sinRepetir`), `registro.ts`
  (`USOS_DE_FOTOS`, `usosPorFoto`) y una entrada por módulo:
  `de-las-paginas.ts` (lo publicado, el borrador y, por sección que no está
  en la base, el contenido del código; la etiqueta con `caminoLegible`;
  reemplazar cambia también las versiones), `de-las-novedades.ts`,
  `de-los-casos.ts` y `de-los-aliados.ts` (en el sitio solo publicado y
  autorizado; regenera el layout). `registro.test.ts` (la misma foto en el
  borrador de Contacto, una novedad, el borrador del caso 04 y un aliado,
  cada una con su `en` y su lugar; una foto del código de Inicio como uso
  `codigo`; reemplazar la cambia en los cuatro y dice qué regenerar) → 2
  pass, 0 fail, 0 skipped, y las filas de prueba se deshacen; typecheck 0.
  Commit `74197f5c`.
- **Paso 10 — lo que se hace con una foto**: `datos/consultas/fotos.ts`
  (`grillaDe`/`grillaDeFotos` con los filtros y sus cuentas, `fichaDeFoto`
  con «Se usa en», `paraElegir` solo jpg/png/webp, `resumenDeFotos`,
  `esDelRepositorio`); `editar-fotos.ts` (`editarAltEnBase`,
  `borrarFotoEnBase`: solo sin usos, la fila y después el archivo, nunca uno
  de `public/`); `reemplazar-foto.ts` (por los bytes; frena si un uso es del
  código; archivo nuevo con nombre nuevo, la transacción reescribe los usos
  y la fila, y el viejo se borra después); `revalidar-fotos.ts`; las
  acciones en `fotos.ts` (`editarAltDeFoto`, `reemplazarFoto`, `borrarFoto`,
  `fotosParaElegir`; subir no revalida porque se sube desde formularios a
  medio escribir) con su actividad. `editar-fotos.test.ts` +
  `consultas/fotos.test.ts` + `subir-foto.test.ts` +
  `acciones-con-sesion.test.ts` → 22 pass, 0 fail, 0 skipped; typecheck 0.

## Abierto
