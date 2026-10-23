import { AudioLines, History, Mic, Settings } from "lucide-react";

export const navItems = [
  { id: "tts", label: "Texto a voz", icon: AudioLines },
  { id: "voices", label: "Voces", icon: Mic },
  { id: "history", label: "Historial", icon: History },
  { id: "settings", label: "Configuración", icon: Settings },
] as const;

export type NavId = (typeof navItems)[number]["id"];

type Props = { active: NavId; onGo: (id: NavId) => void };

export function Sidebar({ active, onGo }: Props) {
  return (
    <nav aria-label="Principal" className="flex w-60 flex-col gap-1 bg-surface p-3">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-current={active === id ? "page" : undefined}
          onClick={() => onGo(id)}
          className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium ${active === id ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"}`}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </button>
      ))}
    </nav>
  );
}

export function TabBar({ active, onGo }: Props) {
  return (
    <nav aria-label="Principal" className="grid h-16 grid-cols-4 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)]">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-current={active === id ? "page" : undefined}
          onClick={() => onGo(id)}
          className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${active === id ? "text-fg" : "text-muted"}`}
        >
          <Icon className="size-5" aria-hidden />
          {label}
        </button>
      ))}
    </nav>
  );
}
