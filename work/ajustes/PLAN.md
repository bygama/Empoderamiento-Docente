# PLAN — Ajustes

SPEC aprobado por el padre el 2026-09-26 (DECISIONS). Rama `mateo/ajustes`,
base `ed_ajustes`, dev server en el 3025. Cada paso es un commit, con su
aceptación corrida y anotada en PROGRESS.

## Restricciones (valen para cada paso)

- **El repo trabaja en español:** código, comentarios, docs y commits
  (Conventional según `docs/COMMITS.md`, atómicos, nunca `git add -A`). La UI
  en voseo rioplatense y lenguaje inclusivo, nunca «alumnos».
- **Permisos:** toda Server Action empieza por `auth.api.getSession` y chequea
  `puede(rol, "usarAjustes")` justo después; toda `page.tsx` de Ajustes lo
  chequea antes de leer; las consultas de `datos/` con datos de Ajustes
  reciben el rol y sin la capacidad no devuelven nada.
- **Migraciones:** `pnpm migrate --create-only`, el SQL que Prisma no escribe
  (datos iniciales, `CHECK`) comentado en el mismo archivo antes de la primera
  aplicación, y recién ahí `pnpm migrate`. Nunca `db push`, nunca editar una
  aplicada.
- **UI del admin:** DESIGN.md §11 entero; solo tokens, cuatro tamaños de tipo,
  un primario por pantalla, sin verde ni naranja fuera de su regla. Cada
  pantalla se prueba en los tres temas, a 390 de ancho y con teclado.
- **Topes:** componentes ≤ 200 líneas, utilidades ≤ 100 (AGENTS.md §6).
- **El repo es CRLF:** un reemplazo multilínea con un script normaliza antes.
- **Las cuatro fronteras:** `lib/` no importa nada de la app; `datos/` es la
  única puerta a la base; `app/` son rutas; `features/` y `components/`
  reciben props.

`T <archivo>` abajo es `pnpm --filter sitio exec tsx --test <archivo>` (desde
la raíz; los archivos, relativos a `apps/sitio/`), y sale 0.

## Pasos

1. **La tabla `datos_del_sitio` con los datos de hoy, y su lectura.** Modelo
   y migración (`CHECK (id = 1)` y el `INSERT` de los valores de hoy);
   `config/datos-del-sitio.ts` con el tipo `DatosDelSitio`, el esquema Zod
   `esquemaDeDatosDelSitio` y `DATOS_INICIALES`; `datos/consultas/sitio.ts`
   con `datosDelSitio(): Promise<DatosDelSitio>` (`cache`, respaldo sin base
   como `contenidoDe`). Tests del esquema y de la lectura.
   Aceptación: `pnpm migrate:status` al día; `T src/config/datos-del-sitio.test.ts`
   y `T src/datos/consultas/sitio.test.ts`; `pnpm typecheck`.
   *(integration · high)*
2. **Los formularios públicos validan contra los datos de la base.**
   `datos/formularios/contacto.ts` y `cv.ts` leen `datosDelSitio()` por
   pedido; `config/cv.ts` pasa de `CAMPOS_DEL_CV` a
   `camposDelCV(paises: readonly string[])`; el «escribinos a …» de
   `recibir.ts` sale del correo de la base.
   Aceptación: `T src/config/cv.test.ts`, `T src/datos/formularios/contacto.test.ts`,
   `T src/datos/formularios/cv.test.ts`; `pnpm typecheck`.
   *(integration · high)*
3. **El sitio muestra los datos de la base, por props.** El layout del sitio
   lee `datosDelSitio()` y se lo pasa al pie y al menú del celular; Contacto,
   `/sumate-al-equipo` y `/novedades` a sus features (`CanalDirecto`,
   `CamposContacto`, `RailTema`, el `mailto` del CV, los errores de envío,
   `FormularioCV`, `CierreNovedades`). `config/site.ts` queda con lo de la
   marca y sin el bloque de las personas de referencia.
   Aceptación: `git grep -nE "siteConfig\.(contacto|paises|redes|direccion)" -- apps/sitio/src`
   no encuentra nada (sale 1); `pnpm typecheck`; `pnpm lint`.
   *(integration · medium)*
