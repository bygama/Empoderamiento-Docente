# SPEC — El Inicio del admin

- **Fecha:** 2026-09-26
- **Estado:** aprobado por el padre el 2026-09-26, con un cambio: «quién ve
  cada tipo de actividad» vive en `datos/actividad.ts` (§2.4, §3, §4 y
  DECISIONS)
- **Decide:** el padre de `work/mapa-del-admin/` (Mateo le delegó la
  aprobación: DECISIONS del padre, 2026-09-26)
- **Tier:** M · lane 3c del XL `work/mapa-del-admin/` · worktree propio, rama
  `mateo/inicio`, dev server en el 3018, base `ed` (sin migración)
- **Diseño:** el brief del padre (lane 3c), sobre el SPEC padre §5.2 y §6 y
  sus DECISIONS («lo que un módulo le suma al Inicio lo suma el que se mergea
  segundo»). Esto lo formaliza; no lo vuelve a decidir.
- **En paralelo:** 3b `cuentas` (Cuentas › Actividad, a donde lleva «Ver toda
  la actividad») y 7 `mensajes` (CV y mensajes, las primeras filas que otro
  módulo le suma al Inicio).

---

## 1. Qué se quiere

La primera pantalla del admin responde **«¿qué tengo que hacer?»** y **«¿cómo
va el sitio?»** de un vistazo. Hoy es el panel de métricas y un link a
Páginas, sin jerarquía ni orden de lectura. Es la pantalla que Daniela,
Raquel y Gastón ven cada vez que entran.

Y lo que la hace escalar: **cada módulo que llega le suma al Inicio su fila,
su número o su acceso sin tocar sus pantallas**. El Inicio lee registros;
los módulos los llenan.

## 2. La pantalla

Orden de lectura, de arriba abajo en el celular y en dos columnas desde `lg`
(lo que hacer a la izquierda, cómo va a la derecha, las dos arriba del
pliegue):

```
┌──────────────────────────────────────────────────────────────────────┐
│ Hola, Daniela                                  [Nueva novedad]*       │
│ Desde tu última visita, el 23/9 a las 10:40: se publicó Inicio.       │
├──────────────────────────────────────────────────────────────────────┤
│ Pendientes                               │ Esta semana   Ver métricas │
│ ┌──────────────────────────────────────┐ │ ┌──────────┐ ┌──────────┐  │
│ │ 2 páginas con cambios sin publicar   │ │ │Visitantes│ │Clics des-│  │
│ │ Inicio y Qué hacemos  [Ir a Páginas] │ │ │ 1.204    │ │de Google │  │
│ ├──────────────────────────────────────┤ │ │+12 % …   │ │ 87  −3 % │  │
│ │ Conectá Search Console               │ │ └──────────┘ └──────────┘  │
│ │ Para saber qué busca…[Ver los pasos] │ │ ┌──────────┐ ┌──────────┐  │
│ └──────────────────────────────────────┘ │ │CV recibi-│ │Materiales│  │
│                                          │ │dos  —    │ │  —       │  │
│ Actividad reciente   Ver toda la activ.  │ │Todavía no│ │Todavía no│  │
│ ┌──────────────────────────────────────┐ │ └──────────┘ └──────────┘  │
│ │ Raquel Ayala entró       hace 2 horas│ │ Los últimos 7 días con     │
│ │ …  (hasta 8)                         │ │ datos, contra los 7 antes. │
│ └──────────────────────────────────────┘ │                            │
└──────────────────────────────────────────────────────────────────────┘
  * los accesos rápidos aparecen cuando su módulo existe: hoy, ninguno
```

La dirección visual fina (proporciones, ritmo, cómo pesa cada bloque) se
decide al implementar con `frontend-design`, dentro de DESIGN.md §11: cuatro
tamaños de tipo, solo tokens, sin verde ni naranja, contrastes medidos.
**Sin primario:** nada es «la» acción del Inicio; las acciones de las filas
son secundarias, como en «Sin permiso» y Mi cuenta.

### 2.1. Saludo y «desde tu última visita»

- El `h1`, «Hola, Daniela» (el primer nombre de la cuenta), en el
  `Encabezado` de siempre. El título de la pestaña sigue «Inicio · Admin ED».
