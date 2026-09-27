# ADR-0014: Los controles del admin en `packages/kit-admin`, y cada entidad con lo publicado en columnas y el borrador en un documento

- **Status:** Accepted
- **Date:** 2026-09-26
- **Decision-makers:** el padre del XL `work/mapa-del-admin/` (Mateo le delegó
  las aprobaciones el 2026-09-26), diseñado en `work/novedades-y-kit/`
- **Related:** [ADR-0005](0005-admin-a-medida.md) (el admin a medida y la
  fase 2), [ADR-0006](0006-packages-reutilizables.md) (`packages/` con la
  reutilización como requisito), [ADR-0011](0011-search-console-y-un-solo-cron.md)
  (una migración nueva se completa con SQL de datos antes de aplicarse)

---

## Contexto

La fase 2 del [ADR-0005](0005-admin-a-medida.md) es «el kit y una entidad
entera»: `packages/kit-admin` nace contra Novedades, la primera tabla de
contenido que no es una página. Hasta acá el admin editaba solo páginas, cada
una un documento validado por los esquemas Zod de sus secciones, con su
formulario generado desde el esquema (AGENTS.md §12). Las entidades que
siguen —materiales, casos, equipo, aliados— escriben su formulario a mano, y
Novedades fija cómo.

Cuatro fuerzas:

1. **Lo reutilizable es un requisito** ([ADR-0006](0006-packages-reutilizables.md)).
   Los controles de `admin/campos/` ya reciben props planas y la subida de
   fotos por prop: se pensaron para mudarse. Lo que no puede mudarse es lo que
   sabe de ED.
2. **Un borrador puede estar incompleto.** Una novedad recién creada no tiene
   título ni foto, y guardarla igual es lo que se espera de un borrador.
3. **El sitio necesita garantías que da la base**: una URL por novedad, una
   sola destacada, un orden por fecha. Esas se escriben sobre columnas, no
   sobre claves de un documento.
4. **Nueve novedades ya existen** en `features/novedades/data/novedades.ts`,
   y el sitio no puede cambiar el día que pasan a la base.

## Decisión

### 1. `packages/kit-admin`: los controles, sin ED

`@ed/kit-admin` tiene los controles de un formulario del admin: `TextoCorto`,
`Parrafo`, `Seleccion`, `Casilla`, `Fecha`, `CampoFoto`, `ListaFija`,
`ListaVariable`, con `Contador`, `PieDelCampo`, `estadoDelLargo`, `ENTRADA`,
`Cambio` y `resolverCambio`; y `Boton`, `claseDeBoton` y `Aviso`, porque
`CampoFoto` los usa y un package no importa la app. Los tipos de una foto
(`Foco`, `ValorDeFoto`, `posicionDelFoco`) van en un subpath sin React,
`@ed/kit-admin/foto`, que `lib/contenido/fotos.ts` re-exporta: el sitio no
carga el kit y no hay dos definiciones.

- **La frontera:** el kit no sabe nada de ED. Ni «novedad», ni una ruta del
  sitio, ni un texto de ED, ni un `@/`: las etiquetas y las ayudas llegan por
  prop, y el tope de bytes de una foto también (`maximoBytes`), porque es
  política de la app. `next/image` sí: el kit es para apps de Next.
- **Los tokens son de la app.** El kit usa clases con nombre de token
  (`text-admin-meta`, `bg-azul-principal`, `text-rojo-error`, `font-display`,
  `dark:`…) y no define ninguno. Su `README.md` escribe el contrato: qué
  tokens tiene que definir la app que lo use, el `@source` de Tailwind v4 que
  escanea sus clases, y que los contrastes medidos de DESIGN.md §11 valen solo
  con los valores de esta app.
- **Se queda en la app** lo que es de ED o del generador de las páginas:
  `admin/campos/Campo.tsx` (el dibujante recursivo) y `errores.ts`, que
  importan los controles del kit; y `admin/armazon/`, que se muda al kit en un
  cambio mecánico aparte, cuando no haya lanes en vuelo. Hasta entonces,
  `armazon/Boton.tsx`, `armazon/clases.ts` y el `Aviso` de `armazon/Campos.tsx`
  re-exportan del kit con un comentario de una línea que dice que se van con
  esa mudanza.
  **Hecha el 2026-09-27**, al cerrar el mapa del admin: lo del armazón que no
  sabe de ED pasó al kit, los tres puentes se borraron, y en la app quedó lo
  que sí (la sidebar, la guarda, el tema, la pantalla de acceso y lo que
  depende de `lib/contenido/`).
- **Sin dependencias nuevas:** `react`, `react-dom` y `next` son
  `peerDependencies`; las herramientas, las del lockfile. El kit está en las
  dos listas del gate (AGENTS.md §5.8) y da 100/100 como los demás.

