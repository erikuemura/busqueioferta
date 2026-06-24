"use client";

import { useTransition } from "react";
import { retrySocialPostAction } from "../actions";

export function RetryButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => retrySocialPostAction(id))}
      className="font-semibold text-brand hover:underline disabled:opacity-50"
    >
      {pending ? "..." : "↻ Reenviar"}
    </button>
  );
}
