# PLAN — Métricas completas

SPEC aprobado por el padre el 2026-09-27 con las siete recomendaciones de §12
(DECISIONS). Cada paso es un commit (o un par chico, si el código y su
registro en §11 van aparte), con su aceptación corrida y anotada en PROGRESS.
Los comandos corren desde la raíz del worktree; `sitio` es
`pnpm --filter sitio`.

## Lo que vale en todos los pasos

- **Nada de la persona:** ni IP (solo su HMAC en `limites_por_ip`), ni
  `User-Agent`, ni el hostname del referido, ni nada en el navegador (cookie,
  `localStorage`, `sessionStorage`). Los contadores son sumas por día.
- **Las cuatro fronteras:** `datos/` es la única puerta a la base; `lib/` no
  sabe de ED ni importa `@/`; `app/` solo delega; `features/` recibe props.
  Toda Server Action empieza por `auth.api.getSession` y `puede(rol,
  "verMetricas")`; toda `page.tsx` de Métricas chequea `verMetricas` antes de
  leer.
- **Lo de ED, en `config/metricas.ts`:** los países fijos, `ZONA_HORARIA =
  "America/Santiago"` (una sola constante; la pantalla dice «hora de Chile»),
  los eventos, los canales de un link y los mínimos de «poco tráfico».
- **UI:** DESIGN.md §11 manda (`designing-consistently`, `frontend-design`);
  solo tokens, cuatro tamaños de tipo, un primario por pantalla, contrastes
  medidos. Componentes ≤ 200 líneas, utilidades ≤ 100. Copy en voseo e
  inclusivo, nunca «alumnos».
- **El repo es CRLF**; nada de `git add -A`; Conventional en español.

## Pasos

1. **Las tablas `contadores`, `enlaces` y `marcas`** en
   `prisma/schema/metricas.prisma` (columnas del SPEC §4.2), con su migración
   generada (`pnpm migrate --name contadores_enlaces_y_marcas`).
   Acepta: `pnpm migrate:status` dice al día y `sitio typecheck` sale 0.
   *(integration · high)*

2. **Lo de ED y los canales:** `config/metricas.ts` (países fijos,
   `ZONA_HORARIA`, `EVENTOS` con su nombre, `CANALES_DE_ENLACE`, `MINIMOS`),
   `lib/metricas/canales.ts` (`CANALES` en su orden y `canalDe(host, propio):
   Canal | null`, con la lista de dominios en un solo lugar) y
   `lib/metricas/robots.ts` (`esRobot(ua)`), con sus tests.
   Acepta: `sitio exec tsx --test src/lib/metricas/canales.test.ts
   src/lib/metricas/robots.test.ts` sale 0. *(judgment · medium)*

3. **La copia de Vercel crece** (SPEC §4.1): `lib/metricas/vercel.ts` y
   `tipos.ts` aprenden `sistema`, `navegador`, `campana`, `hora` y un
   `filtro`; `periodos.ts` suma la ventana de 90; `sincronizarMetricas` copia
   las dimensiones nuevas y `pagina-cl|mx|ar|otros` con `PAISES_FIJOS`, y
   `total` sigue última. Tests con respuestas grabadas.
   Acepta: `sitio exec tsx --test src/lib/metricas/vercel.test.ts
   src/lib/metricas/periodos.test.ts src/datos/tareas/metricas-de-vercel.test.ts`
   sale 0. *(integration · high)*

4. **Los cuatro tipos de actividad de Métricas** (`creo-un-enlace`,
   `borro-un-enlace`, `agrego-una-marca`, `borro-una-marca`) en
   `datos/actividad.ts`, su frase en `admin/actividad/frase.ts` y el módulo
   «Métricas» en `admin/cuentas/actividad/modulos.ts`.
   Acepta: `sitio exec tsx --test src/admin/actividad/frase.test.ts
   src/datos/actividad.test.ts src/admin/cuentas/actividad/filtros.test.ts` y
   `sitio typecheck` salen 0. *(mechanical · low)*

