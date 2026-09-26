# SPEC — Roles y actividad

- **Fecha:** 2026-09-26
- **Estado:** aprobado por el padre el 2026-09-26, con `nombrar-direccion`
  sumado (§2 y DECISIONS)
- **Decide:** el padre de `work/mapa-del-admin/` (Mateo le delegó la
  aprobación, tablas incluidas: DECISIONS del padre, 2026-09-26)
- **Tier:** L · lane 3a del XL `work/mapa-del-admin/` · worktree propio, rama
  `mateo/roles-y-actividad`, dev server en el 3016, base `ed_roles`
- **Diseño:** el brief del padre (lane 3a), sobre el SPEC padre §3, §5.8,
  §5.10, §6 y §9. Esto lo formaliza; no lo vuelve a decidir.
- **Después, en paralelo:** 3b (Cuentas, invitar, Actividad, segundo factor,
  «← volver») y 3c (el Inicio nuevo) consumen lo que sale de acá.

---

## 1. Qué se quiere

Que todo módulo que venga nazca con permisos por rol y registrando lo que se
hace. Esta lane pone las dos bases —**quién puede qué** y **la tabla
`actividad`**— y la primera pantalla que las usa: **Mi cuenta**.

## 2. Tres roles y sus capacidades

`packages/auth/src/permisos.ts` pasa de dos roles a tres: **dirige,
administra, edita**. Es el único archivo que compara contra el string de un
rol; el resto pregunta por una **capacidad con nombre**. El día que cambie un
rol, cambia ese archivo y nada más.

Las capacidades son la tabla del SPEC padre §3, fila por fila:

| Capacidad | Dirige | Administra | Edita | Fila del §3 |
| --- | --- | --- | --- | --- |
| `editarContenido` | ✓ | ✓ | ✓ | Contenido (Páginas, Casos, Equipo, Fotos) · Aliados: editar |
| `autorizarAliados` | ✓ | ✓ | — | Aliados: marcar «Autorizado» |
| `editarNovedades` | ✓ | ✓ | ✓ | Novedades |
| `editarBiblioteca` | ✓ | ✓ | ✓ | Biblioteca |
| `verContacto` | ✓ | ✓ | ✓ | Mensajes › Contacto |
| `verCV` | ✓ | ✓ | — | Mensajes › CV |
| `verMetricas` | ✓ | ✓ | ✓ | Métricas |
| `usarCuentas` | ✓ | ✓ | — | Cuentas y Actividad |
| `tocarLaCuentaDeQuienDirige` | ✓ | — | — | «✓ menos a quien dirige» |
| `pasarLaDireccion` | ✓ | — | — | Dirige: «la única que puede pasar la dirección» |
| `usarAjustes` | ✓ | ✓ | — | Ajustes |

**Inicio y Mi cuenta no son capacidades:** son el piso de toda sesión (Sin
permiso lleva al Inicio, y la cuenta propia siempre es tuya). `tocarContenido`
y `tocarCuentas` se renombran a `editarContenido` y `usarCuentas`; hoy solo
los usa la sidebar. La capacidad `configurarConexiones` de la lane 5: si al
rebasear ya está en `main`, se extiende a dirige y administra; si no, no se
inventa.

Lo que el archivo exporta, además de `ROLES`, `esRol`, `ROL_POR_DEFECTO`
(sigue siendo `edita`), `SIN_PERMISO` y `LARGO_MINIMO_CONTRASENA`:

- `PUEDE`, la tabla de arriba, y `puede(rol: unknown, capacidad)`: un rol
  que no es de los tres no puede nada.
- `quienPuede(capacidad)` → «quien dirige o administra», para «Sin permiso».
- `QUE_PUEDE[rol]`: la frase de cada rol, la del §3 («Todo, incluidas las
  cuentas y los CV…»). La usan «Tu rol» acá y «Qué puede cada rol» en 3b: se
  escribe una vez.
- `esUnaSola(rol)`: si de ese rol hay una sola persona (hoy, dirige).

