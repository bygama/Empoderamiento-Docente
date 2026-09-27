# SPEC — El cierre del mapa del admin

- **Fecha:** 2026-09-27
- **Estado:** aprobado por el padre el 2026-09-27, tal cual, con las siete
  propuestas (DECISIONS)
- **Decide:** el padre de `work/mapa-del-admin/` (Mateo le delegó la
  aprobación: DECISIONS del padre, 2026-09-26)
- **Tier:** L · la lane de cierre del XL `work/mapa-del-admin/` · worktree
  propio, rama `mateo/cierre-del-mapa`, dev server en el 3032, base `ed` (no
  migra)
- **Diseño:** el brief del padre, sobre el SPEC padre §9 y §11 y lo que su
  PROGRESS deja en «Abierto» (la mudanza del armazón, `pendientes.ts` sobre
  el tope, `linkDelDoi`, las dos portadas). Esto lo formaliza; no lo vuelve a
  decidir. Lo que el brief deja abierto y acá se propone está marcado
  **[P1]…[P7]**, y la lista entera está en §10.

---

## 1. Qué se quiere

Las once lanes de código del mapa del admin están en `main`. Dejaron cuatro
deudas anotadas para cuando no hubiera lanes en vuelo, porque tocan archivos
que todas compartían, y la documentación con el estado de antes. Esta lane
las paga. **No suma nada nuevo: el sitio y el admin se ven y se comportan
igual que antes**, y §8 dice cómo se prueba.

Seis entregas:

| # | Qué | Sección |
| --- | --- | --- |
| 1 | El armazón del admin que no sabe de ED se muda a `@ed/kit-admin`, y los tres puentes se borran | §3 |
| 2 | Los cuatro registros que pasan el tope de utilidades se parten por módulo | §4 |
| 3 | `linkDelDoi` codifica el DOI segmento por segmento | §5 |
| 4 | `admin/por-hacer/` se va entera | §6 |
| 5 | Las dos portadas sin uso se borran, con la prueba de que nada las usa | §6 |
| 6 | Los documentos del cierre | §7 |

## 2. Lo que hay hoy (medido en `910dabf5`)

- `admin/armazon/`: 52 archivos. El kit re-exporta `Boton`, `claseDeBoton` y
  `Aviso` desde tres puentes (`armazon/Boton.tsx`, `armazon/clases.ts` y el
  `Aviso` de `armazon/Campos.tsx`). **152 archivos** de la app importan de las
  piezas que se mudan, en **324 líneas**.
- Los registros, en líneas totales: `datos/actividad.ts` **285**,
  `admin/cuentas/actividad/modulos.ts` **120**, `admin/actividad/frase.ts`
  **114** y `datos/inicio/pendientes.ts` **110**. Los cuatro pasan el tope de
  100 de AGENTS.md §6.
- `lib/metadatos/doi.ts:31`: `linkDelDoi` arma `https://doi.org/${doi}` tal
  cual.
- `admin/por-hacer/guias.ts`: `GUIAS` es `{}` desde Equipo. La carpeta la
  usa solo la ruta `(protegido)/[modulo]/page.tsx`, y a esa ruta la chequea un
  test de `guarda.test.ts` («los módulos que todavía son una guía…»).
- `public/biblioteca/portadas/44-resignificacion-colectiva-lo-cuadratico.webp`
  y `57-juguemos-catan-explorando-desarrollo.webp`: ninguna fila de
  `materiales` las nombra en `portada` ni en `borrador` (consulta sobre `ed`:
  0). El único texto que las nombra es la migración `20260927030549_biblioteca`,
  que es historia y no se toca; la de Equipo las dejó nulas.

## 3. La mudanza del armazón al kit

### 3.1. La regla

Se muda al kit **cada pieza de `admin/armazon/` que no sabe nada de ED**: no
importa nada con `@/`, no conoce `datos/`, ni roles, ni módulos, ni textos de
ED. Lo que sabe de ED se queda, con su motivo en DECISIONS.

