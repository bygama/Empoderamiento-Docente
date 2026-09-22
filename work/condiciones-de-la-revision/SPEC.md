# SPEC — Las condiciones de la revisión de la fase A

- **Fecha:** 2026-09-22
- **Estado:** diseño aprobado por el owner en conversación (2026-09-22)
- **Decide:** Mateo
- **Tier:** M · rama `mateo/condiciones-de-la-revision`, en el checkout
  principal (ningún criterio de aislamiento se cumple: nadie más usa este
  checkout y cada paso se deshace con un cambio de rama)
- **Viene de:** la revisión de los 38 commits de `f3f3f9c..d6d4e2f` (PRs #165
  a #171) contra el diseño del admin
  ([`2026-09-18-admin-a-medida-diseno.md`](../../docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md))

---

## 1. Qué se quiere

La fase A de la edición de páginas se apartó en seis puntos del diseño del
admin. Los seis se aceptan; cuatro con una condición. Esta lane cumple esas
condiciones y deja escritos los seis puntos, así el próximo que toque el
admin no los redescubre.

| # | Desvío aceptado | Condición que cumple esta lane |
|---|---|---|
| 1 | Páginas antes que el kit y novedades | Los controles de `admin/campos/` reciben props planas (etiqueta, ayuda, máximo, opciones, cantidad) y no conocen `Descripcion` ni `datos/`: se mudan a `packages/kit-admin` en la fase 2 sin llevarse el generador. Solo `Campo.tsx` traduce la descripción a props |
| 2 | Documento JSON por página en vez de una columna por texto | El spec del admin (§6) dice que la regla de una columna por texto sigue valiendo para las entidades |
| 3 | El formulario de las páginas sale del esquema (excepción a la regla anti-Payload) | `AGENTS.md` §12 escribe sus límites: solo `paginas`; un tipo de campo nuevo se discute como regla nueva; nada de visibilidad condicional, componentes por campo ni hooks |
| 4 | Vista previa con el Draft Mode de Next | Salir del admin apaga la vista previa, y el spec del admin (§7) dice lo que la cookie es de verdad: sin vencimiento, el mismo valor para todos hasta el próximo deploy |
| 5 | Las Server Actions pasan el middleware sin cookie | Un test falla si una acción de `datos/acciones/` no empieza por `auth.api.getSession` (`salir-de-vista-previa.ts`, sin sesión a propósito, queda exceptuada con su motivo). El spec del admin (§7) deja de decir que la sesión se corta solo en el middleware |
| 6 | `lib/contenido/` y `lib/metricas/` en la app, no en `packages/` | `AGENTS.md` §12 escribe el criterio: lo que no sabe de ED incuba en `apps/sitio/src/lib/`, no importa nada de la app, y pasa a `packages/` cuando lo use un segundo proyecto |

## 2. Definición de terminado

- Los seis puntos cumplidos como dice la tabla.
- El formulario del hero se ve igual que antes del paso 1: el HTML que
  renderiza `Campo` con la descripción del hero es idéntico antes y después.
- Con la vista previa abierta, «Salir» deja el sitio sin la franja de
  borrador. Comprobado en el navegador.
- `pnpm typecheck`, `pnpm lint`, `pnpm react-doctor` (100/100 sin
  diagnósticos), `pnpm test` y `pnpm build` en verde.
- Revisión de cierre hecha y sus hallazgos resueltos o anotados.

## 3. Fuera de alcance

- Mudar los controles a `packages/kit-admin`: eso es la fase 2.
- El choque entre guardar y una publicación ajena (`editar-paginas.ts:38`):
  hallazgo de la misma revisión, va aparte.
- Las lanes de Facundo (`work/edicion-de-paginas/`, `work/metricas/`,
  `work/primer-deploy/`): no se tocan.
- Dependencias nuevas.