- El detalle: **qué pasó desde tu última visita**, en una frase: «Desde tu
  última visita, el 23/9 a las 10:40: se publicó Inicio.» Varias cosas van
  separadas por punto y coma («se publicaron Inicio y Qué hacemos; llegaron 3
  mensajes»). Sin nada nuevo: «Nada nuevo desde tu última visita, el 23/9 a
  las 10:40.» Sin visita anterior: «Desde la próxima vez que entres, acá vas a
  ver lo que cambió mientras no estabas.»
- **La última visita es la vez anterior que entraste:** la `actividad`
  «entro» más reciente de tu cuenta **anterior al comienzo de esta sesión**
  (`session.createdAt`). Es lo que es verdad: la fila de «entro» se escribe
  después de crear la sesión, así que la de ahora queda afuera sin márgenes,
  y la tabla guarda 12 meses. Las sesiones de better-auth no sirven: la fila
  se borra al salir, al vencer y con «Cerrar las demás».
- **Hoy, lo único que se publica son páginas:** las que tienen `publicadoEn`
  posterior a la última visita, por el nombre del registro de páginas. Los CV
  y los mensajes nuevos los suma Mensajes (lane 7) al registro (§3).
- Las fechas van con `Momento` (en la zona de quien mira).

### 2.2. Pendientes

- **Solo las filas con algo pendiente**, en orden de urgencia; cada una dice
  qué pasa, el detalle, y lleva a la pantalla que lo resuelve. Consume `Lista`
  y `Fila`: lo principal, el detalle y la acción, un link con cara de
  secundario y el nombre de la fila para el lector.
- **Sin pendientes:** «Todo al día», con el `EstadoVacio` de siempre («Nada
  espera por vos. Cuando algo necesite tu atención, aparece acá.»).
- **Las filas de hoy:**

| Clave | Urgencia | Quién la ve | Qué dice | Lleva a |
| --- | --- | --- | --- | --- |
| `paginas-sin-publicar` | `sin-publicar` | `editarContenido` (los tres) | «2 páginas con cambios sin publicar» · «Inicio y Qué hacemos» | «Ir a Páginas», `/admin/contenido/paginas` |
| `conectar-search-console` | `sin-conectar` | `configurarConexiones` (D A) | «Conectá Search Console» · «Para ver qué busca la gente en Google.» | «Ver los pasos», `/admin/metricas/busquedas` |

  «Páginas sin publicar» lee `paginas.borradorEn` con una consulta propia de
  esta lane, sin tocar las de la 4a. «Conectado» es lo mismo que dice
  Búsquedas (`hayVariablesDeBusquedas`).
- **Una fila que falla no tumba el Inicio:** queda como «No se pudo revisar
  las páginas», con su acción, y el error va al log. Sin eso, una consulta
  rota diría «Todo al día», que es mentira.

### 2.3. Esta semana

- Cuatro números, cada uno contra los 7 días anteriores, con el patrón nuevo
  **Número** (§5): la etiqueta, el número y la comparación («+12 % contra la
  semana anterior», «Igual que la semana anterior», «Sin datos previos»).
- **Lo que todavía no existe o no tiene datos muestra «—» con «Todavía no hay
  datos»**, nunca un cero inventado. Un cero es un cero solo si la fuente
  existe y contó cero.

| Clave | Etiqueta | Quién la ve | De dónde sale hoy |
| --- | --- | --- | --- |
| `visitantes` | Visitantes | `verMetricas` | la ventana de 7 días de `metricas_ventanas`, la misma de Métricas › Resumen |
| `clics-de-google` | Clics desde Google | `verMetricas` | `busquedas_diarias` (total), los 7 días que terminan en el último copiado |
| `cv-recibidos` | CV recibidos | `verCV` (D A) | todavía nada: «—». Lo conecta Mensajes (lane 7) |
| `materiales-consultados` | Materiales consultados | `verMetricas` | todavía nada: «—». Lo conecta la lane 11 (los contadores de Acciones) |

