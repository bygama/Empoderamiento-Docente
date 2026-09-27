import { test } from "node:test";
import assert from "node:assert/strict";
import { linkDelDoi, normalizarDoi } from "./doi";

test("un DOI pegado de cualquier forma se normaliza; lo que no es un DOI, no", () => {
  assert.equal(normalizarDoi("10.1590/1980-4415v28n48a18"), "10.1590/1980-4415v28n48a18");
  assert.equal(normalizarDoi("https://doi.org/10.24844/SOMIDEM/S3/2026/01-05"), "10.24844/somidem/s3/2026/01-05");
  assert.equal(normalizarDoi("http://dx.doi.org/10.1590%2Fabc"), "10.1590/abc");
  assert.equal(normalizarDoi(" doi: 10.1590/ABC "), "10.1590/abc");
  assert.equal(normalizarDoi("https://www.redalyc.org/articulo.oa?id=13250921004"), null);
  assert.equal(normalizarDoi("10.12/corto"), null);
  assert.equal(normalizarDoi("%E0%A4%A"), null);
  assert.equal(linkDelDoi("10.1590/abc"), "https://doi.org/10.1590/abc");
});

test("el link de un DOI escapa lo que cortaría la URL, y conserva las barras", () => {
  assert.equal(linkDelDoi("10.24844/somidem/s3/2026/01-05"), "https://doi.org/10.24844/somidem/s3/2026/01-05");
  assert.equal(linkDelDoi("10.1000/a#b"), "https://doi.org/10.1000/a%23b");
  assert.equal(linkDelDoi("10.1000/a?b=c"), "https://doi.org/10.1000/a%3Fb%3Dc");
  assert.equal(linkDelDoi("10.1000/100%"), "https://doi.org/10.1000/100%25");
  assert.equal(linkDelDoi("10.1000/a b/c"), "https://doi.org/10.1000/a%20b/c");
});