**[P1] Los íconos de la app no cuentan como saber de ED.** `Lista`, `Tabla`,
`Volver`, `AccionesDeLaFicha` y `CampoContrasena` importan `@/` solo para un
ícono del set de la app. Se mudan y usan los del kit, que ya trae los suyos
por esta misma razón (`packages/kit-admin/src/iconos.tsx`: «el set de la app
es de la app»): `ChevronDown` y `Check` ya están en el kit con los mismos
trazos (`ChevronAbajo`, `Check`); `ArrowLeft`, `ArrowUpRight`, `Eye` y
`EyeOff` se copian con sus trazos exactos (`FlechaIzquierda`,
`FlechaAfuera`, `Ojo`, `OjoTachado`). El SVG que sale es el mismo.

### 3.2. Qué se muda y qué se queda

| Pieza de `admin/armazon/` | Destino | Por qué |
| --- | --- | --- |
| `Lista` (con `Fila` y `Desplegable`), `Insignia`, `Encabezado`, `Volver`, `EstadoVacio`, `Confirmacion`, `Tabla` (con `SiONo`), `Paginado`, `Pestanas`, `Numero`, `ruta.ts` (con su test), `Filtro`, `Buscador`, `Cifra`, `Curva` y `curva/calculos.ts` (con su test) | kit | los candidatos del brief y lo que necesitan (`Volver` y `Numero`) |
| `BotonEnlace` (hoy en el puente `Boton.tsx`) | kit, junto al `Boton` | un link con cara de botón; lo usan `Paginado` y `SinPermiso` |
| `Apartado`, `Bloque`, `FilaDeAccion`, `IndiceDeTarjetas`, `VistaPreviaFrenada`, `AvisoDelEditor`, `ListaQueSeOrdena` con `useMoverEnOrden`, `useFrenarSalida`, `AccionesDeLaFicha`, `CampoContrasena` | kit | tampoco saben de ED; la regla es la pieza, no la lista de candidatos |
| `Campos.tsx`: `Campo`, el `Boton` ancho y `ENLACE_DE_ACCESO` | kit, **[P2]** como `CampoSimple`, `BotonDeAcceso` y `ENLACE_DE_ACCESO` | no saben de ED, pero `Boton` choca con el del kit y `Campo` con el generador de las páginas (`admin/campos/Campo.tsx`); las 7 pantallas que los usan ya cambian esa línea por el puente de `Aviso` |
| `BarraLateral` y `barra-lateral/` | se queda | los módulos de ED, sus consultas en `datos/`, el logo y los roles |
| `Guarda`, `guarda.test.ts` | se queda | lee la sesión de `datos/` y las capacidades de `@ed/auth` |
| `SinPermiso` | se queda | los roles de ED y sus textos («Tu rol es…») |
| `SalirDelAdmin` | se queda | llama a `admin/auth-cliente` y a una acción de `datos/` |
| `tema.ts` | se queda | la cookie `tema-del-admin` y los tres temas de ED, que define `globals.css` |
| `Pantalla` | se queda | la marca de ED: el logo, «Empoderamiento Docente», el haz del faro |
| `Momento` y `EncabezadoDeFicha` | se quedan | `Momento` importa `@/lib/contenido/tiempo`; el encabezado de la ficha lo usa |
| `ComoSeVe`, `ListaDeDiferencias`, `QueCambioPlegado` | se quedan | importan `@/lib/contenido/` (el buscador, `Diferencia`), que incuba en la app hasta que lo use un segundo proyecto (AGENTS.md §12); mudarlos arrastraría eso al kit |
| `useErroresDelEditor` | se queda | conoce el generador de formularios de las páginas (`@/admin/campos/errores`) |

Después de la mudanza, `admin/armazon/` tiene la barra lateral, la guarda,
«Sin permiso», salir, el tema, la pantalla de acceso, el momento y el
encabezado de la ficha, lo de «Qué cambió» y «Cómo se ve», y el hook de los
errores del editor.

### 3.3. Cómo

- Cada pieza se mueve con `git mv` a `packages/kit-admin/src/` (la curva, en
  `curva/`, como hoy) y sale por `src/index.ts`. Adentro del kit se importan
  entre ellas por ruta relativa, como hoy.
- **Los tres puentes se borran**: `armazon/Boton.tsx`, `armazon/clases.ts` y
  el `export { Aviso }` de `armazon/Campos.tsx` (que se va entero, §3.2). Cada
  archivo que los usaba importa de `@ed/kit-admin`.
