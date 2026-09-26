# PLAN — El Inicio del admin

SPEC aprobado por el padre el 2026-09-26, con un cambio (DECISIONS). Un paso,
un commit. Cada paso deja `pnpm typecheck` y `pnpm lint` en verde.

## Restricciones de todo el cambio

- **Archivos cercados** (lanes en vuelo), no se tocan: de la 4a,
  `admin/paginas/`, `admin/campos/`, `contenido/`, `features/`,
  `lib/contenido/`, `datos/**/paginas*`, `prisma/schema/paginas.prisma` (el
  registro de páginas y `Momento` se importan, no se cambian); de la 3b,
  `admin/cuentas/`; de la 7, `admin/mensajes/`, `features/contacto/`,
  `app/api/`. Ningún archivo nuevo con nombre `paginas*` en `datos/`.
- **El contrato de los registros** (SPEC §3): clave de una unión cerrada,
  `Record<Clave, …>`, la capacidad por entrada filtrada en el servidor antes
  de consultar, una consulta por entrada, y cada entrada aislada: la que
  tira queda como fallo y las demás siguen.
- **Las cuatro fronteras:** `datos/` es la única puerta a la base (ningún
  componente importa Prisma); `app/` solo rutas (`page.tsx` pide la sesión,
  llama a `inicioPara` y pasa props); `packages/` no se toca. Sin Server
  Actions nuevas.
- **Sin tabla nueva, sin migración, sin dependencias.** Las fechas viajan
  como ISO.
- Español en código, comentarios, docs y commits; UI en voseo y lenguaje
  inclusivo. Componentes ≤ 200 líneas, utilidades ≤ 100. Repo CRLF.
- UI: DESIGN.md §11 manda (`designing-consistently`, `frontend-design` en la
  pantalla): solo tokens, cuatro tamaños de tipo, sin verde ni naranja, sin
  primario en el Inicio, tres temas, 390 de ancho, foco con teclado.

## Pasos

1. **El Número en el armazón.** `admin/metricas/Tarjeta.tsx` pasa a
   `admin/armazon/Numero.tsx`: `Numero({ etiqueta, valor: number | null,
   variacion?: string, periodo?: string })`; `valor` en `null` dibuja «—»
   (con «Sin datos» para el lector) y «Todavía no hay datos»; `periodo`
   («el período anterior» por defecto) arma la comparación. `PanelMetricas`
   y `admin/busquedas/ConDatos.tsx` lo importan de ahí, sin cambio visible.
   Acepta: `pnpm typecheck` y `pnpm lint`, exit 0, y
   `grep -rn "metricas/Tarjeta" apps/sitio/src` sin resultados.
   *(integration · medium)*
2. **Quién ve cada tipo de actividad y cómo se lee.** `datos/actividad.ts`
   suma `QUIEN_VE: Record<TipoDeActividad, Capacidad>` (los cuatro tipos,
   `usarCuentas`) y `tiposQueVe(rol: unknown): TipoDeActividad[]`;
   `admin/actividad/frase.ts` exporta `fraseDe({ tipo, quien, sobre }):
   string` desde un `Record<TipoDeActividad, …>` («Raquel Ayala entró»).
   Test en `datos/actividad.test.ts`, sin base: quien edita no ve ninguno de
   los tipos de hoy, dirige y administra ven los cuatro, un rol inválido no
   ve nada.
   Acepta: `pnpm --filter sitio exec tsx --test src/datos/actividad.test.ts`,
   exit 0. *(judgment · high)*
3. **El registro de pendientes.** `datos/inicio/registro.ts`:
   `visiblesPara(entradas, rol)` y `leerAisladas(entradas, leer)` →
   `Array<{ entrada; valor } | { entrada; fallo: true }>` (el error al log).
   `datos/inicio/pendientes.ts`: `URGENCIAS` (las seis del SPEC §3, cada una
   sin fila dice qué lane la trae), `CLAVES_DE_PENDIENTES`
   (`paginas-sin-publicar`, `conectar-search-console`), `PENDIENTES:
   Record<ClaveDePendiente, Pendiente>` y `pendientesPara(rol, registro =
   PENDIENTES): Promise<FilaDePendiente[]>` (`{ clave, titulo, detalle?,
   href, accion, fallo? }`, ordenadas por urgencia y después por registro).
   Las dos filas con su consulta: `paginas.borradorEn` con los nombres del
   registro de páginas, y `hayVariablesDeBusquedas()`. Test con un registro
   falso: orden por urgencia, una fila que el rol no ve no se consulta, la
   que devuelve `null` no aparece, la que tira queda como fallo.
   Acepta: `pnpm --filter sitio exec tsx --test
   src/datos/inicio/pendientes.test.ts`, exit 0. *(judgment · high)*
