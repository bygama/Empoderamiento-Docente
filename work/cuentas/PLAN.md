# PLAN — Cuentas y segundo factor

SPEC aprobado por el padre el 2026-09-26, con las condiciones de DECISIONS.
Cada paso es un commit (Conventional, en español, `docs/COMMITS.md`), con su
aceptación corrida y anotada en PROGRESS.

## Restricciones de todo el cambio

- **Base propia** `ed_cuentas`. La migración nueva va con `pnpm migrate
  --create-only` y el SQL sumado antes de su primera aplicación; una migración
  aplicada no se toca. `prisma db push` está bloqueado.
- **Toda Server Action** empieza por `auth.api.getSession` y sigue con
  `puede(…)`; todo dato de entrada, por Zod. Ningún componente importa Prisma:
  `datos/` es la única puerta.
- **Tamaños:** componentes ≤ 200 líneas, utilidades ≤ 100 (AGENTS.md §6).
- **UI:** DESIGN.md §11 manda (skill `designing-consistently`): solo tokens,
  cuatro tamaños de tipo, un primario por pantalla, sin verde ni naranja
  fuera de su regla, contrastes medidos. Lo nuevo se registra en §11 en el
  mismo commit que lo estrena.
- **Copy:** voseo, lenguaje inclusivo, nunca «alumnos».
- **Archivos de lanes en vuelo:** `MiCuenta.tsx` (lane 7 suma Avisos),
  `datos/actividad.ts` y `admin/actividad/frase.ts` (lane 3c): al rebasear se
  concilian, sin pisar lo de la otra.

## Pasos

1. **La base del segundo factor y de las cuentas.** `auth.prisma` suma
   `twoFactorEnabled`, `suspendida`, `invitacionVence` (`invitacion_vence`) y
   el modelo `TwoFactor`; la migración `segundo_factor_y_cuentas` lleva el SQL
   de datos (prender el segundo factor de dirige y administra, borrar sus
   sesiones) y el `CHECK user_segundo_factor_obligatorio`. En el mismo commit,
   lo que el `CHECK` rompería: `crear-cuenta`, `nombrar-direccion`
   (`datos/direccion.ts`) y los tests que crean cuentas de esos roles prenden
   el segundo factor. Aceptación: `pnpm migrate:status` al día; `pnpm prisma
   migrate diff --from-config-datasource --to-schema apps/sitio/prisma/schema
   --exit-code` sale 0; un `INSERT` de administra sin segundo factor en
   `ed_cuentas` falla por el `CHECK`; `pnpm test` en verde. *(high)*

2. **La política: segundo factor por rol, quién toca qué cuenta y la frase de
   cada capacidad.** `permisos.ts` suma `segundoFactorObligatorio(rol)` y la
   frase de cada capacidad al lado de su fila; `packages/auth/src/cuentas.ts`
   exporta `EstadoDeCuenta = "activa" | "pendiente" | "suspendida"` y
   `queSePuede(quien: unknown, objetivo: { rol: Rol; estado: EstadoDeCuenta;
   esLaPropia: boolean })` → `{ cambiarElRol, cambiarElCorreo,
   cerrarSusSesiones, suspender, reactivar, borrar, reenviarLaInvitacion,
   cancelarLaInvitacion, pasarleLaDireccion }` (booleanos), la tabla del SPEC
   §3, sin comparar strings de rol. Tests contra la tabla. Aceptación: `pnpm
   --filter @ed/auth test` y `pnpm --filter @ed/auth typecheck` en verde.
   *(high)*

3. **El segundo factor en `@ed/auth`.** El plugin `twoFactor` solo con código
   por correo (6 dígitos, 10 minutos, hasheado, 5 intentos, paso pendiente de
   30 minutos, dispositivo recordado 30 días, TOTP apagado) y sus rate limits;
   la opción nueva `mandarCodigo({ para, nombre, codigo, minutosDeVigencia })
   → Promise<void>` (rechaza si no salió); un plugin propio, después del de
   `twoFactor`, que anota `entro` cuando la sesión existe (`/sign-in/email`,
   `/two-factor/verify-otp`), espera el envío del código en
   `/two-factor/send-otp` y contesta `CODIGO_NO_SALIO` si falló, y anota
   `activo-el-segundo-factor` / `desactivo-el-segundo-factor`; el gancho que
   frena `/two-factor/disable` para dirige y administra; `twoFactorClient` en
   el cliente. Tests contra better-auth con su adaptador en memoria y la
   tabla `twoFactor` vacía de punta a punta. Aceptación: `pnpm --filter
   @ed/auth test` y `typecheck` en verde, con esos casos. *(high)*

4. **Una cuenta suspendida no abre sesión.** Campo adicional `suspendida`
   (`input: false`) y el gancho de la base que crea una sesión contesta 403
   `CUENTA_SUSPENDIDA`, junto con el de la ubicación. Test contra better-auth.
   Aceptación: `pnpm --filter @ed/auth test` en verde. *(high)*

5. **El enlace de invitación.** `@ed/auth/servidor ›
   crearEnlaceDeInvitacion(auth, { idDeCuenta, horas, volverA })` → `Promise<{
   enlace: string; vence: Date }>`, con el formato del reset de better-auth y
   otra vigencia. Test: `resetPassword` acepta su token y, vencido, no.
   Aceptación: `pnpm --filter @ed/auth test` en verde. *(medium)*

