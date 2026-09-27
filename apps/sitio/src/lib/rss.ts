// Un feed RSS 2.0 a partir de un canal y sus ítems. Sin dominio de ED: lo que
// dice cada ítem lo arma quien llama. Las URLs llegan absolutas.

export type CanalDeRss = {
  titulo: string;
  /** La página del canal. */
  link: string;
  descripcion: string;
  /** Dónde vive este feed: el `atom:link rel="self"` que piden los validadores. */
  propio: string;
  idioma: string;
};

export type ItemDeRss = {
  titulo: string;
  link: string;
  /** Único y estable; no es una URL que se abra (`isPermaLink="false"`). */
  guid: string;
  fecha: Date;
  descripcion: string;
  categoria?: string;
};

const ENTIDADES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

/** Un texto seguro adentro de XML, en un elemento o en un atributo. */
export function escaparXml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ENTIDADES[c]);
}

function item(i: ItemDeRss): string {
  return [
    "    <item>",
    `      <title>${escaparXml(i.titulo)}</title>`,
    `      <link>${escaparXml(i.link)}</link>`,
    `      <guid isPermaLink="false">${escaparXml(i.guid)}</guid>`,
    // RFC 822, como pide RSS 2.0: `toUTCString` da «Wed, 26 Aug 2026 00:00:00 GMT».
    `      <pubDate>${i.fecha.toUTCString()}</pubDate>`,
    `      <description>${escaparXml(i.descripcion)}</description>`,
    ...(i.categoria ? [`      <category>${escaparXml(i.categoria)}</category>`] : []),
    "    </item>",
  ].join("\n");
}

/** El XML entero, con los ítems en el orden en que llegan. */
export function rss(canal: CanalDeRss, items: readonly ItemDeRss[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escaparXml(canal.titulo)}</title>`,
    `    <link>${escaparXml(canal.link)}</link>`,
    `    <description>${escaparXml(canal.descripcion)}</description>`,
    `    <language>${escaparXml(canal.idioma)}</language>`,
    `    <atom:link href="${escaparXml(canal.propio)}" rel="self" type="application/rss+xml" />`,
    ...items.map(item),
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}