### 2. Una entidad: lo publicado en columnas, el borrador en un documento

**La fila tiene dos copias.** Lo publicado va en columnas tipadas, que es lo
que lee el sitio y sobre lo que la base garantiza; el borrador va en un
`jsonb`, que es lo que edita el admin y puede estar incompleto. Es el modelo
de `paginas` (publicado · borrador) con una diferencia: lo publicado no es un
documento sino columnas.

La tabla de Novedades, que es el molde de las que siguen:

| Columnas | Qué son |
| --- | --- |
| `id` (uuid) | la ficha del admin: `/admin/novedades/[id]` |
| `slug`, único | la URL publicada, `/novedades/<slug>` |
| el contenido: `titulo`, `bajada`, `fecha`, `categoria`, `imagen`, `cuerpo`, `destacada`, `publicacion`, `imagen_para_redes` | **lo publicado**, una columna por lo que tenía el archivo de datos (la regla de inventario del spec del admin §6); nulas solo mientras nunca se publicó |
| `publicada`, `publicada_en`, `publicada_por` | el sitio la muestra; la última publicación y quién, en llano |
| `borrador`, `borrador_en`, `borrador_por` | el documento que se edita (nulo es «el borrador es lo publicado»), el último guardado y la marca del aviso de choque |
| `creada_en`, `creada_por` | |

**Dos esquemas Zod con los mismos campos y los mismos topes**
(`features/novedades/contenido/novedad.ts`): `esquemaNovedad` es lo que el
sitio necesita, completo, y se valida al publicar y otra vez al leer;
`esquemaBorrador` deja todo vacío, y se valida al guardar. **Guardar nunca
frena por lo que falta, frena por lo que está mal**: un texto demasiado largo,
una fecha que no existe, una URL que ya usa otra. Lo que no necesita Zod (la
lista cerrada de categorías, los topes, el orden) vive aparte, en `modelo.ts`,
y llega a los componentes del navegador sin Zod.

**Los estados**, derivados de esas columnas:

| Estado | Qué es | Insignia |
| --- | --- | --- |
| Borrador | nunca se publicó, o se despublicó | fuerte, «Borrador» |
| Publicada | el sitio la muestra y no hay borrador | normal, «Publicada» |
| Publicada con cambios | el sitio la muestra y hay borrador | fuerte, «Cambios sin publicar» |

**Las acciones**, cada una una Server Action que empieza por la sesión y la
capacidad del módulo (`editarNovedades`), valida con Zod y escribe con un
cliente inyectado, para probarla contra el Postgres local:

- **Crear** no es una ruta: `/nueva` es la ficha vacía, y el primer guardado
  crea la fila (un `GET` que crea filas lo dispararía el prefetch de un link).
- **Guardar borrador** escribe `borrador`, `borrador_en` y `borrador_por` con
  el aviso de choque de las páginas: trae el `borrador_en` que vio la
  pantalla y, si otra persona guardó mientras tanto, no pisa. No revalida
  nada: el sitio no cambió.
- **Publicar** guarda antes lo que hay en pantalla, valida con
  `esquemaNovedad` y, en una transacción, copia a las columnas, deja
  `publicada` en verdadero y `borrador` en nulo. Revalida el sitio.
- **Despublicar** deja `publicada` en falso y **conserva las columnas**:
  volver a publicar es un clic y la URL sigue reservada.
- **Descartar cambios** vuelve a lo publicado (borra el borrador), con
  confirmación: sin esto, una publicada con un borrador que no se quiere queda
  trabada.
- **Borrar** se lleva la fila entera, con confirmación, y las redirecciones
  que apuntaban a ella.
- Publicar, despublicar, descartar y borrar se anotan en la actividad; crear y
  guardar, no.

**Lo que la base garantiza:**

- **Una URL por novedad**, con el índice único de `slug`; guardar avisa antes,
  en el campo, si otra ya la usa publicada o en su borrador. Mientras la
  novedad no se publicó, la URL sigue al título hasta que alguien la escribe;
  después, no se mueve sola. **Publicar con otra URL** escribe en la misma
  transacción el 308 de la vieja a la nueva en `redirecciones`, rehace las que
  apuntaban a la vieja (sin cadenas) y borra la que saliera de la nueva. El
  sitio busca la redirección antes del 404.
- **Una sola destacada**, con el índice parcial `novedades_una_sola_destacada`
  (escrito a mano en la migración: Prisma no escribe índices parciales).
  Publicar una destacada desmarca la anterior en la misma transacción, **en su
  columna y en su borrador** —si no, publicar un arreglo de la vieja le
  devolvería la tapa— y lo avisa. Despublicar la destacada la desmarca igual.

