// Quiénes hicieron el sitio. Va en config y no en el JSX del footer por la
// misma regla que el resto de las URLs (AGENTS.md §5.3): un link vive en un
// solo lugar. No es dato institucional de ED: es el crédito del estudio y de
// quienes colaboraron, y se muestra una sola vez, en la barra legal.
export const CREDITOS = {
  estudio: { nombre: "De Caso Marketing", url: "https://www.instagram.com/decasomarketing/" },
  colaboradores: [
    { nombre: "bygama", url: "https://github.com/bygama" },
    { nombre: "querque", url: "https://github.com/querques20" },
  ],
} as const;
