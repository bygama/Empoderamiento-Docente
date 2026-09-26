# PLAN — Mensajes

SPEC aprobado por el padre el 2026-09-26 (DECISIONS). Un paso, un commit.
Cada paso deja `pnpm typecheck` y `pnpm lint` en verde además de su propia
aceptación. Los comandos de test corren desde la raíz del worktree.

## Restricciones de todo el cambio

- **Archivos de otras lanes en vuelo**, que no se tocan: `admin/paginas/`,
  `admin/campos/`, `contenido/`, `lib/contenido/`, `datos/**/paginas*`,
  `prisma/schema/paginas.prisma` y las secciones de Inicio en `features/`
  (4a); `admin/cuentas/` y el segundo factor (3b); la página `/admin` y
  `admin/inicio/` (3c). En `features/` solo se toca `features/contacto/` (el
  envío) y se crea `features/cv/`. Compartidos que concilia quien rebasea
  segundo: `Pestanas.tsx` (4a le suma `sobreAzul`), `MiCuenta.tsx` (3b suma
  una sección: quedan las dos), `guias.ts`, DESIGN.md §11, AGENTS.md, README,
  `prisma/migrations/` (una migración se regenera sobre el `main` nuevo,
  nunca se edita).
- **Las cuatro fronteras:** `packages/` y `lib/` sin dominio de ED; `datos/`
  es la única puerta a la base y ningún componente importa Prisma; `app/` son
  rutas que llaman a `datos/`; `features/` recibe props. Toda Server Action
  empieza por `auth.api.getSession` y sigue con `puede(…)`.
- **Privacidad:** ningún dato de quien escribió en `actividad`, en un correo,
  en un log ni en el detalle de una corrida. El archivo de un CV solo sale por
  la ruta con sesión y `verCV`. La IP solo como HMAC.
- **Los plazos, las bandejas y los campos del CV en un solo lugar**
  (`config/privacidad.ts`, `config/mensajes.ts`, `config/cv.ts`): ningún
  número de meses ni etiqueta de campo repetido en otro archivo.
- **Diseño:** el admin, DESIGN.md §11 (designing-consistently: leer §11
  entero antes, registrar lo nuevo en el mismo commit que lo estrena); el
  sitio público (`features/contacto/`, `/sumate-al-equipo`), DESIGN.md §1 a
  §10 y el lenguaje de Contacto, nada de §11. Solo tokens, un primario por
  pantalla, sin verde ni naranja fuera de su regla, contrastes medidos y
  escritos; tres temas, 390 de ancho y el foco con teclado en lo del admin.
- Español en código, comentarios, docs y commits; UI en voseo e inclusiva.
  Componentes ≤ 200 líneas, utilidades ≤ 100. Repo CRLF. Migraciones solo con
  `pnpm migrate` contra `ed_mensajes`.

## Pasos

1. **Las tablas.** `prisma/schema/mensajes.prisma` con `Mensaje`
   (`mensajes`), `LimitePorIp` (`limites_por_ip`) y `Aviso` (`avisos`), las
   columnas e índices del SPEC §4 comentados como el resto del esquema; en
   `User` (`auth.prisma`) los campos de relación `mensajesTomados` y
   `avisos`. Migración `mensajes` con `pnpm migrate`.
   Acepta: `pnpm migrate:status` «up to date» y `pnpm typecheck`, exit 0.
   *(integration · high)*
2. **Las listas en un solo lugar.** `config/privacidad.ts` (`PLAZOS` y
   `seBorraEl({ bandeja, estado, recibidoEn, estadoEn }): Date`),
   `config/mensajes.ts` (`BANDEJAS` con clave, nombre, capacidad y ruta;
   `ESTADOS` con su etiqueta; `capacidadDe(bandeja)`), `config/cv.ts`
   (`CAMPOS_DEL_CV` con su comentario PROVISORIA, `MAXIMO_DEL_CV`,
   `cvAbierto(entorno)`) y `lib/formularios/campos.ts` (`CampoDeFormulario`,
   `esquemaDe(campos)` → Zod, `datosDe(campos, valores)` →
   `[{ etiqueta, valor }]`). Tests: el plazo de cada caso, que la lista del CV
   tiene `nombre` y `correo`, y que el esquema rechaza lo que la lista no
   permite.
   Acepta: `pnpm --filter sitio exec tsx --test src/config/*.test.ts src/lib/formularios/*.test.ts`, exit 0.
   *(judgment · high)*