4. **Los plazos en `plazos_de_retencion`, con su historial.** Modelo y
   migración (los tres de hoy, vigentes desde siempre);
   `config/privacidad.ts` con funciones puras que reciben
   `PlazosDeGuarda = { cv: Tramo[]; contacto: Tramo[]; spam: number }`
   —`tramosDe`, `seBorraEl(m, plazos)`, `bordesDeGuarda(tramos, hoy)` y el
   del spam— con la regla del menor; `datos/privacidad.ts` con
   `plazosDeGuarda(): Promise<PlazosDeGuarda>` (respaldo sin base) y
   `ponerPlazos(nuevos, quien)`.
   Aceptación: `T src/config/privacidad.test.ts` (alargar no toca lo viejo,
   acortar sí, el spam nunca pasa su bandeja); `pnpm migrate:status`;
   `pnpm typecheck`. *(judgment · high)*
5. **Todo lo que dice o aplica un plazo lo lee de la base.** Las tareas de
   retención, la ficha («Se borra el…»), el pendiente de los CV que se
   borran en 7 días, los estados vacíos de las bandejas y las líneas de
   privacidad de Contacto, del formulario de CV y de su confirmación
   consumen `plazosDeGuarda()`; salen `MESES_DE_GUARDA` y `DIAS_DE_SPAM`.
   Aceptación: `git grep -nE "MESES_DE_GUARDA|DIAS_DE_SPAM" -- apps/sitio/src`
   sale 1; `T src/datos/tareas/retencion-de-mensajes.test.ts` y
   `T src/datos/inicio/de-los-mensajes.test.ts`; `pnpm typecheck`.
   *(integration · high)*
6. **El registro de avisos.** `config/avisos.ts` (`AVISOS`, clave, cómo se
   nombra y capacidad, salidos de `BANDEJAS`; la lane 11 suma ahí el resumen
   semanal); `datos/avisos.ts` lo recorre y suma
   `avisosDeTodas(rol): Promise<AvisoConCuentas[]>` (vacío sin
   `usarAjustes`) y `ponerQuienRecibe(aviso, cuentaIds)`; Mi cuenta › Avisos
   dibuja el registro.
   Aceptación: `T src/datos/avisos.test.ts`; `pnpm typecheck`.
   *(integration · medium)*
7. **El sitemap.** `datos/consultas/rutas-del-sitio.ts` con
   `rutasDelSitio(): Promise<string[]>` (las siete del registro, las fichas
   de novedad, `/sumate-al-equipo` solo con `CV_ABIERTO=si`);
   `app/sitemap.ts`; la línea `Sitemap:` en `robots.ts`, fuera de los
   previews.
   Aceptación: `T src/datos/consultas/rutas-del-sitio.test.ts`;
   `pnpm typecheck`. *(integration · medium)*
8. **Las redirecciones a mano y el sitio que las sigue.** Migración de
   `a_mano`; `lib/seo/redirecciones.ts` con
   `validarRedireccion({ desde, hacia }, { rutas, existentes })` (relativa,
   reservadas, sin cadenas ni ciclos) y su test;
   `datos/consultas/redirecciones.ts` con `redireccionDe(ruta)` y
   `listarRedirecciones(rol)`; `datos/redirecciones.ts` con agregar y borrar;
   la ruta atrapa-todo contesta 308 antes del 404.
   Aceptación: `T src/lib/seo/redirecciones.test.ts` y
   `T src/datos/redirecciones.test.ts`; `pnpm migrate:status`;
   `pnpm typecheck`. *(judgment · high)*
9. **La indexación en Google, como tarea del cron.** Migración de
   `indexacion_de_urls`; `lib/busquedas/inspeccion.ts` (el cliente de la API
   de inspección, con el token de `token.ts`) y su test con una respuesta
   grabada; `datos/tareas/indexacion-de-google.ts` (hasta 20 por corrida, de
   a una, las más viejas primero, freno a los 35 s, borra las rutas que ya no
   están), registrada en `TAREAS_DIARIAS`; `leerIndexacion(rol)` en
   `datos/consultas/indexacion.ts`.
   Aceptación: `T src/lib/busquedas/inspeccion.test.ts` y
   `T src/datos/tareas/indexacion-de-google.test.ts`; `pnpm migrate:status`;
   `pnpm typecheck`. *(integration · medium)*
