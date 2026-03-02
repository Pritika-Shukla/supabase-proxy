"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition"
    >
      Sign out
    </button>
  );
}