**Dirige es una, siempre, y lo garantiza la base:** un índice único parcial
`user_una_sola_dirige` sobre `user(rol) WHERE rol = 'dirige'`. Prisma no lo
escribe sin un preview feature, así que va con `migrate dev --create-only` y
el SQL sumado antes de la primera aplicación. Verificado el 2026-09-26: con el
índice escrito a mano, `prisma migrate diff` desde las migraciones contra el
esquema da una migración vacía, o sea que una `migrate dev` futura no lo
borra. El esquema lo nombra en un comentario, con el porqué.

**La primera persona que dirige** se nombra con `crear-cuenta`, que acepta
`dirige` y se niega si ya hay una («Ya hay una persona que dirige: la
dirección se pasa desde Cuentas»). El chequeo previo da el mensaje; el índice
es la garantía, también contra dos altas a la vez.

**Si esa persona ya tiene cuenta** (el caso de producción), un comando aparte,
`pnpm --filter sitio nombrar-direccion <correo>`, la pasa a dirige. Se niega,
con un mensaje en llano y un exit distinto de 0, si ya hay una dirige o si el
correo no existe. `crear-cuenta` sigue solo dando de alta. Cada capacidad sin
consumidor todavía dice en una línea qué lane la va a usar.

## 3. La guarda por módulo y «Sin permiso»

Tres capas, para que ninguna dependa de acordarse:

1. **La sidebar** muestra solo los módulos que tu rol puede usar.
   `admin/armazon/barra-lateral/modulos.ts` gana la capacidad de cada
   módulo (Inicio sin capacidad) y `BarraLateral` filtra en el servidor: a
   quien edita no le aparecen Cuentas ni Ajustes, como hoy, pero ahora sale
   de la tabla y no de un booleano.
2. **Cada layout de módulo** llama a la guarda:
   `<Guarda capacidad="usarCuentas">{children}</Guarda>`
   (`admin/armazon/Guarda.tsx`). Con la capacidad, renderiza; sin ella,
   **«Sin permiso»**. Los módulos que todavía son una guía de
   `admin/por-hacer/` pasan por `[modulo]/page.tsx`, que llama a la misma
   guarda con la capacidad del módulo: quien edita y entra a
   `/admin/cuentas` por URL ve «Sin permiso», no la guía.
3. **Cada Server Action** chequea su capacidad después de la sesión:
   `if (!puede(sesion.user.rol, "editarContenido")) return … SIN_PERMISO`.

**«Sin permiso»** (`admin/armazon/SinPermiso.tsx`, patrón nuevo con su línea
en DESIGN.md §11): el encabezado de siempre con el `h1` «Esta sección es de
quien dirige o administra» (la frase sale de `quienPuede`), una línea con tu
rol, y «Ir al Inicio» como botón secundario. Sin primario: no hay nada que
hacer acá. Sin 403: una pantalla dentro del armazón, con la sidebar, así
queda claro dónde estás y adónde volver.

**Imposible de olvidar**, con dos tests como el que ya existe para la sesión:

- **Layouts:** cada carpeta de módulo bajo `app/(admin)/admin/(protegido)/`
  tiene un `layout.tsx` que llama a `<Guarda capacidad="…">` con la misma
  capacidad que `modulos.ts` le da a ese módulo; `[modulo]/page.tsx` llama a
  la guarda. Excepción escrita: `mi-cuenta/` (la cuenta propia es de toda
  sesión). Hoy eso agrega `contenido/layout.tsx` (`editarContenido`).
- **Acciones:** `acciones-con-sesion.test.ts` suma que toda acción exportada
  llame a `puede(` justo después de la sesión (sin otro `await` ni `base.`
  en el medio). Excepciones por nombre, cada una con su motivo:
  - `mi-cuenta.ts › cambiarMiNombre` — la cuenta propia.
  - `salir-de-vista-previa.ts` — ya exceptuada de la sesión, por lo mismo.
  - **Las acciones de las lanes en vuelo** (`paginas.ts` ×3, `fotos.ts`,
    `actualizar-metricas.ts`), que el brief no me deja tocar, con el motivo
    «lo suma la lane dueña del archivo (paginas-inicio · busquedas-de-google)
    al rebasear, y saca esta línea». La que rebasea después lo hace; el test
    exige que cada excepción apunte a una acción que exista.
  - `vista-previa.ts › abrirVistaPrevia` no está cercada: suma su
    `puede(…, "editarContenido")` acá.

