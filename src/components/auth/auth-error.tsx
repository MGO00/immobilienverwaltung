import { AlertCircle } from "lucide-react";

export function AuthError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 border border-error-border bg-error-bg p-3">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-error" />
      <p className="text-[13px] text-error">{message}</p>
    </div>
  );
}
