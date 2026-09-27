import { test } from "node:test";
import assert from "node:assert/strict";
import { ipQueNoSePide } from "./ip";

test("no se le pide nada a la red interna, a la máquina ni a la metadata de la nube", () => {
  const internas = [
    "0.0.0.0",
    "10.1.2.3",
    "100.64.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.1",
    "172.31.255.255",
    "192.0.0.8",
    "192.0.2.1",
    "192.168.1.1",
    "198.18.0.1",
    "198.51.100.7",
    "203.0.113.9",
    "224.0.0.1",
    "255.255.255.255",
    "::",
    "::1",
    "::ffff:127.0.0.1",
    "::ffff:a9fe:a9fe",
    "0:0:0:0:0:ffff:7f00:1",
    "64:ff9b::a9fe:a9fe",
    "fc00::1",
    "fd12:3456::1",
    "fe80::1",
    "ff02::1",
    "2001:db8::1",
    "2001:0:4136:e378:8000:63bf:3fff:fdd2",
    "2002:7f00:1::1",
    "no es una ip",
  ];
  for (const ip of internas) assert.equal(ipQueNoSePide(ip), true, ip);
});

test("internet pública sí", () => {
  for (const ip of ["8.8.8.8", "200.45.1.1", "172.32.0.1", "104.18.12.33", "::ffff:8.8.8.8", "2800:3f0:4001:810::200e", "2606:4700::6810:84e5"]) {
    assert.equal(ipQueNoSePide(ip), false, ip);
  }
});

test("IPv4-translated (::ffff:0:0/96) no es una IPv4 escrita como IPv6: cae en la regla de las globales", () => {
  // El atajo viejo, /^::ffff:/, las mandaba a la lista de IPv4 y las dejaba pasar.
  for (const ip of ["::ffff:0:7f00:1", "::ffff:0:a9fe:a9fe", "0:0:0:0:ffff:0:a00:1", "::ffff:0:808:808"]) {
    assert.equal(ipQueNoSePide(ip), true, ip);
  }
});

test("IPv4-mapped de verdad (::ffff:a.b.c.d), en cualquier escritura, se juzga como su IPv4", () => {
  for (const ip of ["::ffff:127.0.0.1", "::FFFF:7F00:1", "0000:0000:0000:0000:0000:ffff:0a00:0001", "::ffff:169.254.169.254", "::ffff:0.0.0.0"]) {
    assert.equal(ipQueNoSePide(ip), true, ip);
  }
  for (const ip of ["::ffff:8.8.8.8", "::ffff:808:808", "0:0:0:0:0:ffff:c82d:101"]) assert.equal(ipQueNoSePide(ip), false, ip);
});

test("una IPv6 con zona (fe80::1%eth0) no se pide", () => {
  assert.equal(ipQueNoSePide("fe80::1%eth0"), true);
});
