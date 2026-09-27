// Quién pide una página sin ser una persona: las vistas previas de las redes
// (LinkedIn, WhatsApp, Facebook abren el link para armar la tarjeta), los
// buscadores y los scripts. Un link corto no cuenta sus clics. El
// `User-Agent` se lee y no se guarda. No sabe de ED.

const ROBOTS =
  /bot\b|bot\/|crawl|spider|slurp|preview|facebookexternalhit|facebookcatalog|^whatsapp\/|embedly|vkshare|bitly|google-inspectiontool|headlesschrome|lighthouse|^curl\/|^wget\/|python-requests|httpclient|go-http-client|node-fetch|axios|undici/i;

/** Si el pedido es de un robot. Sin `User-Agent`, también: una persona siempre manda uno. */
export function esRobot(agente: string | null | undefined): boolean {
  const ua = agente?.trim();
  return !ua || ROBOTS.test(ua);
}
