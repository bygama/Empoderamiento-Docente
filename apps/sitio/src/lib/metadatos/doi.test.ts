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