**La vista previa** es el Draft Mode de las páginas: cada novedad se ve como
quedaría al publicarla —las publicadas con su borrador, y las que no están en
el sitio solo si su borrador pasa `esquemaNovedad`—. **«Qué cambió»** compara
el formulario con lo publicado campo por campo, en vivo, con una comparación
escrita a mano: una entidad no se describe con el esquema de las páginas.

**El formulario de una entidad se escribe a mano** con los controles del kit
(AGENTS.md §12): ninguna entidad genera su formulario desde un esquema.

### 3. Lo que ya existía entra por la migración

La migración se crea con `--create-only` y lleva, en el mismo archivo y
comentados, el índice parcial y el **SQL de datos con las nueve novedades de
hoy**, publicadas y con `publicada_por` nulo («la carga inicial»), antes de su
primera aplicación ([ADR-0011](0011-search-console-y-un-solo-cron.md)). El
archivo de datos se borra en el mismo cambio: una sola fuente de verdad. Sin
base, el sitio compila y el listado muestra su estado vacío.

## Consecuencias

### Positivas

- **El sitio lee columnas**: ordena por fecha, filtra por categoría y arma el
  RSS con consultas simples, y la base garantiza la URL única y la destacada
  única aunque dos personas publiquen a la vez.
- **Un borrador puede empezar vacío** sin columnas nulas «por las dudas» ni
  valores de relleno, y lo publicado nunca queda a medias: pasa
  `esquemaNovedad` al publicar y otra vez al leer.
- **Materiales, casos y equipo copian el molde**: sus columnas, sus dos
  esquemas, las mismas seis acciones y la misma ficha (DESIGN.md §11, «Ficha
  de una entidad»).
- **El kit viaja**: otro proyecto con los mismos tokens lo usa sin tocarlo, y
  el contrato está escrito en su README.

### Negativas

- **Cada campo existe dos veces**: como columna y como clave del borrador.
  Sumar un campo es tocar el esquema de Prisma, la migración, los dos esquemas
  Zod, `columnasDe`, el formulario y «Qué cambió».
- **El borrador no tiene la garantía de la base**: una URL repetida en dos
  borradores la frena el aviso al guardar, no el índice, y la destacada de un
  borrador es solo una intención hasta publicar.
- **Los re-exports del armazón** son un puente que alguien tiene que borrar.

### Mitigaciones

- `columnasDe` y `publicadoDe` son el único lugar que traduce entre el
  documento y las columnas, con tests contra la base (publicar, despublicar,
  cambiar la URL, la destacada); `cambios.ts` tiene el suyo.
- Publicar vuelve a validar todo dentro de la transacción, y la base frena lo
  que se escape: el índice único y el parcial.
- Cada re-export lleva el comentario «se va con la mudanza de armazon al kit»,
  para que nadie le sume cosas.

## Alternativas consideradas

### Alternativa A: todo en un documento, como las páginas

- Qué hubiera implicado: una columna `publicado` `jsonb` al lado de
  `borrador`.
- Por qué se descarta: el sitio no podría ordenar ni filtrar en la base, y ni
  la URL única ni la destacada única se pueden garantizar sobre una clave de
  un documento sin triggers.

### Alternativa B: todo en columnas, con el borrador en una fila aparte

- Qué hubiera implicado: una segunda fila (o una tabla `novedades_borradores`)
  con las mismas columnas.
- Por qué se descarta: el borrador necesita columnas nulas que la publicada no
  debería tener, los índices únicos chocarían entre la fila publicada y su
  borrador, y cada consulta del sitio tendría que excluir borradores.

### Alternativa C: el formulario generado desde el esquema, como las páginas

- Qué hubiera implicado: describir la novedad con los tipos de campo de
  `lib/contenido/campos.ts`.
- Por qué se descarta: es el camino hacia Payload que AGENTS.md §12 cierra; la
  excepción es solo para las páginas.

### Alternativa D: el kit con el armazón adentro desde ya

- Qué hubiera implicado: mudar `admin/armazon/` entero en este cambio.
- Por qué se descarta: varias lanes en vuelo importan del armazón; mudarlo
  ahora las rompía a todas. Va en un cambio mecánico aparte, y hasta entonces
  el kit se lleva solo las tres piezas que `CampoFoto` necesita.

## Referencias

- `work/novedades-y-kit/SPEC.md` §3 a §5 y `DECISIONS.md` (las aprobaciones
  A a F).
- Spec del admin: `docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`
  §3, §6 y §9.
- `packages/kit-admin/README.md` (el contrato de tokens).
- DESIGN.md §11: «Fecha», «Selección», «Lista variable» y «Ficha de una
  entidad».
