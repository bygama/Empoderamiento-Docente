# ADR-0008: Adaptador de Postgres y scrypt (corrige al 0005 y al 0007)

- **Status:** Accepted
- **Date:** 2026-09-18
- **Decision-makers:** @mateo
- **Amends:** [ADR-0005](0005-admin-a-medida.md) y [ADR-0007](0007-prisma-como-orm.md)

---

## Contexto

El [ADR-0005](0005-admin-a-medida.md) y el [ADR-0007](0007-prisma-como-orm.md)
se escribieron **antes** de implementar la fase 1. Construirla desmintió dos de
sus detalles, y este ADR existe porque los ADRs de este repo son **inmutables
una vez aceptados**: una decisión que cambia se registra en uno nuevo, no
editando el viejo.

Las dos decisiones de fondo siguen intactas: el admin es a medida y el ORM es
Prisma. Lo que cambia son dos piezas adentro.

## Decisión

### 1. El adaptador es `@prisma/adapter-pg`, no `@prisma/adapter-neon`

El ADR-0005 listaba `@prisma/adapter-neon` entre las dependencias que entraban.
**No sirve**: el driver serverless de Neon habla por **WebSocket** y existe para
runtimes Edge, donde no hay TCP. Contra un Postgres común —el de Docker en
local— falla con un `ErrorEvent` **sin mensaje**, que no dice nada de lo que
pasó y cuesta horas de diagnosticar.

`@prisma/adapter-pg` habla el protocolo Postgres de siempre, que **Neon también
acepta** —es lo que usa `psql`— y el admin corre en Node, no en Edge. Sirve
igual de los dos lados y hace que el entorno local funcione.

### 2. El hasheo de contraseñas es scrypt, no Argon2id

El ADR-0005 y la spec decían **Argon2id**, que es la primera opción de OWASP.
better-auth trae **scrypt** de fábrica, que es la segunda opción aceptable de la
misma lista, y pasar a Argon2id exige sumar `@node-rs/argon2` — una dependencia
que el owner no aprobó cuando aprobó la lista por nombre.

Se implementó con el default. **El upgrade es un `password.hash` en
`packages/auth/src/config.ts` más una dependencia**, y queda a decisión del
owner.

## Consecuencias

### Positivas

- El entorno local funciona contra un Postgres de Docker, sin necesitar una
  cuenta de Neon ni su proxy local para desarrollar.
- Una dependencia menos de la que se había previsto: no entra el driver
  serverless.
- La documentación deja de prometer Argon2id, que es peor que entregar scrypt.

### Negativas

- **scrypt no es Argon2id.** Es aceptable para OWASP, no es su primera opción, y
  esto lo deja dicho en vez de dejarlo implícito en el código.
- Si algún día el admin tiene que correr en Edge —hoy no hay motivo—, el
  adaptador de Postgres no sirve y habría que volver al de Neon para esa parte.

### Mitigaciones

- El cambio de hasheo está aislado en un solo lugar de `packages/auth`, con la
  opción documentada, para que la decisión no cueste una arqueología.
- `advanced.ipAddress.ipAddressHeaders` ya está configurado para Vercel, así que
  el camino a producción no depende del driver.

## Referencias

- [ADR-0005](0005-admin-a-medida.md) y [ADR-0007](0007-prisma-como-orm.md), que
  este corrige.
- Diseño del admin: `../specs/2026-09-18-admin-a-medida-diseno.md`.
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
  — Argon2id primero, scrypt como alternativa aceptable.

---

## Cómo se marcó esto en el 0005 y el 0007

Los ADRs de este repo son **inmutables una vez aceptados**, así que sus
oraciones originales quedaron **intactas**. Lo que se agregó es una anotación
`> Corregido por el ADR-0008` **inmediatamente después de cada afirmación
corregida**, no solo en la cabecera.

El motivo es concreto: un puntero arriba de todo no sirve a quien aterriza a
mitad del documento —buscando «adapter-neon», o salteando a «Consecuencias»—,
que es exactamente como se leen los ADRs viejos. Lo levantó la review de cierre
de la fase 1.

El precedente del repo era **menos** que esto, no más: el ADR-0006 enmendó al
0004 sin dejar ni una marca en su cuerpo ni en su Status. Agregar metadata al
lado de una oración no reescribe la decisión; dejar la decisión sin marcar sí
engaña.
