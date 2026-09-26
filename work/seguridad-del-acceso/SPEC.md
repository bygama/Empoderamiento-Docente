# SPEC — Seguridad del acceso

- **Fecha:** 2026-09-26
- **Estado:** aprobado por el padre el 2026-09-26, con los cinco puntos del §8
  resueltos en [`DECISIONS.md`](DECISIONS.md) (el 1 y el 3, con la palabra de
  Mateo); plan en [`PLAN.md`](PLAN.md)
- **Decide:** Mateo; aprueba el padre (`work/mapa-del-admin/DECISIONS.md`: las
  tablas y la dependencia de acá ya tienen su OK)
- **Tier:** L · lane 2 de 12 del XL [`mapa-del-admin`](../mapa-del-admin/SPEC.md)
  · rama `mateo/seguridad-del-acceso` · worktree propio · base `ed_seguridad`
- **Diseño:** aprobado por Mateo en conversación el 2026-09-22 (shaping,
  secciones 3 a 6). Este SPEC lo formaliza; no lo re-decide.
- **Registra:** ADR-0010 «Seguridad del acceso» (nuevo)
- **Reabre:** el spec del admin (`docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`) §7

---

## 1. Para qué

Un inventario del 2026-09-22 encontró seis agujeros en el acceso al admin:

| Hallazgo | Hoy |
| --- | --- |
| El reset de contraseña no manda mail | `datos/auth.ts` lo escribe en la consola; en producción el enlace iría a los logs |
| El rate limit vive en memoria | `rateLimit` sin `storage`: cada instancia de Vercel lleva su propia cuenta |
| No hay bloqueo por cuenta | un ataque repartido entre muchas IP contra una sola cuenta no choca con nada (spec §7 lo anota) |
| Los tokens se guardan en claro | `verification.identifier` = `reset-password:<token>` tal cual |
| La cookie de vista previa no vence | Draft Mode pone `__prerender_bypass` sin `maxAge`, `SameSite=None` |
| El admin tiene `'unsafe-inline'` en los scripts | `middleware.ts` usa la misma CSP para el sitio y el admin |

Mateo pidió «las mejores prácticas de las mejores prácticas y lo más
escalable». Además, **las lanes 3 (invitar, segundo factor) y 7 (avisos)
dependen de los mails de esta lane**: el cliente de Resend y la forma de las
plantillas nacen acá.

## 2. Correos

- **Cliente:** `apps/sitio/src/lib/correo/resend.ts`, por `fetch` a
  `POST https://api.resend.com/emails`, **sin paquete**. Recibe el `fetch` por
  parámetro (el de verdad por defecto) para testearlo, manda
  `Idempotency-Key` y corta a los **10 s** (`AbortSignal.timeout`). Un solo
  reintento, con la misma clave, ante timeout, error de red o 5xx: es lo que le
  da sentido a la clave de idempotencia (sin reintento, la clave no protege de
  nada). Un error nunca incluye el cuerpo enviado, que lleva el enlace. No
  importa nada de la app (`lib/` incuba sin `@/`, AGENTS.md §12).
- **Plantillas:** `apps/sitio/src/correos/`, cada una una función que devuelve
  `{ asunto, html, texto }`:
  - **«Elegí tu contraseña»** — el enlace del reset, cuánto dura (1 h) y «si no
    lo pediste, ignoralo: tu contraseña sigue igual». La lane 3 la reusa para
    la invitación (72 h).
  - **«Tu contraseña cambió»** — cuándo, que se cerraron las demás sesiones, y
    qué hacer si no fue esa persona. Sale por `onPasswordReset`.
  - HTML sobrio y con los valores escapados; el texto plano dice lo mismo.
    Voseo y lenguaje inclusivo (AGENTS.md §5.1).
