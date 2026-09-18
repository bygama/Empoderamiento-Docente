/**
 * La caja centrada donde viven entrar, olvidé y nueva contraseña.
 *
 * Es deliberadamente sobria: son tres pantallas que alguien ve una vez cada
 * varios meses. Los primitivos reusables del admin nacen en la fase 2, contra
 * una entidad de verdad, para no diseñarlos en el vacío.
 */
export function Pantalla({
  titulo,
  bajada,
  children,
}: {
  titulo: string;
  bajada?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-[family-name:var(--font-manrope)] text-2xl font-bold">{titulo}</h1>
      {bajada ? <p className="mt-2 text-sm text-gris-texto">{bajada}</p> : null}
      <div className="mt-8">{children}</div>
    </main>
  );
}
