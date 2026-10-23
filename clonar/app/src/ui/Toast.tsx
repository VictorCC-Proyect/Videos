import { CircleAlert, CircleCheck } from "lucide-react";

type Props = { kind: "success" | "error"; message: string };

export function Toast({ kind, message }: Props) {
  return (
    <div role={kind === "error" ? "alert" : "status"} className="flex items-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-medium text-on-accent shadow-pop">
      {kind === "error" ? <CircleAlert className="size-4 shrink-0" aria-hidden /> : <CircleCheck className="size-4 shrink-0" aria-hidden />}
      {message}
    </div>
  );
}