- **Transporte**, elegido por el entorno en un solo lugar (`correos/`):
  - con `RESEND_API_KEY`: Resend, desde `CORREO_REMITENTE`;
  - sin clave y fuera de producción: la consola, con el enlace (es lo que hace
    falta en local);
  - sin clave en producción: un `console.error` que dice que el correo no
    salió, **sin el enlace ni el token**. En producción nunca se loguean.
- **En segundo plano**, para que el tiempo de respuesta no delate si el correo
  existe: `advanced.backgroundTasks.handler` de better-auth, que la app arma
  con `after()` de Next. Fuera de un request (los scripts), la promesa corre
  igual. `onPasswordReset` better-auth lo espera, así que ese envío lo manda a
  segundo plano la app misma, con el mismo handler.
- **Variables nuevas:** `RESEND_API_KEY` (ya estaba declarada, ahora se usa) y
  `CORREO_REMITENTE`, con placeholder en `apps/sitio/.env.example`.
- **Lo que hace ED aparte** (va en el README, no en código): verificar el
  dominio en Resend con SPF, DKIM y DMARC, y apagar el click tracking (reescribe
  el enlace del reset y lo pasa por un tercero).

## 3. Fuerza bruta

### 3.1. El rate limit, en la base

`rateLimit.storage: "database"`: la cuenta es una sola para todas las
instancias. **Los topes de hoy**, sin cambios: 60 por minuto en general, 3 por
minuto en `/sign-in/email`, 3 cada 5 minutos en `/request-password-reset` y 5
cada 5 minutos en `/reset-password`. **Sale la regla de `/forget-password`**:
better-auth 1.7.5 no tiene esa ruta (solo existe en el plugin `email-otp`, que
no usamos), así que la regla no limitaba nada.

### 3.2. El bloqueo por cuenta

| Regla | Valor |
| --- | --- |
| Frena | 5 fallos en 15 minutos |
| Por cuánto | 15 minutos la primera vez; se duplica cada vez que vuelve a frenarse (30, 60) y no pasa de 1 hora |
| Qué contesta | **el mismo 429 que el rate limit**: el mismo cuerpo, con `X-Retry-After` |
| Qué cuenta | todo intento de entrar con correo y contraseña que termina en 401, **exista o no el correo** (si no, el bloqueo delataría qué correos existen) |
| Qué lo destraba | un reset de contraseña completo, o que pase el freno |
| Qué lo limpia | entrar bien: la fila se borra, y con ella la escalera de 15 → 30 → 60 |
| Cuánto dura la escalera | una fila sin fallos en 24 h y sin freno vigente se borra; se poda en segundo plano al registrar un fallo |

- **Nunca el correo en claro:** la fila se identifica con un HMAC-SHA256 del
  correo normalizado (`trim` + minúsculas, como lo compara better-auth), con
  el secreto de better-auth como clave y un prefijo propio para separar este
  uso de la firma de sesiones. Rotar el secreto borra, en la práctica, todos
  los bloqueos: está bien, y lo dice el ADR.
- **La lógica en `packages/auth`** (qué es un fallo, cuándo frena, cuánto,
  el HMAC, los hooks `before`/`after` de `/sign-in/email` y el destrabe en
  `onPasswordReset`), sin nada de ED ni de Prisma. **El almacenamiento en
  `datos/`**, detrás de una interfaz que `packages/auth` declara y la app
  implementa con Prisma.
- **Atómico:** dos fallos al mismo tiempo no se pisan. La app actualiza la
  fila dentro de una transacción con la fila bloqueada (`SELECT … FOR UPDATE`).
- **El aviso en pantalla** es uno solo para el límite por IP y para el
  bloqueo (SPEC padre §5.1): «Demasiados intentos. Esperá unos minutos y probá
  de nuevo.» (hoy dice «un minuto», que no alcanza para un freno de 15).

## 4. Cookies y sesión

- **Sesión:** `expiresIn` 12 h, `updateAge` 1 h, `freshAge` 10 min (lo usa la
  lane 3 para las operaciones sensibles).