La guarda del layout es la de la experiencia (Next no vuelve a correr un
layout al navegar entre sus páginas); la seguridad es la acción y el dato,
por eso las dos capas.

## 4. La tabla `actividad`

Quién hizo qué, sobre qué y cuándo (SPEC padre §5.8). Se crea ahora para que
cada módulo registre desde el día uno.

| Columna | Tipo | Qué es |
| --- | --- | --- |
| `id` | `text` PK, uuid | |
| `cuenta_id` | `text` → `user.id`, `ON DELETE RESTRICT` | Quién. Restrict es la regla de 3b: una cuenta que hizo algo no se borra, se suspende |
| `tipo` | `text` | Qué. Cerrado en código (abajo), no un enum de Postgres: así sumar un tipo no pide migración |
| `sobre` | `text` nullable | Sobre qué, en llano y como era en ese momento («Inicio», «Ana Pérez»): lo que se borró después se sigue leyendo |
| `sobre_id` | `text` nullable | El id o slug de eso, para linkearlo |
| `en` | `timestamp`, default `now()` | Cuándo |

Índices: `(en)` para la poda y la lista, `(cuenta_id, en)` para el filtro por
persona y «desde tu última visita».

**Una sola puerta:** `datos/actividad.ts › registrarActividad({ tipo, quien,
sobre?, sobreId? })`, validada con Zod. Los tipos son una lista cerrada en
ese archivo; cada módulo suma los suyos ahí. **No es una Server Action** (no
vive en `datos/acciones/`): si lo fuera, el navegador podría llamarla.
Registrar nunca frena lo que se registra: si la base falla, queda en el log y
la acción sigue.

**Los tipos de esta lane**, lo que es suyo:

| Tipo | Cuándo | `sobre` |
| --- | --- | --- |
| `entro` | entrar bien (`/sign-in/email`) | — |
| `salio` | salir (`/sign-out`) | — |
| `cambio-su-contrasena` | desde Mi cuenta, o eligiendo una nueva por el enlace | — |
| `cambio-su-nombre` | desde Mi cuenta | el nombre nuevo |

Cerrar las demás sesiones **no** se registra: el brief nombra cuatro y el §5.8
tampoco lo lista. Las acciones de páginas y fotos no se tocan (lane 4a): el
padre le pide a la que se mergee después que registre las suyas. **De un CV
solo se registra que se borró**: el tipo lo sumará Mensajes sin `sobre`.

**Entrar, salir y la contraseña pasan por better-auth**, no por una acción:
los registra `@ed/auth` desde sus ganchos y la app decide dónde se guarda
(`OpcionesDeAuth.registrar`, como ya hace con los bloqueos). El paquete
conoce tres sucesos de sesión, genéricos; no sabe de la tabla.

**Los 12 meses:** la poda es una tarea del cron diario de la lane 5. Si al
rebasear ya está en `main`, se registra la tarea; si no, queda anotado en el
PROGRESS y el padre se la pasa a quien siga.

## 5. Mi cuenta — `/admin/mi-cuenta`

Desde el menú de la cuenta (ya linkea acá). Una pantalla, sin pestañas, en
secciones con ancla. Su guía de `admin/por-hacer/guias.ts` se borra. **Avisos
y Seguridad no están** (llegan con Mensajes y con 3b) y no se les deja lugar.

- **Perfil** (`#perfil`): el **nombre**, editable, con «Guardar» (Server
  Action `cambiarMiNombre`: Zod, 1 a 80 caracteres sin espacios de más,
  `auth.api.updateUser`, registra `cambio-su-nombre`, y la sidebar se
  redibuja con el nombre nuevo). El **correo**, solo lectura: cambiarlo pide
  verificar el buzón nuevo, que ningún SPEC pide todavía; una línea dice «Si
  cambió tu correo, pedíselo a quien administra».
- **Contraseña** (`#contrasena`, dentro de Perfil): la actual, la nueva (con
  la ayuda del largo mínimo) y «Cambiar la contraseña». Va por el cliente de
  better-auth (`changePassword`), no por una acción: así pasa por el rate
  limit por IP y better-auth puede poner la cookie de la sesión nueva. Como
  el reset: **cierra las demás sesiones** y manda **«Tu contraseña cambió»**
  (el correo que ya existe). Se suma un límite propio a `/change-password`,
  5 intentos cada 5 minutos, igual que `/reset-password`: la contraseña actual
  no se prueba a mansalva desde una sesión robada.