- Las 324 líneas de import se reescriben a `@ed/kit-admin`; nada cambia de
  nombre salvo lo de [P2].
- El kit sigue sin `@/`, sin «novedad» ni ningún texto de ED adentro, y pasa
  su proyecto en react-doctor (100/100 sin diagnósticos), su typecheck y su
  lint. Los textos que se mudan son de interfaz genérica («Cancelar», «Más
  nuevas», «Borrar la búsqueda»), como los que el kit ya tiene.
- Los tests que se mudan (`ruta.test.ts`, `curva/calculos.test.ts`) los corre
  el `test` del kit, que `pnpm test` ya recorre.

### 3.4. Lo que se escribe

- **El README del kit:** la tabla de exports con lo nuevo, y los tokens que
  espera de la app, medidos sobre lo que se mudó (hoy nombra colores, tres
  tamaños de tipo y `font-display`; las piezas nuevas suman al menos
  `text-admin-titulo`).
- **ADR-0014:** una línea que dice que la mudanza se hizo, dónde y qué quedó
  en la app.
- **AGENTS.md §3:** el árbol (`packages/kit-admin/` y `admin/armazon/`).
- **DESIGN.md §11:** **[P3]** las rutas de las piezas que se mudan
  (`apps/sitio/src/admin/armazon/Lista.tsx` → `packages/kit-admin/src/Lista.tsx`,
  16 rutas) y la línea «Las piezas viven en `admin/armazon/`». Nada más de
  DESIGN.md se toca: es un cambio de ruta, no de patrón.

## 4. Los registros, por módulo

### 4.1. Qué se parte

`datos/actividad.ts` (285), `admin/cuentas/actividad/modulos.ts` (120),
`admin/actividad/frase.ts` (114) y `datos/inicio/pendientes.ts` (110). Cada
uno pasa a ser **una carpeta con un archivo por módulo y un `index.ts`** que
los compone y exporta la misma API pública de hoy. Como el índice es
`<carpeta>/index.ts`, **las rutas de import no cambian** (`@/datos/actividad`,
`./pendientes`, `@/admin/actividad/frase`, `./modulos`): ni las pantallas ni
los tests se tocan (probado: `tsx` resuelve la carpeta a su `index.ts`).

El módulo que venga suma su archivo y una línea en el índice, y no toca el de
otro.

### 4.2. **[P4]** Qué es un módulo acá

Los módulos del filtro de Cuentas › Actividad (`MODULOS_DE_ACTIVIDAD`:
acceso, mi cuenta, cuentas, contenido, novedades, biblioteca, mensajes,
métricas, ajustes), **con Contenido partido en sus entidades** (páginas,
casos, aliados, fotos, equipo). Son 13 para la actividad y 7 para los
pendientes (mensajes, páginas, novedades, biblioteca, fotos, aliados,
métricas).

Contenido no puede ser un archivo solo: el orden de `TIPOS_DE_ACTIVIDAD` sale
del orden en que el índice compone los módulos, y `frase.test.ts` fija el
orden que ve quien edita, con Novedades y la Biblioteca **entre** las páginas
y los casos. Un solo archivo de Contenido lo reordenaría, y el test cambiaría.
Con las entidades por separado, cada archivo es lo que sumó una lane, y el
orden queda igual.

La única diferencia de orden: los dos tipos del segundo factor (hoy entre
Mensajes y Cuentas) pasan a estar con los de Mi cuenta. No lo ve nadie —la
lista va a un `IN` de SQL— y ningún test lo fija (quien edita no los ve).

### 4.3. Cómo queda cada uno

- **`datos/actividad/`**: cada módulo dice, por tipo, quién lo ve y si va al
  Inicio, en una sola entrada (`{ quienVe, vaAlInicio }`), así un tipo nuevo
  no compila sin las dos cosas, como hoy. El índice arma
  `TIPOS_DE_ACTIVIDAD`, `TipoDeActividad`, `QUIEN_VE` y `VA_AL_INICIO`, y
  guarda `registrarActividad`, `tiposQueVe`, `tiposDelInicio`,
  `esTipoDeActividad` y el esquema de Zod.