- **`revokeSessionsOnPasswordReset: true`:** elegir una contraseña nueva cierra
  todas las sesiones de la cuenta.
- **`SameSite=Strict`** en todas las cookies de better-auth, por
  `advanced.defaultCookieAttributes`. Consecuencia: quien llega al admin desde
  un link de otro sitio (un correo, un chat) no manda la cookie en esa primera
  navegación y cae en `/admin/entrar` aunque tenga sesión. Por eso **el proxy
  rebota esa navegación**: un `GET` de documento a una pantalla protegida,
  sin la cookie y con `Sec-Fetch-Site: cross-site`, recibe una página mínima
  con `<meta http-equiv="refresh">` a la misma URL (y un link «Seguir»); la
  segunda navegación ya es del mismo origen y lleva la cookie. Sin sesión,
  sigue el 307 a `/admin/entrar` de siempre. Y **`FormularioEntrar`, después
  de entrar, confirma la sesión por un `fetch` al mismo origen**
  (`authCliente.getSession()`) antes de seguir a `volver` (si no quedó, lo
  dice en vez de volver a `entrar`). `volver` sigue aceptando solo rutas de
  `/admin`. *(Cambiado el 2026-09-26: decía que `FormularioEntrar` consultaba
  también al cargar; react-doctor lo frenó y el padre eligió el proxy, con las
  condiciones de DECISIONS.)*
- **`__Host-` queda descartado:** better-auth 1.7.5 siempre antepone
  `__Secure-` a sus cookies en HTTPS y no deja cambiar el prefijo.
- **La cookie de vista previa:** después de `draftMode().enable()`,
  `abrirVistaPrevia` la vuelve a escribir con el mismo valor, **`maxAge` de
  1 h** y `SameSite=Lax` (`httpOnly`, `secure` en producción, `path=/`). Se
  prueba primero; si Next no deja pisarla, se anota en DECISIONS y queda como
  hoy.

## 5. Endurecer

- **`verification.storeIdentifier: "hashed"`:** el token del reset se guarda
  hasheado. Un enlace pedido antes del deploy deja de servir (duran 1 h).
- **Argon2id con `@node-rs/argon2`** (OK de Mateo): los parámetros de OWASP,
  **19 MiB, t=2, p=1**. `emailAndPassword.password.{hash, verify}` en
  `packages/auth`:
  - `hash` siempre Argon2id;
  - `verify` reconoce el formato: `$argon2id$…` con Argon2, y el `sal:clave`
    hex de scrypt de better-auth con su propio `verifyPassword`;
  - **rehash al entrar:** un hook `after` de `/sign-in/email`, cuando el login
    salió bien y el hash guardado no es Argon2id, rehashea con la contraseña que
    acaba de llegar y lo guarda (`internalAdapter.updatePassword`). Las cuentas
    pasan solas, sin reset forzado.
- **CSP del admin con nonce:** un nonce aleatorio por respuesta;
  `script-src 'self' 'nonce-…' 'strict-dynamic'`, `'unsafe-eval'` solo en
  desarrollo; `style-src` sigue con `'unsafe-inline'`. El nonce viaja a Next
  en la cabecera CSP del request, y Next lo pone en sus scripts. **El layout
  raíz del admin (`app/(admin)/layout.tsx`) se vuelve dinámico**
  (`await connection()`): las pantallas de acceso hoy pueden prerenderizarse, y
  una página estática no puede llevar el nonce de cada respuesta. **El sitio
  público no cambia:** es estático a propósito (su LCP), y su CSP sigue como
  está (ver §8, supuesto 2).
- **`middleware.ts` pasa a `proxy.ts`** (la convención de Next 16: `export
  function proxy`), con el mismo matcher y el mismo trabajo. En Next 16 el proxy
  corre en Node; sigue siendo un filtro que solo mira la cookie.
