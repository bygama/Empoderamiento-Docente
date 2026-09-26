# PROGRESS — El Inicio del admin

## In progress

- 2026-09-26 — Worktree `inicio` desde `5a07368`, rama `mateo/inicio`,
  `pnpm install` y `pnpm generate` en verde, `.env.local` copiado. SPEC.md
  escrito desde el brief del padre (lane 3c); pedida la aprobación por
  `orca orchestration ask`.
- 2026-09-26 — SPEC aprobado por el padre con un cambio (DECISIONS). PLAN.md
  escrito: 10 pasos.

### Pasos

- **1. El Número en el armazón** — `87fced7`. `admin/metricas/Tarjeta.tsx` →
  `admin/armazon/Numero.tsx` (`valor: number | null` dibuja «—» con «Sin
  datos» para el lector y «Todavía no hay datos»; `periodo` y `nota`
  opcionales). `PanelMetricas` y `ConDatos` lo importan de ahí, mismas props.
  `pnpm typecheck` exit 0, `pnpm lint` exit 0, `grep -rn "metricas/Tarjeta"
  apps/sitio/src` sin resultados (exit 1).
- **2. Quién ve cada tipo y cómo se lee** — `cee3e38`. `datos/actividad.ts`:
  `QUIEN_VE: Record<TipoDeActividad, Capacidad>` (los cuatro, `usarCuentas`)
  y `tiposQueVe(rol)`. `admin/actividad/frase.ts`: `fraseDe({ tipo, quien,
  sobre })` desde un `Record`. Test nuevo en `actividad.test.ts` (sin base):
  dirige y administra ven los cuatro de las cuentas, edita ninguno, un rol
  inválido nada. `pnpm --filter sitio exec tsx --test
  src/datos/actividad.test.ts`: 5 pasan, exit 0; typecheck y lint exit 0.
- **3. El registro de pendientes** — `ffc88bd`. `datos/inicio/registro.ts`
  (`enOrden`, `visiblesPara`, `leerAisladas`); `datos/inicio/pendientes.ts`
  (`URGENCIAS` con las seis del SPEC §3, `CLAVES_DE_PENDIENTES`, `PENDIENTES`
  con las dos filas, `filasDePendientes(registro, rol)` y
  `pendientesPara(rol)`); `datos/inicio/de-las-paginas.ts`
  (`paginasSinPublicar`, consulta propia sobre `paginas.borradorEn`). Test con
  registro falso: orden por urgencia y registro, la fila que el rol no ve no
  se consulta, `null` no aparece, la que tira queda como fallo.
  `pnpm --filter sitio exec tsx --test src/datos/inicio/pendientes.test.ts`:
  4 pasan, exit 0; typecheck y lint exit 0.
- **4. Esta semana** — `6eef099`. `datos/consultas/metricas.ts` exporta
  `tarjetaDe(dias)` (sale de `tarjetas()`, que la usa);
  `datos/consultas/busquedas.ts` exporta `totalDeBusquedas(desde, hasta)` (lo
  usa también `resumenDeBusquedas`). `datos/inicio/esta-semana.ts`:
  `CLAVES_DE_NUMEROS`, `NUMEROS` (visitantes de la ventana de 7 días; clics de
  los 7 días que terminan en el último copiado contra los 7 anteriores; CV
  con `verCV` y materiales en `null`, con la lane que los conecta) y
  `numerosPara(rol)`. `pnpm typecheck` y `pnpm lint` exit 0;
  `pnpm --filter sitio test`: 156 tests, 155 pasan, 0 fallan, 1 saltado (el
  de antes), exit 0.
- **5. Lo nuevo desde tu visita** — `64e3d61`.
  `datos/inicio/desde-tu-visita.ts`: `ultimaVisita(cuentaId,
  comienzoDeEstaSesion)` (la «entro» más reciente con `en <` el comienzo),
  `CLAVES_DE_LO_NUEVO`, `LO_NUEVO` (`paginas-publicadas`) y
  `loNuevoPara(rol, desde)`; `de-las-paginas.ts` suma
  `paginasPublicadasDesde(desde)`. Test contra la base: la anterior (ni la de
  esta sesión, ni un `salio`, ni otra cuenta) y `null` sin ninguna.
  `pnpm --filter sitio exec tsx --test src/datos/inicio/desde-tu-visita.test.ts`:
  2 pasan, exit 0; typecheck y lint exit 0.
- **6. La actividad reciente y todo junto** — `a88b736`.
  `datos/inicio/actividad-reciente.ts`: `actividadReciente(rol, cuantos = 8)`
  con `tiposQueVe` (sin tipos visibles no consulta), el nombre de la cuenta y
  `en` en ISO, el tipo cerrado recuperado sin `as`. `datos/inicio/inicio.ts`:
  `inicioPara(sesion)` → `{ nombre, desdeTuVisita, pendientes, numeros,
  actividad, verMetricas }`, en paralelo; la última visita y la actividad
  aisladas con `oNull` (en `null`, el bloque dice que no se pudo leer). Sin
  `verTodaLaActividad`: la 3b no está en `main` (`git log HEAD..origin/main`
  vacío), así que el link lo suma ella (DECISIONS). typecheck y lint exit 0.

## Hecho

## Abierto

- Al cerrar la lane: borrar la base de demo `ed_inicio`
  (`docker exec ed-postgres psql -U postgres -c "DROP DATABASE ed_inicio;"`)
  y volver el `.env.local` a `ed` (DECISIONS).