- Una línea debajo dice el período una sola vez: «Los últimos 7 días con
  datos, contra los 7 anteriores. Google llega con 2 o 3 días de atraso.» Y
  «Ver métricas» (terciario) lleva a `/admin/metricas`.

### 2.4. Actividad reciente

- **Los últimos 8 eventos que tu rol puede ver**, de la tabla `actividad`:
  «Raquel Ayala entró», con cuándo en relativo («hace 2 horas»). Consume
  `Lista` y `Fila`.
- **Quién ve cada tipo** es un dato: `Record<TipoDeActividad, Capacidad>`, en
  `datos/actividad.ts` al lado de los tipos, porque Cuentas › Actividad (3b)
  usa la misma regla. Los cuatro tipos de hoy (`entro`, `salio`, `cambio-su-contrasena`,
  `cambio-su-nombre`) son de las cuentas: los ve `usarCuentas` (D A), como
  Cuentas › Actividad. Quien edita, hasta que un módulo registre algo de
  contenido, ve el vacío: «Todavía no hay actividad para mostrarte» · «Acá van
  a aparecer las publicaciones y los cambios del contenido.»
- **Cómo se lee cada tipo** también es un `Record<TipoDeActividad, …>`: un
  tipo nuevo no compila hasta decir quién lo ve y cómo se lee. Es lo que
  obliga al que se mergea segundo (3b, 4a) a sumarlo.
- «Ver toda la actividad» (terciario, solo `usarCuentas`) lleva a
  `/admin/cuentas/actividad`, de la 3b (ver §7, pregunta 1).

### 2.5. Accesos rápidos

- «Nueva novedad» y «Agregar material» **no existen hoy**: el lugar queda en
  el registro, no en la pantalla. `Modulo` (en `modulos.ts`) suma un campo
  opcional `accesoRapido: { etiqueta, href }`; el Inicio muestra, como
  botones secundarios en las acciones del encabezado, los de los módulos que
  tu rol puede usar. Hoy ningún módulo lo tiene y no se dibuja nada. Novedades
  (lane 6) y Biblioteca (lane 8) lo suman en su línea.

### 2.6. Lo que sale del Inicio

- `PanelMetricas` deja el Inicio: sigue en Métricas › Resumen, que ya lo usa.
  El comentario de `metricas/page.tsx` que decía «el Inicio lo sigue
  mostrando» se va.
- El link a Páginas también: su lugar lo toman los pendientes.

## 3. Los registros

Cada bloque del Inicio lee un registro; cada módulo que llega suma su entrada
ahí y no toca las pantallas del Inicio. Viven en `datos/inicio/` (lo que lee
el Inicio, al lado de `datos/tareas/`, que es el registro del cron), salvo
quién ve cada tipo de actividad, que va con los tipos, y comparten la forma: una **clave de un tipo cerrado**, la **capacidad** que
hace falta para verla, y una **consulta** por entrada.

| Registro | Archivo | Una entrada es | Hoy |
| --- | --- | --- | --- |
| Pendientes | `datos/inicio/pendientes.ts` | clave, urgencia, capacidad, qué revisa (para el fallo), href, acción, `leer(): Promise<{ titulo, detalle? } \| null>` | páginas sin publicar, Search Console |
| Esta semana | `datos/inicio/esta-semana.ts` | clave, etiqueta, capacidad, `leer(): Promise<{ valor, variacion } \| null>` | visitantes, clics; CV y materiales con `leer` que devuelve `null` hasta que llegue su módulo |
| Lo nuevo | `datos/inicio/desde-tu-visita.ts` | clave, capacidad, qué revisa, `leer(desde: Date): Promise<string \| null>` (una frase) | páginas publicadas |
| Quién ve la actividad | `datos/actividad.ts` (lo consume `datos/inicio/actividad-reciente.ts`) | `Record<TipoDeActividad, Capacidad>` | los cuatro tipos, `usarCuentas` |
| Accesos rápidos | `admin/armazon/barra-lateral/modulos.ts` | `accesoRapido?` en el módulo, con la capacidad del módulo | ninguno |

