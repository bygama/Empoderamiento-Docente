# ADR-0002: Adoptar Supabase para backend y persistencia (reemplaza MongoDB)

- **Status:** Superseded by ADR-0003
- **Date:** 2026-06-28
- **Decision-makers:** @bygama
- **Supersedes:** ADR-0001 (solo la capa de persistencia / base de datos)

---

## Contexto

[ADR-0001](0001-stack-base.md) fijó el stack base e incluyó **MongoDB** como
base de datos, anticipando formularios (inscripción, envío de CV) que iban a
persistir datos. Esa elección se reemplaza.

Fuerzas en juego:

1. **Vamos a necesitar persistencia.** El sitio va a sumar formularios
   (inscripción, envío de CV) que tienen que guardar datos. Volver atrás de
   "sitio puramente estático" a tener captura de datos es una certeza, no una
   hipótesis.
2. **Equipo chico (3 personas) + IAs.** No queremos administrar un servidor
   propio, ni una base self-hosted, ni escribir y mantener una capa de auth
   desde cero. Buscamos el menor costo operativo posible.
3. **El modelo de datos es relacional.** Trayectos, formaciones, inscripciones
   y CVs tienen relaciones claras; un Postgres encaja mejor que un documento
   schemaless para consultas y consistencia.
4. **Necesitamos más que una DB.** Además de persistir, hace falta **auth**
   (eventual panel/admin) y **storage** (CVs, adjuntos). Resolverlo con piezas
   separadas suma integración y superficie de mantenimiento.

## Decisión

**Se adopta [Supabase](https://supabase.com) como backend y capa de
persistencia del proyecto, reemplazando a MongoDB.** Supabase es un BaaS
(backend-as-a-service) sobre **Postgres gestionado** que aporta, en un solo
servicio:

- **Postgres** administrado (sin servidor propio que mantener).
- **Auth** integrada (cuando haga falta login / panel).
- **Storage** para archivos (p. ej. CVs, adjuntos).
- **APIs autogeneradas** y SDK oficial **`@supabase/supabase-js`**.
- **Row Level Security (RLS)** para autorización a nivel de fila.

**Zod se mantiene** como validador de bordes: todo input (formularios,
payloads) se valida con Zod antes de tocar Supabase.

> **La integración es futura.** A la fecha de este ADR, Supabase **no está en
> el repo**: no hay `@supabase/supabase-js` en `package.json`, ni cliente
> (`src/lib/supabase/`), ni tablas, ni env vars, ni `src/app/api/`. El sitio
> corre 100% frontend. Este ADR fija la **dirección elegida**; la
> implementación llega cuando aparezcan los formularios. Las tablas y políticas
> RLS concretas se definirán en ese momento (y, si amerita, en un ADR de
> implementación).

## Consecuencias

### Positivas

- **Sin servidor propio.** Postgres, auth y storage gestionados; menos
  infraestructura para aprovisionar y mantener que un backend a medida.
- **Una sola pieza para varias necesidades.** DB + auth + storage + APIs
  reducen la integración frente a juntar servicios sueltos.
- **Relacional y tipado.** Postgres encaja con el modelo de datos; el SDK y la
  generación de tipos facilitan consultas seguras.
- **RLS de fábrica.** Autorización a nivel de fila sin escribir una capa propia.
- **AI-friendly.** El SDK `@supabase/supabase-js` es estándar y documentado,
  con patrones predecibles para que una IA lo navegue.

### Negativas

- **Dependencia de un proveedor (vendor lock-in).** Migrar fuera de Supabase
  implica reconfigurar auth, storage y, eventualmente, mover datos. El núcleo
  es Postgres estándar, lo que mitiga parte del riesgo en la capa de datos.
- **Costo y límites del plan.** El tier gratuito tiene cuotas; al crecer hay
  que evaluar plan pago.
- **Superficie de seguridad nueva.** Aparecen claves (anon vs service role),
  env vars y políticas RLS que hay que configurar bien para no filtrar datos.

### Mitigaciones

- **Mantener la lógica desacoplada** del SDK donde sea razonable (acceso a
  datos detrás de funciones propias) para acotar el lock-in.
- **Separar claves por contexto:** `NEXT_PUBLIC_SUPABASE_URL` y
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` son públicas (cliente); la
  `SUPABASE_SERVICE_ROLE_KEY` es secreta y **solo server-side**, nunca
  expuesta al browser. Placeholders en `.env.example`.
- **RLS activada desde el día uno** de cualquier tabla con datos sensibles;
  no confiar solo en la capa de aplicación.
- **Validar todos los bordes con Zod** antes de escribir en Supabase.
- **Documentar el schema y las políticas** cuando se implementen (migraciones,
  RLS) para que queden reproducibles.

## Alternativas consideradas

### Alternativa A: Mantener MongoDB (propio o gestionado)

- **Qué hubiera implicado:** seguir con el driver de Mongo + Zod; administrar
  conexión, y sumar aparte auth y storage.
- **Por qué se descarta:** el modelo de datos es relacional, y Mongo no aporta
  auth ni storage integrados. Resolver esas piezas por separado suma más
  trabajo que adoptar un BaaS que ya las trae.

### Alternativa B: Postgres self-hosted (+ auth y storage propios)

- **Qué hubiera implicado:** levantar y mantener Postgres, escribir/integrar
  auth y un servicio de storage, y operar todo el backend.
- **Por qué se descarta:** demasiado costo operativo para un equipo chico.
  Supabase da el mismo Postgres sin la carga de administrarlo.

### Alternativa C: Otro BaaS (p. ej. Firebase)

- **Qué hubiera implicado:** backend gestionado con auth y storage, pero sobre
  un datastore NoSQL (Firestore) y un ecosistema distinto.
- **Por qué se descarta:** preferimos **Postgres relacional** y SQL estándar
  por el modelo de datos y por evitar lock-in a un datastore propietario.
  Supabase ofrece la comodidad de BaaS sobre una base estándar.

## Referencias

- [ADR-0001 — Stack base del sitio](0001-stack-base.md) — decisión original
  (incluía MongoDB), cuya capa de persistencia este ADR reemplaza.
- [Supabase docs](https://supabase.com/docs) — Postgres, Auth, Storage, RLS,
  SDK `@supabase/supabase-js`.
- [AGENTS.md §2 Stack](../../../AGENTS.md) — stack vigente y backend elegido.
- [docs/AI_GUIDELINES.md §12](../../AI_GUIDELINES.md) — backend y persistencia
  (Supabase, a integrar).