- **En `/admin`, además:** `Cross-Origin-Opener-Policy: same-origin`,
  `Cross-Origin-Resource-Policy: same-origin` y `X-Frame-Options: DENY`.

## 6. Tablas, dependencias y fronteras

### 6.1. Tablas (las dos que aprobó Mateo)

En `apps/sitio/prisma/schema/auth.prisma`, con una migración generada por
Prisma:

```prisma
/// better-auth la usa con rateLimit.storage = "database". Sus nombres, como
/// las otras tablas de la librería.
model RateLimit {
  id          String @id          // better-auth pone un id en toda tabla suya
  key         String @unique      // IP + ruta, lo arma better-auth
  count       Int
  lastRequest BigInt              // milisegundos desde 1970, como lo escribe better-auth

  @@map("rateLimit")
}

/// El bloqueo por cuenta. Una fila por correo con fallos recientes.
model BloqueoDeAcceso {
  clave    String    @id          // HMAC-SHA256 del correo; nunca el correo
  fallos   Int                    // fallos en la ventana que corre
  desde    DateTime               // cuándo empezó esa ventana de 15 min
  bloqueos Int                    // cuántas veces seguidas se frenó (15 → 30 → 60)
  hasta    DateTime?              // frenada hasta; null si no

  @@map("bloqueos_de_acceso")
}
```

`key`, `count` y `lastRequest` son las columnas que Mateo nombró; `id` lo
exige better-auth (valida el esquema al arrancar). En `bloqueos_de_acceso`
Mateo nombró el HMAC del correo; las otras cuatro son lo mínimo para las
reglas del §3.2 (contar, la ventana, la escalera y el freno).

### 6.2. Dependencias

- **`@node-rs/argon2`** en `packages/auth` (OK de Mateo). Trae binarios por
  plataforma, sin scripts de instalación; Next 16 ya la trata como paquete
  externo del servidor.
- **`tsx` como devDependency de `packages/auth`**, para correr sus tests con
  `pnpm test` (script `tsx --test`). No es un paquete nuevo: la misma versión
  ya está en el lockfile por `apps/sitio`. Se pregunta igual (§8).

### 6.3. Fronteras

- `packages/auth` no sabe de ED: el HMAC, el bloqueo, Argon2 y los hooks
  reciben el almacenamiento y el envío de segundo plano por parámetro.
- `datos/` es la única puerta a la base: el almacenamiento del bloqueo vive en
  `apps/sitio/src/datos/bloqueos-de-acceso.ts`, al lado de `datos/auth.ts`.
- `lib/correo/` no importa nada de la app; `correos/` es de ED (el remitente,
  la marca, el entorno).

## 7. Archivos

**Toca:** `packages/auth/` (config, bloqueo, contraseñas, guarda, sus tests,
`package.json`), `apps/sitio/src/datos/auth.ts`,
`apps/sitio/src/datos/bloqueos-de-acceso.ts`,
`apps/sitio/src/datos/acciones/vista-previa.ts`,
`apps/sitio/src/lib/correo/`, `apps/sitio/src/correos/`,
`apps/sitio/src/proxy.ts` (antes `middleware.ts`),
`apps/sitio/src/app/(admin)/layout.tsx`, los tres `Formulario*.tsx` de las
pantallas de acceso, `apps/sitio/prisma/` (esquema y migración),
`apps/sitio/.env.example`, el README, `docs/AI_GUIDELINES.md` §12, el spec del
admin §7, ADR-0010 y el índice de ADRs, y **AGENTS.md** (§5.6: lo revisa Mateo
en el PR): la línea de la sesión en §12, la nota «Qué de esto ya existe» de
§12 y el árbol de §3 (`proxy.ts`, `correos/`, `lib/correo/`), que con el
cambio de nombre quedarían mintiendo.

