import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./Button";

type Props = { open: boolean; onClose: () => void; title: string; children: ReactNode };

// <dialog> nativo: atrapa el foco, Esc cierra y el foco vuelve al botón que lo abrió.
// En el celular se muestra como hoja inferior.
export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="modal-title"
      className="m-0 mt-auto w-full max-w-none rounded-t-lg bg-bg p-0 text-fg shadow-pop backdrop:bg-black/40 sm:m-auto sm:max-w-md sm:rounded-lg"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
        <IconButton label="Cerrar" onClick={onClose}><X className="size-4" /></IconButton>
      </div>
      <div className="p-4">{children}</div>
    </dialog>
  );
}
