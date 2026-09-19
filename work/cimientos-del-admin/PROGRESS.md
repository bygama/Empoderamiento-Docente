# PROGRESS — Fase 1: los cimientos del admin

- **Rama:** `mateo/cimientos-del-admin`, sobre el **checkout principal**
- **Base:** `6d72bc0` (= `origin/main`, fase 0 mergeada)
- **Spec:** [`SPEC.md`](SPEC.md) · **Plan:** [`PLAN.md`](PLAN.md) ·
  **Rulings:** [`DECISIONS.md`](DECISIONS.md)

**Estado: los 9 pasos ejecutados y verificados.** Cada uno commiteado apenas
pasó su aceptación, que es la regla que salió de perder el primer intento.

## Baseline

Medido sobre `6d72bc0`:

- `pnpm typecheck` · `pnpm lint` · `pnpm build` → 0
- react-doctor → **100/100, 294 archivos**, un solo proyecto
- Contenedor `ed-postgres` en 5435 con la base `ed_panel` (9 tablas de
  Payload). La base `ed` que nombraban los docs **no existía**.
- Registry: `prisma@latest` → `8.0.0-rc.15`, estable `7.10.0` en `prev`.

## Hecho

- [x] **1. `packages/` con `@ed/db`, sumado a las dos listas del gate.**
      El informe de react-doctor **nombra los dos proyectos** — un proyecto
      ausente se leería igual que «cero hallazgos».
- [x] **2. Prisma 7.10.0 exacta y la guarda de `db push`.**
      Bloquea las tres formas de `db push` con flags en cualquier posición,
      delega el resto desde `apps/sitio` y propaga el exit. Los cinco scripts
      de base pasan por ella.
- [x] **3. El esquema base y su primera migración.** Base `ed` creada;
      `ed_panel` intacta con sus 9 tablas.
- [x] **4. `packages/auth` con better-auth.** Esquema escrito desde la
      definición de la 1.7.5 —no del CLI, que quedó en la 1.4.21— y verificado
      contra la base.
- [x] **5. Cabeceras de seguridad y `X-Robots-Tag` en `/admin`.**
- [x] **6. La guarda de sesión en el middleware.**
- [x] **7. Rate limit por IP.** Tres intentos por minuto en sign-in.
- [x] **8. Entrar, salir y elegir contraseña.** Más `crear-cuenta`, que es la
      única puerta para la primera cuenta.
- [x] **9. README, `AGENTS.md` §13 y el SPEC al día.**

## Verification

### Los gates

```
pnpm typecheck / lint / build            → exit 0
pnpm migrate:status                      → sin pendientes
node scripts/verificar-react-doctor.mjs  → 100/100 sin diagnósticos
    (apps/sitio/src: 311 · packages/db/src: 3 · packages/auth/src: 5)
node scripts/guarda-prisma.mjs db push   → exit 1, bloqueado
links markdown rotos en todo el repo     → 0
```

### El sitio público no se movió

`comparar-render.mjs` contra un clon de `6d72bc0` buildeado aparte:

```
11 páginas, render idéntico.   (texto, links y <head>)
3 páginas nuevas: las tres pantallas del admin
```

**Pero cada página pública pesa +4103 bytes**, y eso se persiguió hasta el
fondo: +2880 de CSS (contado dos veces, como preload y como hoja) y +1223 de
JS del runtime, por el segundo layout raíz. El CSS creció porque Tailwind arma
una sola hoja para los dos route groups. Ver el ruling con su umbral en
`DECISIONS.md`.

### Seguridad, probada y no declarada

Sobre el build de producción, en el puerto que coincide con
`NEXT_PUBLIC_SITE_URL`:

| Qué | Cómo se probó | Resultado |
| --- | --- | --- |
| Cabeceras | `curl -I /` | las cinco presentes |
| `noindex` en el admin | `curl -I /admin` | `X-Robots-Tag: noindex, nofollow` + `no-store` |
| Guarda de sesión | `GET /admin` sin cookie | 307 a `/admin/entrar` |
| Sin loop | `GET /admin/entrar` | no redirige a sí misma |
| Rate limit por IP | 5 POST a `sign-in` con correos **distintos** | 401, 401, 401, **429**, 429 |
| Cupo por IP | misma prueba desde otra IP | 401 (cupo propio) |
| Enumeración | contraseña mala vs. usuario inexistente | **401 los dos** |
| CSRF | `sign-out` desde `https://malicioso.example` | **403**, y la sesión sobrevive |
| Origen inválido | `sign-in` con `Origin` de otro puerto | **403 `INVALID_ORIGIN`** |

### El recorrido completo

```
pedir contraseña        → 200, el enlace sale por la consola
seguir el enlace        → 307 a /admin/nueva-contrasena?token=…
elegir la contraseña    → 200
entrar                  → 200
/admin con sesión       → 200, muestra nombre, rol y Salir
salir                   → 200
/admin después de salir → 307 a /admin/entrar
```

### Review de cierre

Cuatro seats frescos en Sonnet, una lente cada uno. Ocho pasos en `high`, siete
tocando auth o seguridad, así que la review pesó más que la de la fase 0.

| Lente | Veredicto |
| --- | --- |
| Type and interface design | **PASS**, 3 Important |
| Documentation impact | **FAIL**, 2 Critical |
| Correctness against the SPEC | 0 Critical, 2 Important |
| Silent failures | 0 Critical, 1 Important **grave** |

**Lo que encontraron y yo no:** la guarda de `db push` no guardaba; mi enmienda
al SPEC había borrado dos promesas de seguridad en silencio; y un puntero en la
cabecera de un ADR no le sirve a quien entra por el medio del documento.

**Lo que confirmaron contra el sistema corriendo**, y que yo había dado por
bueno sin probar: la cookie de sesión forjada se rechaza sin filtrar contenido,
no hay open redirect en `volver`, y no hay hueco en el matcher del middleware.

### El fix loop

| Ronda | Qué falló | Por qué |
| --- | --- | --- |
| 1 | la guarda | un flag con valor separado dejaba su valor como «verbo» |
| 2 | la guarda | un argumento con un espacio adentro; el shell lo repartía |
| 3 | la guarda | `%VAR%`, `^` y **inyección con `&`** — todo por `shell: true` |
| 4 | — | se sacó el shell: la clase entera |

Las tres primeras las arreglé parcheando el mismo chequeo. La cuarta salió de
aceptar que **el chequeo nunca fue el problema**.

Las demás lentes cerraron en las rondas 1 y 2.

## Próximo

1. Veredicto de la ronda 4 sobre la guarda.
2. `work-handoff` y el PR.
3. Después, la fase 2: `packages/kit-admin` y novedades de punta a punta.

## Notas

- La base local quedó **sin cuentas**: las de prueba se borraron.
- `@prisma/adapter-pg` reemplaza a `@prisma/adapter-neon` en la lista aprobada.
- El hasheo es **scrypt**, no Argon2id. Ver `SPEC.md` §4 y `DECISIONS.md`.
- El rate limit cubre IP, **no cuenta**: un ataque repartido entre muchas IPs
  contra una sola cuenta no está cubierto.
