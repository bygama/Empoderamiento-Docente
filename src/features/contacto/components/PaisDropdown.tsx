"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "@/components/ui/icons";

type Props = {
  /** id del trigger (para el <label htmlFor>). */
  id: string;
  /** name del campo — el valor elegido viaja en un <input hidden> con este name. */
  name: string;
  options: readonly string[];
  placeholder?: string;
};

/**
 * Dropdown propio para País. Reemplaza al <select> nativo, cuya flecha y menú
 * del sistema desentonan con los campos editoriales del formulario. El valor
 * elegido se escribe en un <input hidden> para que el FormData del form lo lea
 * igual que un campo normal (name="pais").
 *
 * Accesible: trigger con aria-haspopup/aria-expanded, lista role="listbox" con
 * opciones role="option", teclado completo (↑ ↓ Enter Espacio Escape, Home/End)
 * y cierre por click-fuera. El resaltado de teclado (active) y el elegido
 * (value) son estados separados: uno se mueve con las flechas, el otro es lo
 * confirmado.
 */
export function PaisDropdown({
  id,
  name,
  options,
  placeholder = "Elegir…",
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const listId = useId();

  // Click fuera del componente cierra el menú.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Al abrir, scrollea el resaltado a la vista (sin setState en el effect: el
  // índice inicial lo fija `abrir()`).
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() =>
      optionRefs.current[active]?.scrollIntoView({ block: "nearest" }),
    );
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Abre el menú con el resaltado ya puesto en la opción elegida (o la primera).
  const abrir = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };

  const elegir = (v: string) => {
    setValue(v);
    setOpen(false);
  };

  const mover = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, options.length - 1));
    setActive(clamped);
    optionRefs.current[clamped]?.scrollIntoView({ block: "nearest" });
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) abrir();
        else mover(active + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) abrir();
        else mover(active - 1);
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          mover(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          mover(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) elegir(options[active]);
        else abrir();
        break;
      case "Escape":
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  const trigger =
    "flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left font-sans text-[1rem] transition-[border-color,background-color,box-shadow] focus:outline-none focus-visible:outline-none";
  const triggerState = open
    ? "border-verde-concepto bg-white shadow-[0_0_0_3px_rgb(31_154_120/0.14)]"
    : "border-azul-claro/60 bg-azul-principal/[0.03] hover:border-azul-claro";

  return (
    <div ref={rootRef} className="relative">
      {/* valor real para el FormData */}
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        id={id}
        onClick={() => (open ? setOpen(false) : abrir())}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        className={`${trigger} ${triggerState}`}
      >
        <span className={value ? "text-azul-principal" : "text-gris-texto/50"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-azul-principal/50 shrink-0 transition-transform duration-300 ${
            open ? "-scale-y-100" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="País"
          className="ring-azul-principal/5 absolute top-[calc(100%+0.4rem)] right-0 left-0 z-30 max-h-80 overflow-auto rounded-xl border border-azul-claro/70 bg-white p-1.5 shadow-[0_24px_54px_-18px_rgb(31_45_77/0.45)] ring-1"
        >
          {options.map((opt, i) => {
            const elegido = value === opt;
            const resaltado = active === i;
            return (
              // La opción ES el <li role="option">: adentro tenía un <button>,
              // que es un interactivo dentro de otro (el listbox ya lo es) y
              // duplicaba el árbol para quien navega con lector. El teclado no
              // lo usaba —lo maneja el input con aria-activedescendant— y el
              // clic y el hover viven ahora acá.
              <li
                key={opt}
                ref={(el) => {
                  optionRefs.current[i] = el;
                }}
                role="option"
                aria-selected={elegido}
                onClick={() => elegir(opt)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left font-sans text-[0.95rem] transition-colors ${
                  resaltado ? "bg-azul-claro/20" : ""
                } ${elegido ? "text-verde-concepto font-medium" : "text-azul-principal"}`}
              >
                <span>{opt}</span>
                {elegido && <Check size={15} className="text-verde-concepto shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