- **`admin/actividad/frase/`**: cada módulo trae sus frases y las ayudas que
  solo usa él (`novedad`, `material`, `persona`…); lo que comparten dos
  (`contraer`, de casos y aliados) y el tipo `EventoParaLeer`, en un archivo
  común. El índice arma `FRASES` como `Record<TipoDeActividad, …>`, así un
  tipo sin frase no compila, como hoy, y exporta `fraseDe` y
  `EventoParaLeer`.
- **`admin/cuentas/actividad/modulos/`**: cada módulo dice el módulo del
  filtro de cada tipo y adónde lleva (lo que hoy es `pantallaDe`, repartido:
  la cuenta, la página, el caso, el perfil, el material). El índice exporta
  `MODULOS_DE_ACTIVIDAD`, `ModuloDeActividad`, `moduloDe`,
  `esModuloDeActividad` y `pantallaDe` con la firma de hoy.
- **`datos/inicio/pendientes/`**: cada módulo trae sus filas. El índice guarda
  `URGENCIAS`, `Urgencia`, `LoPendiente` y `Pendiente`, y arma `PENDIENTES` y
  `ClaveDePendiente` en el orden de hoy (a igual urgencia manda el orden del
  registro). `CLAVES_DE_PENDIENTES`, que nadie importa, sale del mismo objeto.

Cada archivo nuevo, índice incluido, queda **por debajo de 100 líneas**, y
las cuentas van a PROGRESS. **Nada cambia de comportamiento, y los tests de
hoy pasan sin tocarlos.**

## 5. `linkDelDoi`

Hoy arma `https://doi.org/${doi}` sin escapar: un DOI con `#` o `?` (la
sintaxis los permite en el sufijo) da un link que corta el DOI. Pasa a
codificar **cada segmento con `encodeURIComponent`, conservando las `/`**. Un
DOI normal (`10.1590/abc`) queda igual, así que el render no cambia. Un test
nuevo en `doi.test.ts` para `#`, `?`, `%` y espacios.

## 6. Lo que se borra

### 6.1. `admin/por-hacer/`

Se borran `admin/por-hacer/` (`guias.ts`, `GuiaDelModulo.tsx`), la ruta
`(protegido)/[modulo]/page.tsx` que la dibujaba, y el test de
`guarda.test.ts` que chequeaba esa ruta (el resto del archivo no cambia).

**[P5] Lo que cambia, medido.** Con sesión, `/admin/<algo>` de **un**
segmento hoy cae en `[modulo]`, que llama a `notFound()`: 404 con el título
«Admin ED» y el 404 por defecto de Next. `/admin/<algo>/<más>`, de dos, ya
cae hoy en `(sitio)/[...resto]`: 404 con «Página no encontrada» del sitio.
Sin la ruta, las dos caen en el 404 del sitio, con el mismo código. Sin
sesión no cambia nada (el proxy manda a entrar). Propuesta: aceptarlo, porque
hoy ya pasa con dos segmentos y no hay un 404 propio del admin que perder.
La otra opción, un `(protegido)/[...resto]` que llame a `notFound()`, sería
una ruta nueva.

### 6.2. Las dos portadas

`44-resignificacion-colectiva-lo-cuadratico.webp` y
`57-juguemos-catan-explorando-desarrollo.webp` se borran después de probar
que nada las usa: `grep` en `apps/sitio/src`, `scripts/` y `docs/` sin
resultados; la consulta sobre `materiales.portada` y `materiales.borrador`
en 0; y `comparar-render` idéntico. La migración de la Biblioteca las nombra
y no se toca: es historia, y la de Equipo las dejó nulas.

## 7. Los documentos del cierre

| Documento | Qué cambia |
| --- | --- |
| AGENTS.md §3 | el árbol: el kit con el armazón, `admin/armazon/` con lo que se queda, `datos/actividad/` y los registros como carpetas, sin `por-hacer/` |
| AGENTS.md §13 | las fases 2 y 3 del admin hechas, con una línea por módulo (Novedades, Biblioteca, Equipo, Casos, Aliados, Fotos, Páginas, Mensajes, Métricas, Cuentas, Ajustes) |
| Spec del admin §3 | «El kit, tal como quedó»: el armazón ya se mudó |
| Spec del admin §7 | la actividad se anota desde `datos/actividad/`, un archivo por módulo; lo demás de §7, contrastado con el código |
| Spec del admin §9 | la fase 3, hecha |
| Spec del admin §11 | lo que queda afuera después del XL (el SPEC padre §10) |
| `docs/AI_GUIDELINES.md` §2 | los ejemplos que nombran archivos que ya no existen (`lineas-accion/data.ts`, `quienes-somos/data/equipo.ts`) pasan a nombrar archivos que existen |
| README | lo que estas cuatro cosas toquen (hoy nombra el kit como «los controles de los formularios») |
| `packages/kit-admin/README.md`, ADR-0014, DESIGN.md §11 | §3.4 |

