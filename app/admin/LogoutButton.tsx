"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="mt-1 w-full rounded-lg px-2 py-1.5 text-left text-sm text-gray-400 hover:bg-white/5 hover:text-white"
    >
      ⎋ Sair
    </button>
  );
}
