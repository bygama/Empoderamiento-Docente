# PLAN — Roles y actividad

SPEC aprobado por el padre el 2026-09-26 (DECISIONS). Un paso, un commit.
Cada paso deja el gate en verde (`pnpm typecheck` y `pnpm lint` como mínimo).

## Restricciones de todo el cambio

- **Ninguna comparación contra el string de un rol** fuera de
  `packages/auth/src/permisos.ts`: se pregunta con `puede(rol, capacidad)`.
  La excepción inevitable es el SQL del índice parcial.
- **Archivos cercados** (lanes en vuelo), no se tocan: `admin/paginas/`,
  `admin/campos/`, `contenido/`, `features/`, `lib/contenido/`,
  `datos/**/paginas*`, `datos/acciones/fotos.ts`, `prisma/schema/paginas.prisma`;
  `admin/metricas/`, `datos/**/*metricas*`, `datos/tareas/`, `lib/metricas/`,
  `lib/tareas/`, `prisma/schema/metricas.prisma`, `app/api/cron/`,
  `vercel.json`, `admin/armazon/Pestanas.tsx`.
- **Las cuatro fronteras:** `packages/` sin dominio de ED (salvo lo que el
  brief pone en `permisos.ts`); `datos/` única puerta a la base; `app/` solo
  rutas; toda Server Action empieza por `auth.api.getSession`.
- Español en código, comentarios, docs y commits; UI en voseo, lenguaje
  inclusivo. Componentes ≤ 200 líneas, utilidades ≤ 100. Repo CRLF.
- UI del admin: DESIGN.md §11 manda (designing-consistently), solo tokens,
  un primario por pantalla, tres temas, 390 de ancho, foco con teclado.
- Migraciones solo con `pnpm migrate` contra `ed_roles`; nunca a mano,
  salvo el SQL del índice parcial sumado con `--create-only` antes de aplicar.

## Pasos

1. **Tres roles y sus capacidades.** `permisos.ts`: `ROLES` con dirige, la
   tabla `PUEDE` con las 11 capacidades del SPEC §2 (cada una sin consumidor
   dice qué lane la usa), `puede(rol: unknown, capacidad: Capacidad)`,
   `quienPuede(capacidad): string`, `QUE_PUEDE: Record<Rol, string>`,
   `esUnaSola(rol): boolean`; exportados por `@ed/auth`. Test de la matriz
   contra el §3. `BarraLateral` pasa de `tocarCuentas` a `usarCuentas`.
   Acepta: `pnpm --filter @ed/auth test` y `pnpm typecheck`, exit 0.
   *(judgment · high)*
2. **Una sola dirige.** Migración `una_sola_dirige` (`--create-only` + el
   SQL del índice, antes de aplicarla) y su comentario en `auth.prisma`;
   `datos/direccion.ts` con `hayQuienDirige()` y `nombrarDireccion(correo)`
   (resultado en llano, sin tirar); `crear-cuenta` acepta `dirige` y se niega
   si ya hay una (con `esUnaSola` del paso 1); `nombrar-direccion` nuevo en
   `scripts/` y en el `package.json` de la app. Test contra la base: una
   segunda dirige choca en el índice, y `nombrarDireccion` se niega con
   correo inexistente o con una dirige ya nombrada.
   Acepta: `pnpm migrate:status` al día y
   `pnpm --filter sitio exec tsx --test src/datos/direccion.test.ts`, exit 0.
   *(integration · high)*
3. **La sidebar por capacidad.** `modulos.ts` suma `capacidad?: Capacidad`
   por módulo (Inicio sin); `BarraLateral` calcula en el servidor las claves
   visibles con `puede` y `MenuDelAdmin` recibe `visibles` en vez de
   `conConfiguracion`; un grupo sin entradas no se dibuja.
   Acepta: `pnpm typecheck` y `pnpm lint`, exit 0. *(integration · medium)*
4. **La guarda y «Sin permiso».** `datos/sesion.ts › sesionActual()` (la
   sesión del pedido, con `cache` de React; la usa también el layout
   protegido); `admin/armazon/Guarda.tsx` (`<Guarda capacidad>`) y
   `SinPermiso.tsx` (el `h1` con `quienPuede`, tu rol, «Ir al Inicio»);
   `contenido/layout.tsx` con `editarContenido`; `[modulo]/page.tsx` pasa por
   la guarda con la capacidad del módulo de `modulos.ts`. Test: cada carpeta
   de módulo bajo `(protegido)/` tiene un layout con la guarda y la capacidad
   de `modulos.ts` (excepción escrita: `mi-cuenta/`). DESIGN.md §11:
   «Sin permiso».
   Acepta: `pnpm --filter sitio exec tsx --test src/admin/armazon/guarda.test.ts`,
   exit 0. *(judgment · high)*