- **Tu rol** (`#rol`): el rol y su frase de `QUE_PUEDE`.
- **Sesiones** (`#sesiones`): una `Lista` con cada sesión abierta:
  dispositivo («Chrome en Windows», leído del user agent, sin dependencias),
  ciudad aproximada y última actividad; la actual lleva la insignia «Esta
  sesión». «Cerrar las demás» (cliente de better-auth,
  `revokeOtherSessions`) aparece si hay otras.

**La ciudad:** Vercel manda `x-vercel-ip-city` y `x-vercel-ip-country` en
cada pedido. Se guardan en la sesión cuando se crea (un `databaseHook` de
better-auth, en `@ed/auth`), y se muestran como «Córdoba, Argentina»; sin
ellas, «Ubicación desconocida» (en local nunca están). Nada de servicios de
geo-IP. Columnas nuevas en `session`:

| Columna | Tipo | Qué es |
| --- | --- | --- |
| `ciudad` | `text` nullable | De `x-vercel-ip-city`, decodificada, hasta 80 caracteres |
| `pais` | `text` nullable | De `x-vercel-ip-country`: dos letras, ISO 3166-1 |

La última actividad es `session.updatedAt`, que better-auth mueve cada hora
de uso (`updateAge`): se muestra relativa («hace 2 horas»). Las sesiones se
leen de `datos/consultas/`, no de `auth.api.listSessions`, que exige haber
entrado hace menos de 10 minutos.

## 6. `/.well-known/change-password`

308 a `/admin/mi-cuenta#contrasena` (W3C), en los `redirects` de
`next.config.ts`, al lado del 308 de Páginas.

## 7. Documentos que cambian

- **Spec del admin §7:** tres roles, no dos, con la tabla de §2 resumida y
  dónde vive (`permisos.ts`), la guarda y la tabla `actividad`.
- **AGENTS.md §12:** la línea «Dos roles, administra y edita» pasa a tres,
  con dónde viven las capacidades. (Cambia AGENTS.md: lo revisa Mateo en el
  PR, DECISIONS del padre.)
- **README:** `crear-cuenta` con `dirige` para la primera persona de ED, y
  `administra` para el desarrollo; al lado, `nombrar-direccion` para la
  persona de ED que ya tiene cuenta.
- **DESIGN.md §11:** «Sin permiso», y lo que Mi cuenta estrene si hace falta.
  (Cambia DESIGN.md: lo revisa Mateo en el PR.)

## 8. Fuera de esta lane

- Cuentas, invitar, una cuenta, pasar la dirección, suspender, la pantalla de
  Actividad, el segundo factor y «← volver» (3b); el Inicio nuevo (3c); los
  avisos por mail (Mensajes).
- Las acciones y pantallas de páginas, fotos y métricas (4a y 5).
- Cambiar el propio correo.

## 9. Criterio de hecho

- El gate entero en verde, con la salida en el PROGRESS: `pnpm typecheck`,
  `pnpm lint`, `node scripts/verificar-react-doctor.mjs` (100/100 sin
  diagnósticos), `pnpm test`, `pnpm build`.
- Tests: la tabla de permisos contra el §3; el índice parcial contra la base
  (una segunda dirige choca); `registrarActividad` contra la base; los ganchos
  de entrar, salir y cambiar la contraseña contra better-auth de verdad; la
  ubicación y el dispositivo; los dos tests de «imposible de olvidar».
- En el navegador, en el 3016, con tres cuentas (una por rol): la sidebar de
  cada rol; quien edita en `/admin/cuentas` ve «Sin permiso»; Mi cuenta
  cambia el nombre, cambia la contraseña (llega el correo por la consola y se
  cierran las otras sesiones) y cierra las demás; `actividad` tiene las filas
  de entrar, salir, contraseña y nombre; `/.well-known/change-password`
  contesta 308. Los tres temas, 390 de ancho y el foco con teclado.
