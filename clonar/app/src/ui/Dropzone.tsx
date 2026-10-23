import { useRef, useState } from "react";
import { Upload } from "lucide-react";

type Props = { onFiles: (files: File[]) => void; hint: string };

export function Dropzone({ onFiles, hint }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); onFiles([...e.dataTransfer.files]); }}
        className={`flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center ${over ? "border-accent bg-surface" : "border-input"}`}
      >
        <Upload className="size-5 text-muted" aria-hidden />
        <span className="text-sm font-semibold text-fg">Sube tu grabación</span>
        <span className="text-xs text-muted">{hint}</span>
      </button>
      <input ref={input} type="file" accept="audio/*" multiple hidden onChange={(e) => onFiles([...(e.target.files ?? [])])} />
    </>
  );
}
