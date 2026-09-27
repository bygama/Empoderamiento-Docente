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

## Verification

## Done