**No toca** (los tiene la lane 1, `patrones-del-admin`):
`apps/sitio/src/admin/armazon/` (incluida `Pantalla.tsx`), los `page.tsx` de
`entrar`, `olvide-mi-contrasena` y `nueva-contrasena`, `admin/paginas/`,
`admin/por-hacer/`, `admin/metricas/`, los `redirects` de `next.config.ts` y
DESIGN.md. Esta lane no necesita `next.config.ts`: las cabeceras viven en el
proxy.

## 8. Supuestos y preguntas

Los cinco quedaron resueltos el 2026-09-26, todos como están escritos acá
(DECISIONS.md). El 5 se reemplazó el mismo día por el rebote en el proxy
(§4): react-doctor frena las dos formas de redirigir desde el cliente.

1. **Las columnas de `bloqueos_de_acceso`** (§6.1): Mateo nombró la tabla y el
   HMAC; `fallos`, `desde`, `bloqueos` y `hasta` son lo mínimo para sus reglas.
   ¿Alcanza su OK, o van a Mateo?
2. **`'unsafe-eval'` «solo en desarrollo y solo en el admin»:** se lee como
   «en la CSP nueva del admin, solo en desarrollo». La CSP del sitio queda como
   está (hoy también abre `'unsafe-eval'` en `next dev`, porque React lo usa para
   las pilas de error). Si la lectura es «sacarlo también del sitio en
   desarrollo», es un cambio de una línea.
3. **`tsx` en `packages/auth`** (§6.2), para que los tests del bloqueo y del
   rehash vivan con su código. La alternativa sin tocar dependencias es
   testearlos desde `apps/sitio`.
4. **Un reintento en el cliente de Resend** (§2): no estaba escrito en el
   diseño; se suma porque es lo que hace útil la `Idempotency-Key`.
5. **`FormularioEntrar` consulta la sesión también al cargar** (§4), no solo
   después de entrar: es lo que evita pedirle la contraseña a quien llega con
   sesión desde un link de un correo.

## 9. Verificación

Además del gate (`pnpm typecheck`, `pnpm lint`,
`node scripts/verificar-react-doctor.mjs` 100/100, `pnpm test`, `pnpm build`):

- **Tests:** el cliente de Resend con el `fetch` inyectado (cabeceras,
  `Idempotency-Key`, timeout, el reintento, que un error no lleve el cuerpo);
  el bloqueo (5 fallos → 429, la escalera 15 → 30 → 60 → 60, el destrabe con el
  reset, que entrar bien limpia, el HMAC estable y distinto por secreto, sin el
  correo adentro); el rehash (un hash scrypt de better-auth verifica y pide
  rehash; uno Argon2id no; el hash nuevo es `$argon2id$v=19$m=19456,t=2,p=1$`).
- **De punta a punta, en el dev server (puerto 3012, base `ed_seguridad`):**
  entrar; «Olvidé mi contraseña» (el mail sale por la consola sin clave);
  elegir contraseña (llega «Tu contraseña cambió» por la consola y se cierran
  las otras sesiones); el bloqueo al sexto intento (y que un correo inexistente
  también se frena); una cuenta con hash scrypt entra y queda en Argon2id;
  la cookie de vista previa con `Max-Age=3600` y `SameSite=Lax`; las cabeceras
  de `/admin` con `curl -I` (un nonce distinto en cada respuesta,
  `'strict-dynamic'`, COOP, CORP, `X-Frame-Options`); el admin andando con la
  CSP nueva, sin errores de consola, en los tres temas.

## 10. Fuera de alcance

- Invitar cuentas, el segundo factor y Mi cuenta: la lane 3, sobre lo de acá.
- El dominio en Resend y el click tracking: lo hace ED (README).
- `__Host-`: descartado (§4).
- Verificar la sesión contra la base en el proxy: sigue siendo un filtro; la
  verificación de verdad sigue en el layout y en cada Server Action.
- La CSP del sitio público.
