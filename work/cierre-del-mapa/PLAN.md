# PLAN — El cierre del mapa del admin

SPEC aprobado por el padre el 2026-09-27, tal cual, con las siete propuestas
(DECISIONS). Tier L, worktree propio, rama `mateo/cierre-del-mapa`. Cada paso
es un commit y deja el gate en verde.

## Constraints

- **Nada cambia de comportamiento** salvo lo que el SPEC nombra (el 404 de
  `/admin/<algo>`, P5; el link de un DOI con `#`, `?`, `%` o espacios). El
  sitio lo prueba `comparar-render` contra `main` (12 páginas idénticas); el
  admin, la comparación de HTML por pantalla y por rol contra el build de
  `main` (`%TEMP%/ed-cierre-antes`, ya buildeado en `910dabf5`).
- **Los tests de hoy no se tocan**, salvo el caso de `guarda.test.ts` que
  chequea la ruta que se borra (paso 3). `git diff main -- '*.test.ts'` lo
  muestra.
- **Español** en código, comentarios, docs y commits; Conventional según
  `docs/COMMITS.md`, atómicos, nunca `git add -A`, nunca `--no-verify`; push
  y PR sin pedir OK, **nunca mergear**.
- **Las cuatro fronteras:** `packages/` sin ED y sin `@/`; `datos/` es la
  única puerta a la base; `app/` son rutas; `features/` recibe props.
- **Topes:** componentes ≤ 200 líneas, utilidades ≤ 100 (AGENTS.md §6); cada
  archivo nuevo o movido se cuenta en PROGRESS.
- **El repo es CRLF:** un reemplazo multilínea por script normaliza antes
  (lee, pasa a `\n`, edita, vuelve a `\r\n`). Los `git mv` conservan el
  historial: el contenido movido se edita en el mismo commit solo en sus
  imports.
- **Base `ed`** (no migra); **`ed_cierre`** solo para el recorrido con quien
  dirige (P6), y se borra al cerrar. Dev server en el **3032**, su propia
  pestaña de Orca, siempre por `localhost`.

Una prueba sola: `pnpm --filter sitio exec tsx --test <archivo>`. Las del
kit: `pnpm --filter @ed/kit-admin test`.

## Pasos

1. **`linkDelDoi` codifica el DOI segmento por segmento.** Test primero en
   `lib/metadatos/doi.test.ts` (un DOI normal igual; `#`, `?`, `%` y espacio
   escapados, las `/` intactas), que falla; después `lib/metadatos/doi.ts`.
   Acepta: `pnpm --filter sitio exec tsx --test src/lib/metadatos/doi.test.ts`
   sale 0 (y salió 1 antes del cambio). *(mechanical · low)*

2. **Las dos portadas sin uso, fuera.** Probar que nada las nombra y borrar
   `public/biblioteca/portadas/44-resignificacion-colectiva-lo-cuadratico.webp`
   y `57-juguemos-catan-explorando-desarrollo.webp`. Acepta: `grep -rn
   "44-resignificacion\|57-juguemos" apps/sitio/src scripts docs` vacío; la
   consulta de `materiales.portada` y `.borrador` en `ed` da 0; los dos
   archivos no existen. `comparar-render` lo confirma en la verificación.
   *(mechanical · low)*

3. **`admin/por-hacer/` y la ruta `[modulo]`, fuera.** Borrar
   `admin/por-hacer/`, `(protegido)/[modulo]/page.tsx` y el test «los módulos
   que todavía son una guía…» de `admin/armazon/guarda.test.ts`. Acepta: `grep
   -rn "por-hacer\|guiaDe\|GuiaDelModulo" apps/sitio/src` vacío; `pnpm
   typecheck` 0; `pnpm --filter sitio exec tsx --test
   src/admin/armazon/guarda.test.ts` 0; con sesión, `curl` a `/admin/nope` da
   404 con «Página no encontrada». *(mechanical · low)*

4. **`datos/actividad/`, un archivo por módulo.** `datos/actividad.ts` pasa a
   `datos/actividad/index.ts` (esquema, `registrarActividad`, `tiposQueVe`,
   `tiposDelInicio`, `esTipoDeActividad`, y `TIPOS_DE_ACTIVIDAD`,
   `TipoDeActividad`, `QUIEN_VE` y `VA_AL_INICIO` compuestos) más los 13
   módulos del SPEC §4.2 (acceso, mi-cuenta, paginas, mensajes, cuentas,
   novedades, ajustes, biblioteca, casos, aliados, fotos, metricas, equipo),
   cada uno con `{ quienVe, vaAlInicio }` por tipo, en ese orden. Acepta:
   `pnpm --filter sitio exec tsx --test src/datos/actividad.test.ts
   src/admin/actividad/frase.test.ts src/datos/consultas/actividad.test.ts
   src/datos/inicio/actividad-reciente.test.ts
   src/admin/cuentas/actividad/modulos.test.ts` 0; `pnpm typecheck` 0; `wc -l
   apps/sitio/src/datos/actividad/*.ts` todos < 100; ningún `*.test.ts`
   cambiado. *(integration · high)*

5. **`admin/actividad/frase/`, un archivo por módulo.** Consume
   `TipoDeActividad` de `@/datos/actividad` (paso 4). `frase.ts` pasa a
   `frase/index.ts` (`fraseDe`, `FRASES` como `Record<TipoDeActividad, …>`),
   con `EventoParaLeer` y `contraer` en un archivo común, y las frases y sus
   ayudas en los 13 módulos. Acepta: `pnpm --filter sitio exec tsx --test
   src/admin/actividad/frase.test.ts` 0; `pnpm typecheck` 0; `wc -l` todos <
   100. *(integration · medium)*