- **La urgencia es un dato con nombre**, una escala cerrada en el orden del
  SPEC padre §5.2, entera desde hoy (como `PUEDE`: la política en un solo
  lugar, para que cada módulo se ubique sin editarla):
  `alguien-espera` (CV nuevos, mensajes sin leer) · `se-borra-pronto` (CV que
  se borran en 7 días) · `sin-publicar` (páginas, novedades en borrador hace
  más de 7 días) · `a-corregir` (links rotos, fotos sin texto alternativo) ·
  `sin-autorizar` (aliados) · `sin-conectar` (Search Console). Cada nivel sin
  fila todavía dice qué lane la trae. A igual urgencia, el orden del registro.
- **El filtro por capacidad pasa en el servidor**, antes de consultar: a quien
  edita no se le corre la consulta de una fila que no puede ver (CV, ajustes,
  Search Console).
- **Aislada:** una entrada que tira no frena a las otras (el mismo principio
  que el corredor de tareas): la fila dice que no se pudo revisar, el número
  dice «No se pudo leer», la frase dice «no se pudo revisar …».
- Las claves son uniones cerradas (`as const`) y cada registro es un
  `Record<Clave, …>`: una clave sin entrada, o una entrada sin clave, no
  compila.
- **La frase de cada tipo de actividad** vive en `admin/actividad/frase.ts`,
  para que Cuentas › Actividad (3b) la reúse en vez de escribir otra.
- **`app/` es ruta y nada más:** `(protegido)/page.tsx` pide la sesión, llama
  a `inicioPara(sesion)` de `datos/inicio/` (todo en paralelo) y le pasa las
  props a `admin/inicio/Inicio.tsx`. Las fechas viajan como ISO.

## 4. Lo que se reúsa y lo que se toca afuera

- **`Tarjeta` pasa a ser un patrón:** `admin/metricas/Tarjeta.tsx` →
  `admin/armazon/Numero.tsx`. El Inicio es su segundo consumidor, y la regla
  del SPEC padre §9 es que lo que se repite entre módulos vive en
  `admin/armazon/`. Suma el estado sin datos («—» con «Todavía no hay datos»,
  y «Sin datos» para el lector) y de qué período es la comparación (por
  defecto «el período anterior», como hoy). `PanelMetricas` y `ConDatos`
  pasan a importarlo de ahí, sin cambio visible.
- **`datos/consultas/metricas.ts`:** la ventana de un largo (`tarjetaDe(dias)`)
  sale de `tarjetas()` y se exporta; `tarjetas()` la usa. El Inicio lee la de
  7 días con la misma función.
- **`datos/consultas/busquedas.ts`:** se exporta el total de un rango
  (`totalDeBusquedas(desde, hasta)`, hoy `agregados("total", …)` privada).
- **`modulos.ts`:** el campo `accesoRapido?` (§2.5).
- **`datos/actividad.ts`:** suma `QUIEN_VE: Record<TipoDeActividad,
  Capacidad>` al lado de los tipos (cambio del padre). 3b y 4a le suman tipos:
  el `Record` los obliga a decir quién los ve, y el que se mergee segundo
  concilia.
- **Sin tocar:** lo de la 4a (`admin/paginas/`,
  `admin/campos/`, `contenido/`, `features/`, `lib/contenido/`,
  `datos/**/paginas*`, `prisma/schema/paginas.prisma`: el registro de páginas
  se importa, no se toca), `admin/cuentas/` y `admin/mensajes/`.
- **Sin tabla nueva, sin migración, sin dependencias.**

## 5. DESIGN.md §11

Cambios nombrados acá porque AGENTS.md §5.6 los pide con confirmación (los
revisa Mateo en el PR):

- **Número** (patrón nuevo, `admin/armazon/Numero.tsx`): la etiqueta en meta
  `gris-texto` (4,83:1 · 7,08:1 en el oscuro), el número en
  `text-admin-titulo` Manrope 700 `azul-principal` (13,63:1 · 13,59:1), la
  comparación en meta `gris-texto`. Caja `rounded-xl`, borde `azul-claro`
  decorativo. **Sin color en la comparación:** ni verde ni rojo (subir no
  siempre es mejorar, y el rojo es solo error). Sin datos, «—» y «Todavía no
  hay datos». Primer consumidor: Métricas; lo usan el Inicio y Búsquedas.
