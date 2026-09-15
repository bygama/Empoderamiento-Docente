// Correo de «olvidé mi contraseña». Texto llano y un solo botón: lo reciben
// Raquel y Daniela, que no son técnicas.
export function correoDeContrasena({ enlace, nombre }: { enlace: string; nombre?: string }): string {
  const saludo = nombre ? `Hola, ${nombre}.` : "Hola.";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1F2A44">
      <p>${saludo}</p>
      <p>Pediste elegir una contraseña nueva para el panel de Empoderamiento Docente.
      Tocá el botón y escribila dos veces. El link dura una hora.</p>
      <p style="margin: 28px 0">
        <a href="${enlace}" style="background: #1F2A44; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none">
          Elegir mi contraseña
        </a>
      </p>
      <p>Si no fuiste vos, no hace falta hacer nada: la contraseña de siempre sigue valiendo.</p>
    </div>
  `;
}