10. **El estado de las conexiones.** `datos/conexiones.ts`: el registro (las
    seis de SPEC §2.6, con sus variables y sus tareas) y
    `estadoDeLasConexiones(rol)`: configurada, las variables que faltan, la
    última corrida de cada tarea y la última correcta.
    Aceptación: `T src/datos/conexiones.test.ts`; `pnpm typecheck`.
    *(integration · low)*
11. **Los cinco tipos de actividad de Ajustes**, con `QUIEN_VE`,
    `VA_AL_INICIO` y su frase (SPEC §7).
    Aceptación: `T src/datos/actividad.test.ts`; `pnpm typecheck`.
    *(mechanical · low)*
12. **`Tabla` sube al armazón.** `admin/armazon/Tabla.tsx` (la caja, el
    `caption`, los encabezados de columna y de fila, el sí o no dibujado y
    dicho) y la tabla de permisos la consume; DESIGN.md §11 «Tabla» lo anota.
    Aceptación: `pnpm typecheck`; `pnpm lint`; la tabla de permisos de
    Cuentas se ve igual en el navegador. *(integration · medium)*
13. **El módulo Ajustes y su índice.** `ajustes/layout.tsx` con
    `<Guarda capacidad="usarAjustes">`; `/admin/ajustes` con las cinco
    tarjetas (`admin/ajustes/pantallas.ts`) y su estado real, leído aislado
    (`datos/consultas/ajustes.ts`, `resumenDeAjustes(rol)`); la guía de
    Ajustes sale de `admin/por-hacer/guias.ts`.
    Aceptación: `T src/admin/armazon/guarda.test.ts`; `pnpm typecheck`;
    `pnpm lint`. *(integration · medium)*
14. **Datos del sitio.** La pantalla (`Apartado`s, «Se ve en», modo navy y
    aviso al salir) y la acción `guardarDatosDelSitio` (esquema, fila,
    `revalidatePath("/(sitio)", "layout")`, actividad).
    Aceptación: `T src/datos/acciones/acciones-con-sesion.test.ts`;
    `pnpm typecheck`; `pnpm lint`; en el navegador, el correo nuevo en el pie
    y en Contacto sin reiniciar. *(integration · medium)*
15. **SEO.** La pantalla con sus tres apartados (las dos `Tabla`s y el
    sitemap) y las acciones `agregarRedireccion` y `borrarRedireccion` (con
    `Confirmacion`).
    Aceptación: `T src/datos/acciones/acciones-con-sesion.test.ts`;
    `pnpm typecheck`; `pnpm lint`; en el navegador, una redirección agregada
    se sigue con 308. *(integration · medium)*
16. **Avisos.** La pantalla, un apartado por aviso del registro, y la acción
    `guardarQuienRecibe`.
    Aceptación: `T src/datos/acciones/acciones-con-sesion.test.ts`;
    `pnpm typecheck`; `pnpm lint`. *(integration · medium)*
17. **Privacidad.** La pantalla y las acciones `cuantoSeBorraria` y
    `guardarPlazos`: acortar con algo que borrar pide `Confirmacion` con la
    cuenta; revalida `/contacto` y `/sumate-al-equipo`.
    Aceptación: `T src/datos/acciones/acciones-con-sesion.test.ts` y
    `T src/datos/privacidad.test.ts`; `pnpm typecheck`; `pnpm lint`.
    *(judgment · high)*
18. **Conexiones.** La pantalla, una fila por conexión con su estado y sus
    corridas.
    Aceptación: `pnpm typecheck`; `pnpm lint`. *(integration · low)*
19. **ADR-0015** (nació 0014; DECISIONS), que enmienda al 0012: los datos del sitio y los plazos en
    la base, y el plazo prometido como techo; el índice de `adrs/` lo anota.
    Aceptación: `git diff --stat HEAD~1 -- docs/architecture/adrs` muestra
    el ADR y el índice. *(judgment · medium)*
20. **AGENTS.md, el spec del admin y el README.** §5.3 y §3 de AGENTS.md;
    Ajustes, las tablas, la regla de los plazos y las personas de referencia
    para la fase 4 en el spec; Ajustes, el sitemap y la indexación en el
    README.
    Aceptación: `git grep -n "config/site.ts" -- AGENTS.md` ya no dice que
    los datos institucionales viven ahí. *(mechanical · low)*

Después del paso 20: work-verify (el gate entero, los tests, el recorrido en
el navegador y `next start` como edita) y el PR.