- **El Inicio** (composición nueva): el orden de lectura de §2, las dos
  columnas desde `lg`, sin primario, los accesos rápidos en el encabezado, y
  que cada bloque consume `Lista`, `EstadoVacio` y `Número`.
- Las líneas de consumidores de `Lista` y `Estado vacío` suman el Inicio.
- Si la dirección visual pide algo que `Fila` o `Encabezado` no tienen, se
  extiende en su archivo y en §11, con sus contrastes, en este PR.

## 6. AGENTS.md y lo demás

- **AGENTS.md §3**, el árbol: `datos/inicio/` (lo que lee el Inicio: los
  registros) y `admin/inicio/`, `admin/actividad/`. **§12**, una regla: lo
  que un módulo le suma al Inicio (una fila de pendientes, un número de la
  semana, lo nuevo desde tu visita) se registra en `datos/inicio/`, quién ve
  un tipo de actividad en `datos/actividad.ts`, y su acceso rápido en
  `modulos.ts`; nunca se toca la pantalla del Inicio.
- **README:** las dos menciones de «la portada del admin con las métricas»
  pasan a Métricas.
- El ADR-0009 no se toca: es la decisión de su día.

## 7. Preguntas al padre

1. **«Ver toda la actividad»** lleva a `/admin/cuentas/actividad`, que
   construye la 3b en paralelo. Si esta lane se mergea antes, el link da 404
   hasta que llegue la 3b. **Recomiendo** la regla de DECISIONS: lo pongo si
   al rebasear la 3b ya está en `main`; si no, lo suma la 3b con su pantalla.
2. **La frase de cada tipo de actividad** (`admin/actividad/frase.ts`) y
   **quién ve cada tipo** nacen acá. Si la 3b los necesita para Cuentas ›
   Actividad, ¿se lo avisás para que los reúse (y el que se mergee segundo
   concilie)?

**Respuestas (padre, 2026-09-26):** 1, como se recomienda. 2, sí, se lo
avisa; y «quién ve cada tipo» va a `datos/actividad.ts`, no a
`datos/inicio/`.

## 8. Lecturas que tomé (para aprobar en bloque)

1. La última visita es la «entro» anterior al comienzo de esta sesión (§2.1),
   no las sesiones de better-auth.
2. «Lo publicado» incluye lo que publicaste vos: la frase dice qué, no quién.
3. «Visitas» se muestra como **Visitantes**: es el mismo número y la misma
   etiqueta que Métricas › Resumen; un tercer nombre para uno de sus dos
   números confundiría.
4. «Esta semana» son los últimos 7 días con datos de cada fuente contra los 7
   anteriores, no la semana de calendario; el atraso de Google se dice una
   vez.
5. Los eventos de sesión son de cuentas (`usarCuentas`): hoy quien edita ve el
   vacío en Actividad reciente.
6. La escala de urgencia entera, con nombres, desde hoy (§3).
7. «Todo al día» es un `EstadoVacio`, no un aviso de confirmación: no responde
   a algo que hiciste.
8. Sin primario en el Inicio.
9. Para ver la pantalla con datos, una base propia **solo de demo**,
   `ed_inicio` (con `migrate:deploy` de las migraciones que ya existen, sin
   ninguna nueva), así no quedan filas de prueba en la `ed` compartida. Los
   tests corren contra la base del `.env.local`, como siempre.

## 9. Criterio de cierre

- El Inicio muestra, con datos sembrados en `ed_inicio`: el saludo con lo
  nuevo desde la última visita; los pendientes en orden y filtrados por rol
  (probado con una cuenta que administra y una que edita); «Todo al día» sin
  pendientes; los cuatro números con «—» donde no hay datos; la actividad
  visible por rol; y nada del panel de métricas.
- Tests: el orden por urgencia, el filtro por capacidad, la fila que falla
  aislada, la última visita contra la base, y quién ve cada tipo.
- Tres temas, 390 de ancho, foco con teclado; contrastes escritos en §11.
- El gate entero: `pnpm typecheck`, `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100), `pnpm test`,
  `pnpm build`.
- Componentes ≤ 200 líneas, utilidades ≤ 100.