5. **Cada acción chequea su capacidad.** `acciones-con-sesion.test.ts` suma
   el chequeo de `puede(` justo después de la sesión, con sus tests del
   chequeo y las excepciones por nombre del SPEC §3 (el motivo nombra la lane
   dueña); `vista-previa.ts` suma `puede(…, "editarContenido")`.
   Acepta:
   `pnpm --filter sitio exec tsx --test src/datos/acciones/acciones-con-sesion.test.ts`,
   exit 0. *(integration · high)*
6. **La tabla `actividad`.** Modelo en `prisma/schema/actividad.prisma` y su
   migración; `datos/actividad.ts › registrarActividad({ tipo, quien, sobre?,
   sobreId? }): Promise<void>` con los cuatro tipos cerrados y Zod, que nunca
   tira (loguea). Test contra la base: registra una fila, rechaza un tipo que
   no está en la lista, y una cuenta con actividad no se puede borrar.
   Acepta: `pnpm --filter sitio exec tsx --test src/datos/actividad.test.ts`,
   exit 0. *(integration · high)*
7. **Entrar, salir y la contraseña quedan registrados.** `OpcionesDeAuth`
   suma `registrar(evento: { tipo: "entro" | "salio" | "cambio-su-contrasena";
   idDeCuenta: string })`; los ganchos registran `entro` (sign-in bien),
   `salio` (antes de borrar la sesión) y `cambio-su-contrasena`
   (`/change-password` bien, que además manda «Tu contraseña cambió»);
   `onPasswordReset` registra también; `/change-password` con 5 intentos cada
   5 minutos. `datos/auth.ts` lo conecta a `registrarActividad` del paso 6.
   Tests con better-auth de verdad (adaptador en memoria).
   Acepta: `pnpm --filter @ed/auth test`, exit 0. *(judgment · high)*
8. **Dónde se abrió cada sesión.** Columnas `ciudad` y `pais` en `session`
   (migración), `additionalFields` y un `databaseHooks.session.create.before`
   en `@ed/auth` que las llena con `ubicacionDelPedido(cabeceras)`
   (`packages/auth/src/ubicacion.ts`: decodifica, valida y corta). Tests de
   la función y del gancho con better-auth en memoria.
   Acepta: `pnpm --filter @ed/auth test` y `pnpm migrate:status`, exit 0.
   *(integration · medium)*
9. **Una sesión en llano.** `lib/sesiones.ts`: `dispositivoDe(userAgent)`
   («Chrome en Windows») y `lugarDe({ ciudad, pais })` («Córdoba,
   Argentina» · «Ubicación desconocida»), sin dependencias, con test.
   Acepta: `pnpm --filter sitio exec tsx --test src/lib/sesiones.test.ts`,
   exit 0. *(mechanical · low)*
10. **Mi cuenta.** `app/(admin)/admin/(protegido)/mi-cuenta/page.tsx` (ruta
    y nada más); `admin/mi-cuenta/` con Perfil (nombre editable, correo solo
    lectura, contraseña con `authCliente.changePassword`), Tu rol
    (`QUE_PUEDE`), Sesiones (`lugarDe`, `dispositivoDe` del paso 9, «Esta
    sesión», «Cerrar las demás» con `revokeOtherSessions`);
    `datos/consultas/mi-cuenta.ts` (las sesiones abiertas, con `ciudad` y
    `pais` del paso 8) y `datos/acciones/mi-cuenta.ts › cambiarMiNombre`
    (Zod, `auth.api.updateUser`, `registrarActividad` del paso 6, revalida
    el armazón). Sale la guía de Mi cuenta de `admin/por-hacer/guias.ts`. Lo
    que estrene en §11, al DESIGN.md.
    Acepta: `pnpm typecheck`, `pnpm lint` y `node scripts/verificar-react-doctor.mjs`,
    exit 0; el recorrido en el navegador queda para work-verify.
    *(judgment · high)*
11. **`/.well-known/change-password`.** El 308 a `/admin/mi-cuenta#contrasena`
    en `next.config.ts`.
    Acepta: con el dev server en el 3016,
    `curl -sI http://localhost:3016/.well-known/change-password` da `308` y
    `location: /admin/mi-cuenta#contrasena`. *(mechanical · low)*
12. **Los documentos.** Spec del admin §7 (tres roles, la guarda, la
    actividad), AGENTS.md §12 (la línea de los roles), README (`crear-cuenta`
    con `dirige` y `nombrar-direccion` con el caso de producción).
    Acepta: `grep -n "Tres roles" AGENTS.md docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`
    y `grep -n "nombrar-direccion" README.md` encuentran las líneas.
    *(mechanical · medium)*

Después del paso 12: work-verify (el gate entero y el recorrido del SPEC §9
en el navegador) y work-handoff. La revisión de cierre la lanza el padre.