3. **El tope por IP.** `lib/formularios/limite.ts` (`ipDelPedido(headers)`,
   `claveDeLimite(formulario, ip, secreto)` con HMAC y prefijo propio) y
   `datos/limites-por-ip.ts` (`sumarEnvio(clave, ventanaMs): Promise<number>`,
   un solo `INSERT … ON CONFLICT DO UPDATE … RETURNING`). Test contra la
   base: diez envíos a la vez cuentan diez, y la ventana vencida vuelve a 1.
   Acepta: `pnpm --filter sitio exec tsx --test src/datos/limites-por-ip.test.ts src/lib/formularios/limite.test.ts`, exit 0.
   *(integration · high)*
4. **El almacén privado de los CV.** `lib/formularios/almacen-privado.ts`
   (`AlmacenPrivado` con `guardar(clave, bytes, tipo)`, `leer(clave)` →
   `{ stream, bytes } | null` y `borrar(clave)` que no falla si no está;
   Blob con `access: "private"` y `CV_BLOB_READ_WRITE_TOKEN`, disco en
   `apps/sitio/.cv/` fuera de producción, y `almacenDeCV()` que tira en
   producción sin token), `lib/formularios/pdf.ts` (`esPdf(bytes)`), `.cv/`
   en `.gitignore`. Test del almacén en disco (guardar, leer, borrar dos
   veces, una clave con `..` rechazada) y de `esPdf`.
   Acepta: `pnpm --filter sitio exec tsx --test src/lib/formularios/almacen-privado.test.ts src/lib/formularios/pdf.test.ts`, exit 0.
   *(integration · high)*
5. **Recibir: `/api/contacto` y `/api/cv`.** `datos/formularios/recibir.ts`
   (el tope con `sumarEnvio`, la trampa, la fila y la respuesta en llano),
   `datos/formularios/contacto.ts` (su esquema: `TEMAS`, `siteConfig.paises`)
   y `datos/formularios/cv.ts` (`cvAbierto`, `Content-Length`, `esquemaDe`
   sobre `CAMPOS_DEL_CV`, `esPdf`, `almacenDeCV`: archivo primero, fila
   después, archivo fuera si la fila falla); `app/api/contacto/route.ts` y
   `app/api/cv/route.ts` solo delegan. Tests contra la base con el `Request`
   armado: 200 y la fila, la trampa sin fila, 400, 429, CV cerrado 404, CV
   no-PDF 400, CV con archivo en disco.
   Acepta: `pnpm --filter sitio exec tsx --test src/datos/formularios/*.test.ts`, exit 0.
   *(integration · high)*
6. **Los avisos por correo.** `correos/mensaje-nuevo.ts` (sin datos de quien
   escribió), `datos/avisos.ts` (`destinatariosDe(bandeja)`,
   `avisosDe(cuenta, rol)`, `guardarAviso(cuenta, aviso, activo)`) y el envío
   en segundo plano desde `recibir.ts` para cada destinatario. Tests: los
   destinatarios por rol y por aviso apagado; el correo no contiene el
   nombre, el correo ni el texto que llegaron.
   Acepta: `pnpm --filter sitio exec tsx --test src/datos/avisos.test.ts src/correos/*.test.ts`, exit 0.
   *(integration · high)*
7. **El formulario de Contacto envía de verdad.** `features/contacto/`:
   `coreografia-envio.ts` por `fetch` a `/api/contacto` (con `{ ok: true }`,
   la transición al cierre de siempre; si no, el error en el formulario),
   «Enviando…» con `aria-busy`, la línea de error `role="alert"`, el campo
   trampa, la línea de privacidad con `PLAZOS`, el cierre sin «listo en tu
   correo» ni «Copiar mensaje». El diseño no cambia.
   Acepta: `pnpm lint` exit 0 y, en el dev server del 3019, un envío desde
   `/contacto` llega al cierre y deja una fila (`psql … -c "select bandeja,
   estado from mensajes"`), y con la base apagada muestra el error sin salir
   del formulario. *(integration · medium)*
8. **`/sumate-al-equipo`.** `features/cv/` (el formulario armado desde
   `CAMPOS_DEL_CV` con los campos y el envío de Contacto, la confirmación en
   el lugar, la línea de privacidad) y `app/(sitio)/sumate-al-equipo/page.tsx`
   (404 si `!cvAbierto()`); «Sumate al equipo» de Contacto lleva ahí solo con
   el CV abierto (prop desde la página). Diseño del sitio, no del admin.
   Acepta: con `CV_ABIERTO` sin definir, `curl -s -o NUL -w "%{http_code}"
   http://localhost:3019/sumate-al-equipo` da 404 y `/contacto` no tiene el
   link; con `CV_ABIERTO=si`, 200 y un PDF enviado deja la fila y el archivo.
   *(judgment · medium)*
