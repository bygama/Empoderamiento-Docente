import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { config as cargarEntorno } from "dotenv";
import type { Prisma } from "@/../prisma/generado/client";

// El registro de usos contra el Postgres local: la misma foto de prueba en una
// página (borrador), una novedad, un material, un caso (borrador) y un aliado, y el
// contenido del código. Todo lo de prueba se deshace al final. Los archivos de
// tests corren a la vez: el caso es el 03 porque `editar-casos.test.ts` usa el
// 04, y el aliado va al principio de la tira porque `editar-aliados.test.ts`
// mueve el suyo al final.

cargarEntorno({ path: [".env.local"], quiet: true });
const sinBase = { skip: !process.env.DATABASE_URL && "sin DATABASE_URL" };

const VIEJA = "/fotos/prueba-usos-vieja.webp";
const NUEVA = "/fotos/prueba-usos-nueva.webp";
const MATERIAL = "b0f1a5e2-0000-4000-8000-00000000f070";
const foto = (src: string, alt: string) => ({ src, alt, foco: { x: 0.5, y: 0.5 } });

async function modulos() {
  const { base } = await import("@/datos/cliente");
  const { Prisma } = await import("@/../prisma/generado/client");
  const registro = await import("./registro");
  // Volver a dejar una columna Json como estaba, nula incluida.
  const comoEstaba = (v: Prisma.JsonValue | undefined) => (v === null || v === undefined ? Prisma.DbNull : (v as Prisma.InputJsonValue));
  return { base, comoEstaba, ...registro };
}

let contacto: { borrador: Prisma.JsonValue } | null = null;
let caso03: { borrador: Prisma.JsonValue } | null = null;

before(async () => {
  if (!process.env.DATABASE_URL) return;
  const { base } = await modulos();
  contacto = await base.pagina.findUnique({ where: { slug: "contacto" }, select: { borrador: true } });
  caso03 = await base.caso.findUnique({ where: { id: "caso-03" }, select: { borrador: true } });
  const enContacto = { apertura: { equipo: { foto: foto(VIEJA, "En Contacto") } } };
  await base.pagina.upsert({ where: { slug: "contacto" }, create: { slug: "contacto", borrador: enContacto }, update: { borrador: enContacto } });
  await base.caso.update({ where: { id: "caso-03" }, data: { borrador: { lamina: { foto: foto(VIEJA, "En el caso"), sujecion: "clip", rotulo: "L" } } } });
  await base.novedad.create({ data: { slug: "prueba-usos", titulo: "Prueba usos", imagen: foto(VIEJA, "En la novedad"), publicada: true, publicadaEn: new Date() } });
  await base.material.create({ data: { id: MATERIAL, titulo: "Prueba usos", portada: foto(VIEJA, "En el material"), publicado: true, publicadoEn: new Date() } });
  await base.aliado.create({ data: { nombre: "Prueba usos", logo: foto(VIEJA, "En el aliado"), orden: 0, publicado: true, autorizado: true } });
});

after(async () => {
  if (!process.env.DATABASE_URL) return;
  const { base, comoEstaba } = await modulos();
  await base.novedad.deleteMany({ where: { slug: "prueba-usos" } });
  await base.material.deleteMany({ where: { id: MATERIAL } });
  await base.aliado.deleteMany({ where: { nombre: "Prueba usos" } });
  if (contacto) await base.pagina.update({ where: { slug: "contacto" }, data: { borrador: comoEstaba(contacto.borrador) } });
  else await base.pagina.deleteMany({ where: { slug: "contacto" } });
  await base.caso.update({ where: { id: "caso-03" }, data: { borrador: comoEstaba(caso03?.borrador) } });
});

test("cada módulo encuentra la foto donde está, y dice si está en el sitio, sin publicar o en el código", sinBase, async () => {
  const { base, usosPorFoto } = await modulos();
  const usos = await usosPorFoto(base);
  assert.deepEqual(
    (usos.get(VIEJA) ?? []).map((u) => [u.en, u.donde, u.enlace, u.alt]),
    [
      ["sin-publicar", "Contacto › Apertura › El equipo › Foto", "/admin/contenido/paginas/contacto#seccion-apertura", "En Contacto"],
      ["sitio", "Novedad «Prueba usos»", (usos.get(VIEJA) ?? [])[1]?.enlace, "En la novedad"],
      ["sitio", "Material «Prueba usos» › Portada", `/admin/biblioteca/${MATERIAL}`, "En el material"],
      ["sin-publicar", "Caso 03 › Lámina", "/admin/contenido/casos/caso-03", "En el caso"],
      ["sitio", "Aliado Prueba usos › Logo", (usos.get(VIEJA) ?? [])[4]?.enlace, "En el aliado"],
    ],
  );
  // Lo que el sitio muestra del código también es un uso: la foto de Quiénes somos en el Inicio.
  // Es «del código» mientras el Inicio no se publicó nunca: se mide en la base, no se supone.
  const enInicio = (usos.get("/fotos/formadoras-pizarra-umce.webp") ?? []).filter((u) => u.donde.startsWith("Inicio › "));
  assert.ok(enInicio.length, "la foto de Quiénes somos tiene que aparecer en el Inicio");
  const inicio = await base.pagina.findUnique({ where: { slug: "inicio" }, select: { publicado: true } });
  if (!inicio?.publicado) assert.ok(enInicio.every((u) => u.en === "codigo"), JSON.stringify(enInicio));
});

test("reemplazar cambia la URL en cada módulo y dice qué regenerar", sinBase, async () => {
  const { base, USOS_DE_FOTOS, usosPorFoto } = await modulos();
  const regenerar = await base.$transaction(async (tx) => (await Promise.all(USOS_DE_FOTOS.map((m) => m.reemplazar(tx, VIEJA, NUEVA)))).flat());
  const usos = await usosPorFoto(base);
  assert.equal(usos.get(VIEJA), undefined);
  assert.equal(usos.get(NUEVA)?.length, 5);
  // Lo que estaba solo en borradores no regenera nada; la novedad, el material y el logo publicados, sí.
  assert.deepEqual(
    regenerar.map((r) => r.ruta + (r.layout ? " (layout)" : "")),
    ["/", "/novedades", "/novedades/prueba-usos", "/novedades/prueba-usos/imagen-para-redes", "/", "/biblioteca", `/biblioteca/portada/${MATERIAL}`, "/ (layout)"],
  );
});
