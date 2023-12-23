"use client";
import { signOut } from "next-auth/react";

export default function LogOut() {
  return (
    <button onClick={() => signOut()} className="w-full text-left">
      Log out
    </button>
  );
}
