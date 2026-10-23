import type { ReactNode } from "react";

export function EmptyState({ icon, text, action }: { icon: ReactNode; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line p-8 text-center">
      <span className="text-muted">{icon}</span>
      <p className="text-sm text-muted">{text}</p>
      {action}
    </div>
  );
}