9. **El número.** `ItemDeNavegacion` y `Pestanas` suman `numero?:
   { cuantos: number; que: string }` (pastilla `aria-hidden` y `sr-only`
   «(3 sin leer)», nada con 0, «99+»); `datos/consultas/mensajes.ts`
   (`nuevosPorBandeja(rol)`); `BarraLateral` lo calcula como el punto, sin
   voltear la sidebar si la base falla. DESIGN.md §11 «El número», con los
   contrastes de los tres temas.
   Acepta: `pnpm lint` exit 0 y, con un mensaje nuevo en la base, el
   `snapshot` del admin muestra «Mensajes 1» con «(1 sin leer)» en los tres
   temas. *(judgment · medium)*
10. **La bandeja.** `app/(admin)/admin/(protegido)/mensajes/` (`layout.tsx`
    con `<Guarda capacidad="verContacto">`, `page.tsx` que redirige a la de
    más nuevos, `[bandeja]/page.tsx` con la guarda de su capacidad);
    `admin/mensajes/` (encabezado con las pestañas-bandeja y su número, la
    lista, los vacíos); `admin/armazon/Filtro.tsx` y
    `admin/armazon/Buscador.tsx`; `listarMensajes({ bandeja, estado, q })` en
    `datos/consultas/mensajes.ts`; la guía `mensajes` sale de `guias.ts`.
    DESIGN.md §11 «Filtro» y «Buscador».
    Acepta: `pnpm --filter sitio exec tsx --test src/admin/armazon/guarda.test.ts` exit 0;
    como edita, `/admin/mensajes/cv` muestra «Sin permiso» y
    `/admin/mensajes` va a Contacto sin pestañas; filtro, búsqueda y vacíos
    vistos en el navegador. *(judgment · high)*
11. **La ficha y sus acciones.** `[bandeja]/[id]/page.tsx`; en
    `admin/mensajes/` la ficha (datos, mensaje, archivo, «Se borra el…») y
    sus acciones (cliente) por estado; `admin/armazon/Volver.tsx` y la
    confirmación en el lugar; `datos/acciones/mensajes.ts` (`tomar`,
    `cerrar`, `marcarComoSpam`, `borrar`: sesión, `puede(…, capacidadDe(bandeja))`,
    `where { id, bandeja }`, archivo fuera antes que la fila) y los cinco
    tipos en `datos/actividad.ts`; `[bandeja]/[id]/archivo/route.ts` (401 sin
    sesión, 403 sin `verCV`, el `stream` con sus cabeceras). DESIGN.md §11
    «Volver» y «Confirmar lo que no se deshace».
    Acepta: `pnpm --filter sitio exec tsx --test src/datos/acciones/acciones-con-sesion.test.ts src/datos/acciones/mensajes.test.ts` exit 0;
    `curl` a la descarga sin cookie da 401; en el navegador, tomar, cerrar,
    marcar y borrar dejan su fila en `actividad` (y de un CV, solo
    `borro-un-cv`). *(judgment · high)*
12. **Mi cuenta › Avisos.** `Apartado` «Avisos» con una casilla por bandeja
    que el rol ve; `datos/acciones/avisos.ts` (`guardarMisAvisos`, en
    `SIN_CAPACIDAD` con su motivo, filtra por capacidad adentro). DESIGN.md
    §11 «Casilla» si no existe.
    Acepta: `pnpm --filter sitio exec tsx --test src/datos/acciones/acciones-con-sesion.test.ts` exit 0;
    apagar Contacto en Mi cuenta y mandar un contacto: el correo no sale para
    esa cuenta (consola del dev server). *(integration · medium)*
13. **La retención.** `datos/tareas/retencion-de-mensajes.ts`
    (`retencionDeContacto`, `retencionDeCV` con los archivos,
    `podaDeLimitesPorIp`, cada una con cuántos borró en el detalle) sumadas a
    `TAREAS_DIARIAS`. Test contra la base con un «hoy» fijo: borra lo vencido
    de cada caso, deja lo demás, el archivo de un CV se va con su fila y una
    corrida queda registrada.
    Acepta: `pnpm --filter sitio exec tsx --test src/datos/tareas/retencion-de-mensajes.test.ts`, exit 0.
    *(integration · high)*
14. **La documentación.** ADR-0012 (el SPEC §13, con el porqué del correo sin
    datos), README y `.env.example` (`CV_BLOB_READ_WRITE_TOKEN`,
    `CV_ABIERTO`, cómo crear el store privado y encender el CV), el spec del
    admin §5 y §7, AGENTS.md §3 (árbol de `datos/` y `config/`), y las filas
    del Inicio anotadas en PROGRESS si la 3c no llegó a `main`.
    Acepta: `node -e` que verifica que cada link relativo de los `.md`
    tocados apunta a un archivo que existe, exit 0. *(mechanical · low)*