5. **La puerta de los contadores:** `datos/contadores.ts` con
   `sumarContador({ evento, canal, clave, fecha? })` (un `INSERT … ON CONFLICT
   DO UPDATE`, atómico) y `sumasDe({ eventos, desde, hasta })` (sumas por
   evento, canal y clave), con su test contra la base (diez a la vez cuentan
   diez). Acepta: `sitio exec tsx --test src/datos/contadores.test.ts` sale 0
   con `DATABASE_URL` en `ed_metricas`. *(integration · medium)*

6. **Los links y `/l/[codigo]`:** `datos/enlaces.ts` (`codigoPara(nombre,
   existe)`, `crearEnlace`, `borrarEnlace`, `enlacePorCodigo`) y
   `datos/enlaces/abrir.ts` (`abrirEnlace(pedido, codigo)`: 404, o 307 con
   `no-store` y los UTM, y cuenta `enlace-clic` con `sumarContador` salvo
   robots, `HEAD` o pasado el tope de `sumarEnvio`);
   `app/l/[codigo]/route.ts` solo delega; `/l/[codigo]` en `config/rutas.ts`.
   Acepta: `sitio exec tsx --test src/datos/enlaces.test.ts
   src/datos/enlaces/abrir.test.ts src/config/rutas.test.ts` sale 0.
   *(integration · high)*

7. **`POST /api/contar`:** `datos/contadores/recibir.ts`
   (`recibirEvento(pedido)`: Zod, la lista pública sin `enlace-clic`, el
   canal con `canalDe`, el link con `enlacePorCodigo`, el material con
   `materialExiste` —falso hasta la 8a—, el tope de 60 por hora con
   `sumarEnvio` y siempre `204 no-store`); `app/api/contar/route.ts` solo
   delega. Acepta: `sitio exec tsx --test
   src/datos/contadores/recibir.test.ts` sale 0. *(integration · high)*

8. **Contar desde el sitio:** `lib/contadores/contar.ts` (`cuerpoDelEvento`
   puro y `contar(evento, clave?)` con `fetch` `keepalive`, sin guardar nada),
   `cv-vio` en la página del CV, `cv-empezo` y `cv-envio` en `FormularioCV`,
   `contacto-envio` en la coreografía de Contacto. `/api/cv` no cambia.
   Acepta: `sitio exec tsx --test src/lib/contadores/contar.test.ts` y
   `sitio typecheck` salen 0. *(integration · medium)*

9. **Las acciones de links y marcas:** `datos/acciones/enlaces.ts`
   (`crearEnlaceDesdeElAdmin`, `borrarEnlaceDesdeElAdmin`) y
   `datos/acciones/marcas.ts` (`agregarMarca`, `borrarMarca`): sesión,
   `verMetricas`, Zod (el destino dentro de `rutasDelSitio()`, la fecha no
   futura), `registrarActividad` con los tipos del paso 4.
   Acepta: `sitio exec tsx --test src/datos/acciones-con-sesion.test.ts` (o
   donde viva) y `sitio typecheck` salen 0. *(integration · medium)*

10. **Las lecturas del Resumen:** `datos/consultas/resumen.ts`
    (`resumenDe(periodo)`: las dos cifras contra el anterior, la curva de
    visitantes por día, los canales con `canalDe` sin el propio dominio, las
    10 páginas más vistas con su nombre) y `datos/consultas/marcas.ts`
    (`marcasDe(desde, hasta)`: las de `actividad` de publicar, una por día y
    cosa, más las de `marcas`), sobre helpers puros de `lib/metricas/` con
    test. Acepta: sus tests y `sitio typecheck` salen 0.
    *(judgment · medium)*

11. **La `Curva` y el Resumen nuevo:** `admin/armazon/Curva.tsx` (SVG del
    servidor, `role="img"` con su frase, la tabla plegada, marcas numeradas),
    y `/admin/metricas` con el `Filtro` del período, las dos `Cifra`, la
    curva, la lista de marcas con «Agregar marca» y «Borrar», los canales y
    las páginas, cada bloque con su estado de poco tráfico; DESIGN.md §11
    «Gráficos» (la curva), con los tonos validados con `dataviz`.
    Acepta: `sitio typecheck`, `sitio lint` y `node
    scripts/verificar-react-doctor.mjs` salen 0. *(judgment · high)*

