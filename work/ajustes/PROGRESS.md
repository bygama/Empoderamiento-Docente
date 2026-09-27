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

## Verification

## Done
