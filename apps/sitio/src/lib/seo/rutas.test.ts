import { test } from "node:test";
import assert from "node:assert/strict";
import { laContestaSola, patronDe, type RutaDeclarada } from "./rutas";

// Las rutas declaradas con la sintaxis de las carpetas de Next, y cuáles
// contesta el sitio sin mirar las redirecciones.

const casa = (ruta: string, contesta: RutaDeclarada["contesta"] = "sola") => (probada: string) => patronDe({ ruta, contesta }).test(probada);

test("la sintaxis de las carpetas de Next: un segmento, uno o más, ninguno o más", () => {
  assert.equal(casa("/")("/"), true);
  assert.equal(casa("/")("/contacto"), false);
  assert.equal(casa("/novedades/[slug]")("/novedades/una"), true);
  assert.equal(casa("/novedades/[slug]")("/novedades/una/otra"), false);
  assert.equal(casa("/novedades/[slug]/imagen-para-redes")("/novedades/una/imagen-para-redes"), true);
  assert.equal(casa("/[...resto]")("/a/b/c"), true);
  assert.equal(casa("/[...resto]")("/"), false);
  assert.equal(casa("/admin/[[...todo]]")("/admin"), true);
  assert.equal(casa("/admin/[[...todo]]")("/admin/cuentas/1"), true);
  assert.equal(casa("/admin/[[...todo]]")("/administracion"), false);
});

test("el punto es literal, y el asterisco es un tramo de un segmento (el hash de Next)", () => {
  assert.equal(casa("/sitemap.xml")("/sitemapXxml"), false);
  assert.equal(casa("/opengraph-image*.png")("/opengraph-image-1whei1.png"), true);
  assert.equal(casa("/opengraph-image*.png")("/opengraph-image.png"), true);
  assert.equal(casa("/opengraph-image*.png")("/opengraph-image/x.png"), false);
});

test("una carpeta de archivos abarca lo de adentro con extensión, y nada más", () => {
  const archivo = casa("/equipo", "archivos");
  assert.equal(archivo("/equipo/daniela-reyes.jpg"), true);
  assert.equal(archivo("/equipo/sub/foto.webp"), true);
  assert.equal(archivo("/equipo"), false);
  assert.equal(archivo("/equipo/viejo"), false);
});

test("lo que busca una redirección no la contesta solo", () => {
  const declaradas: RutaDeclarada[] = [
    { ruta: "/contacto", contesta: "sola" },
    { ruta: "/novedades/[slug]", contesta: "o-redirige" },
    { ruta: "/[...resto]", contesta: "o-redirige" },
  ];
  assert.deepEqual(laContestaSola("/contacto", declaradas), { ruta: "/contacto", contesta: "sola" });
  assert.equal(laContestaSola("/novedades/vieja", declaradas), null);
  assert.equal(laContestaSola("/taller-2025", declaradas), null);
});