12. **Origen:** `lib/metricas/mejor-hora.ts` (`grillaDeHoras(filas, zona)` y
    las tres mejores franjas; test con un cambio de horario de Chile),
    `lib/metricas/ocultar.ts` (menos de 3 a «Otros»), `datos/consultas/origen.ts`
    y `/admin/metricas/origen` con sus seis bloques y anclas; la grilla en
    `admin/metricas/MejorHora.tsx`, sumada a §11 «Gráficos».
    Acepta: `sitio exec tsx --test src/lib/metricas/mejor-hora.test.ts
    src/lib/metricas/ocultar.test.ts`, `sitio typecheck`, `sitio lint` y
    react-doctor salen 0. *(judgment · high)*

13. **Qué hace la gente, sin materiales:** `datos/consultas/que-hace-la-gente.ts`
    (el camino del CV por canal, los contactos contra el período anterior y
    por canal) y `/admin/metricas/acciones` con sus bloques y el estado del
    CV cerrado. Acepta: `sitio typecheck`, `sitio lint` y react-doctor salen
    0. *(judgment · medium)*

14. **Links para compartir y el fin de las guías:** `/admin/metricas/enlaces`
    (crear con `Seleccion` y `TextoCorto` del kit, el código en vivo, la
    lista con clics · visitas · CV, «Copiar» y «Borrar» con `Confirmacion`,
    la línea de cuándo un CV cuenta), con `datos/consultas/enlaces.ts`
    (`enlacesConCifras()`); se borran `guias-de-metricas.ts`,
    `GuiaDeMetricas.tsx` y `metricas/[pantalla]/page.tsx`.
    Acepta: `sitio typecheck`, `sitio lint`, react-doctor y `sitio test`
    salen 0. *(judgment · high)*

15. **El aviso `resumen-semanal`, apagado de fábrica:** `config/avisos.ts`
    gana la entrada y `deFabrica`; `datos/avisos.ts` (`destinatariosDe`,
    `avisosDe`, `avisosDeTodas`, `ponerQuienRecibe`) respeta `deFabrica` sin
    cambiar Contacto ni CV. Acepta: `sitio exec tsx --test
    src/datos/avisos.test.ts` sale 0. *(integration · high)*

16. **El resumen semanal:** `correos/resumen-semanal.ts` (la plantilla, según
    el rol), `datos/tareas/resumen-semanal.ts` (`resumenSemanal` en
    `TAREAS_DIARIAS`: lunes en `ZONA_HORARIA`, un mes de datos, un correo por
    destinatario con `mandarCorreo`, que gana `idempotencia`), la nota de
    Mi cuenta › Avisos y `resumen-semanal` en las tareas de Resend
    (`config/conexiones.ts`). Acepta: `sitio exec tsx --test
    src/datos/tareas/resumen-semanal.test.ts src/correos/correos.test.ts` y
    `sitio typecheck` salen 0. *(integration · high)*

17. **[8a] Los materiales consultados:** con la 8a en `main` (si no, `ask`),
    rebase; `materialExiste` contra `materiales`, `material-consultado` en el
    link de un material de la Biblioteca pública, «Materiales más
    consultados» en Qué hace la gente, y el número del Inicio y del resumen
    semanal leyendo `contadores`. Acepta: `sitio test`, `sitio typecheck` y
    react-doctor salen 0. *(integration · medium)*

18. **[8a] «Consultado N veces este mes»** en la lista de `/admin/biblioteca`,
    de `sumasDe` del mes calendario. Acepta: `sitio typecheck`, `sitio lint`
    y react-doctor salen 0. *(integration · low)*

19. **Los docs:** ADR-0017 (contadores propios y links cortos: el porqué de
    privacidad y el límite de atribución de un CV a un link), el README (qué
    ve ED en Métricas, de dónde sale y cuándo llega), AGENTS.md §3 (el árbol)
    y el spec del admin (las tablas y las pantallas de Métricas).
    Acepta: `rg -n "0017" docs/architecture/adrs/README.md` encuentra la
    fila y `node scripts/verificar-react-doctor.mjs` sale 0.
    *(judgment · medium)*

Después del paso 19: work-verify (el gate entero, el navegador con
`ed_metricas` sembrada con poco y con mucho tráfico, los tres temas, 390 y
teclado, `next start` para permisos), el PR y `worker_done`.
