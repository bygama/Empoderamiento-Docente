import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { leerImagen } from "./imagen";

const pixel = (formato: "png" | "jpeg" | "webp" | "gif") =>
  sharp({ create: { width: 3, height: 2, channels: 3, background: "#1f9a78" } }).toFormat(formato).toBuffer();

test("reconoce jpg, png y webp por los bytes y lee ancho y alto", async () => {
  assert.deepEqual(await leerImagen(await pixel("png")), { tipo: "image/png", ancho: 3, alto: 2 });
  assert.deepEqual(await leerImagen(await pixel("jpeg")), { tipo: "image/jpeg", ancho: 3, alto: 2 });
  assert.deepEqual(await leerImagen(await pixel("webp")), { tipo: "image/webp", ancho: 3, alto: 2 });
});

test("lo que no es jpg, png o webp no pasa, diga lo que diga su extensión", async () => {
  assert.equal(await leerImagen(await pixel("gif")), null);
  assert.equal(await leerImagen(Buffer.from("no soy una imagen.png")), null);
});
