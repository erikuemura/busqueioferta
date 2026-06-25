"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ callbackUrl = "/", className = "btn-ghost text-sm" }: { callbackUrl?: string; className?: string }) {
  return (
    <button onClick={() => signOut({ callbackUrl })} className={className}>
      Sair
    </button>
  );
}
