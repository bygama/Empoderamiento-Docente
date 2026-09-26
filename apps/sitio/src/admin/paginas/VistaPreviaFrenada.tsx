/** Cuando el navegador frena la pestaña nueva de la vista previa: el mismo destino, como un link. */
export function VistaPreviaFrenada({ url }: { url: string }) {
  return (
    <>
      El navegador frenó la pestaña nueva:{" "}
      <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
        abrí la vista previa desde acá
      </a>
      .
    </>
  );
}
