/** El número de un papel de la mesa, «01» … «06»: su lugar en el archivo, y su key en la lista. */
export const numeroDePapel = (indice: number) => String(indice + 1).padStart(2, "0");