4. **Esta semana.** `datos/consultas/metricas.ts` exporta `tarjetaDe(dias: 7
   | 30): Promise<Tarjeta | null>`, que `tarjetas()` pasa a usar;
   `datos/consultas/busquedas.ts` exporta `totalDeBusquedas(desde, hasta)`.
   `datos/inicio/esta-semana.ts`: `CLAVES_DE_NUMEROS`, `NUMEROS` y
   `numerosPara(rol): Promise<NumeroDeLaSemana[]>` (`{ clave, etiqueta,
   valor: number | null, variacion?, fallo? }`): visitantes de la ventana de
   7 días, clics de los 7 días que terminan en el último copiado contra los 7
   anteriores, y CV y materiales en `null` hasta su módulo, con quién los
   conecta.
   Acepta: `pnpm typecheck`, `pnpm lint` y `pnpm --filter sitio test`, exit 0.
   *(integration · medium)*
5. **Lo nuevo desde tu visita.** `datos/inicio/desde-tu-visita.ts`:
   `ultimaVisita(cuentaId, antesDe: Date): Promise<Date | null>` (la
   «entro» más reciente de esa cuenta con `en < antesDe`), `DESDE_TU_VISITA`
   (`paginas-publicadas`: «se publicó Inicio» / «se publicaron Inicio y Qué
   hacemos») y `loNuevoPara(rol, desde: Date): Promise<string[]>`, que usa
   `visiblesPara` y `leerAisladas` del paso 3. Test contra la base: devuelve
   la «entro» anterior, `null` sin ninguna, e ignora la de esta sesión, las de
   otras cuentas y los otros tipos.
   Acepta: `pnpm --filter sitio exec tsx --test
   src/datos/inicio/desde-tu-visita.test.ts`, exit 0. *(integration · medium)*
6. **La actividad reciente y todo junto.** `datos/inicio/actividad-reciente.ts`:
   `actividadReciente(rol, cuantos = 8)`, filtrada con `tiposQueVe` del paso
   2 (`[]` sin tipos visibles, sin consultar), con el nombre de la cuenta y
   `en` en ISO. `datos/inicio/inicio.ts`: `inicioPara({ user, session })` →
   `{ nombre, ultimaVisita, loNuevo, pendientes, numeros, actividad,
   verTodaLaActividad }`, todo en paralelo.
   Acepta: `pnpm typecheck` y `pnpm lint`, exit 0. *(integration · medium)*
7. **La pantalla del Inicio.** Con `frontend-design`, dentro de §11:
   `admin/inicio/Inicio.tsx` (la composición del SPEC §2: el encabezado con el
   saludo, lo nuevo y los accesos rápidos; pendientes y actividad a la
   izquierda, esta semana a la derecha desde `lg`) y una pieza por bloque en
   `admin/inicio/`; `Modulo` suma `accesoRapido?: { etiqueta; href }` en
   `modulos.ts`; `(protegido)/page.tsx` queda en sesión → `inicioPara` →
   `<Inicio>`; `PanelMetricas` y el link a Páginas salen, y el comentario de
   `metricas/page.tsx` que los nombraba. «Ver toda la actividad» solo si
   `/admin/cuentas/actividad` existe en `main` al rebasear (DECISIONS).
   Acepta: `pnpm typecheck`, `pnpm lint` y
   `node scripts/verificar-react-doctor.mjs`, exit 0 y 100/100.
   *(judgment · high)*
8. **DESIGN.md §11.** El patrón «Número» (con sus contrastes y la regla de
   la comparación sin color), la composición del Inicio, y el Inicio en los
   consumidores de `Lista` y `Estado vacío`; lo que el paso 7 le haya sumado a
   un patrón, con sus contrastes. Acepta: `git diff --stat main -- DESIGN.md`
   muestra el cambio y `grep -n "### Número\|### Inicio" DESIGN.md` encuentra
   las dos secciones. *(judgment · medium)*
9. **AGENTS.md §3 y §12.** El árbol suma `datos/inicio/`, `admin/inicio/` y
   `admin/actividad/`; §12 suma la regla de sumar al Inicio por registro
   (SPEC §6). Acepta: `grep -n "datos/inicio\|inicio/" AGENTS.md` encuentra
   las líneas nuevas. *(judgment · medium)*
10. **README.** Las dos menciones de «la portada del admin» con las métricas
    pasan a Métricas. Acepta: `grep -n "portada" README.md` no nombra
    métricas. *(mechanical · low)*