AGENTS.md y DESIGN.md son meta-docs (AGENTS.md §5.6): van nombrados acá, y
Mateo los revisa en el PR antes del merge (DECISIONS del padre, 2026-09-26).

## 8. Cómo se sabe que está

- **El gate entero**, con la salida en PROGRESS: `pnpm typecheck` en limpio
  (sin `next-env.d.ts` ni `.next`), `pnpm lint`,
  `node scripts/verificar-react-doctor.mjs` (100/100 sin diagnósticos en los
  cuatro proyectos) y `pnpm build`.
- **`pnpm test` cinco veces seguidas** con exit 0.
- **El sitio:** `scripts/comparar-render.mjs` contra un build de `main`: las
  12 páginas idénticas.
- **El admin, por HTML:** un build de `main` y uno de esta rama, con
  `next start` en dos puertos contra la misma base, y un script de paso (no se
  commitea) que recorre las pantallas del admin con la sesión de cada rol y
  compara el HTML sin los `<script>` ni el nonce. Mudar un archivo no cambia
  una clase ni una etiqueta: el HTML tiene que salir igual, pantalla por
  pantalla (salvo lo relativo al reloj, «hace 3 minutos», que se anota si
  aparece).
- **El admin, a ojo:** en el navegador de Orca, con cada rol, Inicio,
  Contenido, Novedades, Biblioteca, Mensajes, Métricas, Cuentas y Ajustes; los
  tres temas, y 390 de ancho en al menos dos.
- **[P6] Quien dirige:** la única cuenta que dirige en `ed` es la de Mateo, y
  la base admite una sola. Propuesta: el recorrido con ese rol va contra una
  copia de `ed` (`ed_cierre`, `pg_dump`), donde la dirección pasa a una cuenta
  de prueba con `nombrar-direccion`; `ed` no se toca, y la copia se borra al
  cerrar. Administra y edita, contra `ed`.
- Los topes: componentes ≤ 200 líneas y utilidades ≤ 100, contados en
  PROGRESS para todo archivo nuevo o movido.

## 9. Fuera de esta lane

- Los `scrub: true` de las coreografías del sitio (11 en 8 archivos): una
  lane propia, con verificación visual. Tampoco toques de pasada.
- El deploy (lane 0) y el recorrido en producción del SPEC padre §11.
- Todo lo del SPEC padre §10.
- Lo demás de «Abierto» del padre (el test de avisos, la foto duplicada, el
  CSS compartido, lo de ED y de la fase 4): no es de este brief.
- **[P7]** El armazón que se queda por importar `@/lib/contenido/`
  (`Momento`, «Qué cambió», «Cómo se ve») no se muda en esta lane: pasaría
  al kit código que AGENTS.md §12 deja incubando en `lib/` hasta que lo use
  un segundo proyecto.

## 10. Lo que se propone y espera el OK

| | Propuesta |
| --- | --- |
| **P1** | Los íconos del set de la app no cuentan como saber de ED: las piezas que solo importan un ícono se mudan con los del kit (mismos trazos) |
| **P2** | `Campos.tsx` se muda con dos nombres nuevos: `CampoSimple` y `BotonDeAcceso` (`ENLACE_DE_ACCESO` igual) |
| **P3** | DESIGN.md §11: solo las rutas de las piezas mudadas y la línea de dónde viven |
| **P4** | «Módulo» = los del filtro de Actividad, con Contenido partido por entidad: 13 archivos por registro de actividad, 7 de pendientes |
| **P5** | Sin `[modulo]`, `/admin/<algo>` de un segmento da el 404 del sitio, como hoy ya pasa con dos: se acepta |
| **P6** | Quien dirige se prueba en una copia de `ed` que se borra al cerrar |
| **P7** | Lo que importa `@/lib/contenido/` se queda en la app |