6. **Los correos.** `mandarCorreo` devuelve si salió (`"resend" | "consola" |
   "no-salio"`); plantillas `tuCodigo({ nombre, codigo, minutosDeVigencia })`,
   `tuCorreoCambio({ nombre, anterior, nuevo, cuando })` y la variante de
   invitación de `elegiTuContrasena` (`invitacion?: { quienInvita, rol }`);
   `datos/auth.ts` pasa `mandarCodigo`, que rechaza con un «no salió». Tests
   de las plantillas y del resultado de `mandarCorreo`. Aceptación: `pnpm
   --filter sitio test` y `typecheck` en verde. *(medium)*

7. **Entrar con código.** `FormularioEntrar` sigue el segundo factor (pide el
   código, va a `/admin/entrar/codigo` con `volver`, el correo enmascarado y
   si salió) y muestra el 403 de cuenta suspendida; la pantalla
   `/admin/entrar/codigo` con `FormularioCodigo`: sus estados, «Mandar otro»,
   «Recordar este dispositivo 30 días» y el «no se pudo mandar» que no finge.
   Aceptación: `pnpm --filter sitio typecheck` y `lint` en verde; con el dev
   server del 3017, `curl` a `/api/auth/sign-in/email` de una cuenta que
   administra contesta `twoFactorRedirect: true` y `GET
   /admin/entrar/codigo` da 200. *(high)*

8. **Mi cuenta › Seguridad.** El apartado `#seguridad`: obligatorio y sin
   botón para dirige y administra; activar o desactivar con la contraseña para
   quien edita, por el cliente de better-auth. Aceptación: `pnpm --filter
   sitio typecheck` y `lint` en verde. *(medium)*

9. **Los tipos de actividad, su frase y quién los ve.** `TIPOS_DE_ACTIVIDAD`
   suma los doce de SPEC §7; `QUIEN_VE: Record<TipoDeActividad, Capacidad>`
   al lado, en `datos/actividad.ts`; `admin/actividad/frase.ts` con
   `fraseDe({ tipo, quien, sobre })` → `string`, con la forma que acordó la
   3c. Aceptación: `pnpm --filter sitio typecheck` y `test` en verde. *(medium)*

10. **Las consultas.** `datos/consultas/cuentas.ts`: `listarCuentas()` →
    `CuentaEnLista[]` (id, nombre, correo, rol, estado, último acceso ISO) y
    `unaCuenta(id)` → la ficha (más invitación, segundo factor, si tiene
    actividad y sus sesiones); `datos/consultas/actividad.ts`:
    `listarActividad({ tipos, persona?, desde?, texto?, pagina })` → `{ filas,
    total, pagina, paginas }`, 50 por página. Tests contra la base (estados,
    último acceso, filtros, buscador, paginado). Aceptación: `pnpm --filter
    sitio test` en verde, con esos casos corridos, no saltados. *(medium)*

11. **Las acciones de Cuentas.** `datos/acciones/invitaciones.ts` (invitar,
    reenviar, cancelar), `datos/acciones/cuentas.ts` (cambiar el rol y el
    correo, cerrar sus sesiones, suspender, reactivar, borrar) y
    `datos/acciones/direccion.ts` (pasarle la dirección, con la contraseña
    contada en el bloqueo por cuenta). Cada una: sesión, `usarCuentas`,
    `queSePuede` sobre la cuenta, Zod, lo suyo, `registrarActividad`, y
    contesta `{ ok, detalle }`. Tests contra la base: borrar una cuenta con
    actividad choca con la clave foránea; subir a administra prende el segundo
    factor y cierra sus sesiones. Aceptación: `pnpm --filter sitio test`
    (incluido `acciones-con-sesion.test.ts`) y `typecheck` en verde. *(high)*

12. **Los patrones nuevos del armazón.** `Volver.tsx` y el slot `volver` de
    `Encabezado`, `Buscador.tsx` y `Paginado.tsx`, cada uno con su entrada y
    sus contrastes en DESIGN.md §11. Aceptación: `pnpm --filter sitio
    typecheck` y `lint` en verde. *(medium)*

13. **Personas e Invitar.** `cuentas/layout.tsx` con `<Guarda
    capacidad="usarCuentas">`, las pestañas Personas · Actividad, «Qué puede
    cada rol» (frases y la tabla, desde `permisos.ts`; la tabla en §11), la
    lista, y `/invitar` con su formulario; la guía de Cuentas sale de
    `por-hacer/guias.ts`. Aceptación: `pnpm --filter sitio test`
    (`guarda.test.ts`) y `typecheck` en verde; `/admin/cuentas` da 200 en el
    3017 con sesión. *(medium)*

14. **Una cuenta.** `/admin/cuentas/[id]`: «← Cuentas», los apartados de
    SPEC §4.3 según `queSePuede`, y los formularios de cada acción.
    Aceptación: `pnpm --filter sitio typecheck` y `lint` en verde; una cuenta
    inexistente da 404. *(medium)*

15. **Actividad.** `/admin/cuentas/actividad`: el buscador con los tres
    filtros, la lista con la frase y el link, el paginado y el vacío; el
    módulo de cada tipo en `admin/cuentas/`. Aceptación: `pnpm --filter sitio
    typecheck` y `lint` en verde; `?pagina=2&modulo=cuentas&q=…` da 200. *(medium)*

16. **Los documentos.** ADR-0012 «Segundo factor por correo»; spec del admin
    §7; AGENTS.md §12 (la línea de la sesión) y §3 (las acciones de cuentas);
    README (invitar, el código en local, Resend como condición del primer
    deploy); `docs/README.md` si lista los ADR. Aceptación: `git diff --stat`
    muestra solo esos archivos y los links relativos nuevos existen
    (`ls` de cada uno). *(low)*