6. **`admin/cuentas/actividad/modulos/`, un archivo por módulo.** `modulos.ts`
   pasa a `modulos/index.ts` (`MODULOS_DE_ACTIVIDAD`, `ModuloDeActividad`,
   `moduloDe`, `esModuloDeActividad` y `pantallaDe` con la firma de hoy), y
   cada módulo dice, por tipo, el módulo del filtro y adónde lleva. Acepta:
   `pnpm --filter sitio exec tsx --test
   src/admin/cuentas/actividad/modulos.test.ts
   src/admin/cuentas/actividad/filtros.test.ts` 0; `pnpm typecheck` 0; `wc
   -l` todos < 100. *(integration · medium)*

7. **`datos/inicio/pendientes/`, un archivo por módulo.** `pendientes.ts` pasa
   a `pendientes/index.ts` (`URGENCIAS`, `Urgencia`, `LoPendiente`,
   `Pendiente`, y `PENDIENTES`, `ClaveDePendiente` y `CLAVES_DE_PENDIENTES`
   compuestos en el orden de hoy) y 7 módulos (mensajes, paginas, novedades,
   biblioteca, fotos, aliados, metricas). Acepta: `pnpm --filter sitio exec
   tsx --test src/datos/inicio/pendientes.test.ts
   src/datos/inicio/de-los-mensajes.test.ts
   src/datos/inicio/de-las-fotos.test.ts
   src/datos/inicio/de-las-novedades.test.ts
   src/datos/inicio/de-los-aliados.test.ts` 0; `pnpm typecheck` 0; `wc -l`
   todos < 100. *(integration · medium)*

8. **Los tres puentes, fuera.** `BotonEnlace` pasa al `Boton.tsx` del kit y
   sale por su índice; se borran `admin/armazon/Boton.tsx`,
   `admin/armazon/clases.ts` y el `export { Aviso }` de
   `admin/armazon/Campos.tsx`; cada archivo que los usaba importa `Boton`,
   `BotonEnlace`, `claseDeBoton`, `Variante` y `Aviso` de `@ed/kit-admin`.
   Acepta: `grep -rn 'armazon/Boton"\|armazon/clases"\|export { Aviso }'
   apps/sitio/src` vacío; `pnpm typecheck` y `pnpm lint` 0; `node
   scripts/verificar-react-doctor.mjs` 100/100 en los cuatro proyectos.
   *(mechanical · medium)*

9. **Las piezas sin ED, al kit.** `git mv` de las piezas del SPEC §3.2 a
   `packages/kit-admin/src/` (la curva en `curva/`), con los íconos del kit
   (P1: `ChevronAbajo`, `Check`, y `FlechaIzquierda`, `FlechaAfuera`, `Ojo` y
   `OjoTachado` copiados con sus trazos), `Campos.tsx` como `CampoSimple`,
   `BotonDeAcceso` y `ENLACE_DE_ACCESO` (P2), todo por `src/index.ts`; las
   ~300 líneas de import de la app pasan a `@ed/kit-admin`. Acepta: `grep -rnE
   '@/admin/armazon/(Lista|Insignia|Encabezado|Volver|EstadoVacio|Confirmacion|Tabla|Paginado|Pestanas|Numero|ruta|Filtro|Buscador|Cifra|Curva|Apartado|Bloque|FilaDeAccion|IndiceDeTarjetas|VistaPreviaFrenada|AvisoDelEditor|ListaQueSeOrdena|useMoverEnOrden|useFrenarSalida|AccionesDeLaFicha|CampoContrasena|Campos)"'
   apps/sitio/src` vacío; `grep -rn '"@/' packages/kit-admin/src` vacío;
   `pnpm typecheck`, `pnpm lint` y `pnpm --filter @ed/kit-admin test` 0;
   react-doctor 100/100 en los cuatro; la comparación de HTML del admin contra
   `main`, igual en toda pantalla y rol. *(mechanical · high)*

10. **Los documentos de la mudanza.** `packages/kit-admin/README.md` (la
    tabla de exports y los tokens que espera, medidos sobre las clases de
    `src/`), una línea en el ADR-0014 y las rutas de DESIGN.md §11 (P3).
    Acepta: `grep -n "admin/armazon/" DESIGN.md` nombra solo piezas que
    siguen en `admin/armazon/` (barra lateral, «Sin permiso», la guarda, la
    pantalla de acceso, «Qué cambió», «Cómo se ve»); cada token del README
    aparece en `packages/kit-admin/src` y cada token que usa el kit está en
    el README. *(mechanical · medium)*

11. **Los documentos del cierre.** AGENTS.md §3 (el árbol: el kit, lo que
    queda en `admin/armazon/`, los registros como carpetas, sin `por-hacer/`)
    y §13 (fases 2 y 3 hechas, una línea por módulo); el spec del admin §3,
    §7, §9 y §11; `docs/AI_GUIDELINES.md` §2 (ejemplos que existen); el README
    donde lo toque. Acepta: `grep -rn "por-hacer\|datos/actividad\.ts\|lineas-accion/data\.ts\|quienes-somos/data/equipo" AGENTS.md README.md docs/AI_GUIDELINES.md docs/architecture/specs/2026-09-18-admin-a-medida-diseno.md`
    vacío; cada ruta nueva que nombran existe (`test -e`). *(judgment ·
    medium)*
