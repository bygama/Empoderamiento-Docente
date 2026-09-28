/**
 * En celular los chips de categoría van en un riel horizontal: si se llega con
 * una categoría en la URL (`?categoria=`), el chip elegido puede quedar fuera
 * de la vista. Esto corre SOLO el riel (nunca la página) para dejarlo al medio.
 */
export function centrarChipActivo() {
  if (!window.matchMedia("(max-width: 47.999rem)").matches) return;
  const btn = document.querySelector<HTMLElement>('#ultimas [role="group"] button[aria-pressed="true"]');
  const riel = btn?.parentElement;
  if (!btn || !riel) return;
  const dx = btn.getBoundingClientRect().left - riel.getBoundingClientRect().left;
  riel.scrollLeft += dx - (riel.clientWidth - btn.offsetWidth) / 2;
}
