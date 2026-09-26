import { siteConfig } from "@/config/site";

/**
 * La forma común de los correos del admin: HTML sobrio, en una columna, y el
 * mismo texto en plano para los programas que no muestran HTML (y para los
 * filtros de spam, que desconfían de un correo sin texto).
 *
 * Los colores van en hexadecimal porque un correo no lee las variables del
 * tema: son los valores de los tokens de DESIGN.md, y si el token cambia,
 * cambia acá también. El botón es el primario del admin: naranja con el texto
 * en `azul-principal` (6,01:1).
 */
const COLOR = {
  texto: "#1f2d4d", // azul-principal
  secundario: "#6b7280", // gris-texto, 4,83:1 sobre blanco
  accion: "#e07a2f", // naranja-accion
  fondo: "#f2f4f7", // gris-fondo
  tarjeta: "#ffffff",
} as const;

const FUENTE = "Arial, Helvetica, sans-serif";

export type Contenido = { asunto: string; html: string; texto: string };

/** Lo que entra al HTML desde afuera (un nombre, un enlace) no puede cerrar una etiqueta. */
export function escapar(valor: string): string {
  return valor.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function saludo(nombre?: string): string {
  return nombre?.trim() ? `Hola, ${nombre.trim()}:` : "Hola:";
}

/** «1 hora», «72 horas», «10 minutos»: cuánto dura un enlace o un código. */
export function duracion(minutos: number): string {
  if (minutos % 60 !== 0) return `${minutos} minutos`;
  const horas = minutos / 60;
  return horas === 1 ? "1 hora" : `${horas} horas`;
}

type Partes = {
  asunto: string;
  nombre?: string;
  /** Párrafos antes del botón. */
  antes: string[];
  /** Algo para copiar, grande y separado: el código del segundo factor. */
  destacado?: string;
  boton?: { texto: string; enlace: string };
  /** Párrafos después del botón, en gris. */
  despues: string[];
};

export function armarCorreo({ asunto, nombre, antes, destacado, boton, despues }: Partes): Contenido {
  const parrafo = (texto: string, color: string = COLOR.texto) =>
    `<p style="margin:0 0 16px;color:${color};font:16px/1.5 ${FUENTE}">${escapar(texto)}</p>`;
  const destacadoHtml = destacado
    ? `<p style="margin:24px 0;color:${COLOR.texto};font:bold 32px/1 ${FUENTE};letter-spacing:6px">${escapar(destacado)}</p>`
    : "";
  const botonHtml = boton
    ? `<p style="margin:24px 0"><a href="${escapar(boton.enlace)}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:${COLOR.accion};color:${COLOR.texto};font:bold 16px/1 ${FUENTE};text-decoration:none">${escapar(boton.texto)}</a></p>` +
      parrafo(`Si el botón no anda, copiá este enlace en el navegador: ${boton.enlace}`, COLOR.secundario)
    : "";
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${escapar(asunto)}</title></head>
<body style="margin:0;padding:24px;background:${COLOR.fondo}">
<div style="max-width:480px;margin:0 auto;padding:32px;background:${COLOR.tarjeta};border-radius:12px">
<p style="margin:0 0 24px;color:${COLOR.texto};font:bold 18px/1.3 ${FUENTE}">${escapar(siteConfig.name)}</p>
${[saludo(nombre), ...antes].map((t) => parrafo(t)).join("\n")}
${destacadoHtml}
${botonHtml}
${despues.map((t) => parrafo(t, COLOR.secundario)).join("\n")}
</div>
</body></html>`;
  const texto = [saludo(nombre), ...antes, ...(destacado ? [destacado] : []), ...(boton ? [boton.enlace] : []), ...despues, `— ${siteConfig.name}`].join("\n\n");
  return { asunto, html, texto };
}
