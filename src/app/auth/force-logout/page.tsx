"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForceLogout() {
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.signOut().then(() => {
      window.location.href = "/auth/login";
    });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f8f6]">
      <p className="text-sm text-gray-400">Signing out...</p>
    </div>
  );
}
