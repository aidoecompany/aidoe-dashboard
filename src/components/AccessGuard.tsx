"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function AccessGuard() {
  useEffect(() => {
    const checkAccess = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const res = await fetch(`/api/chat/check-access?email=${encodeURIComponent(user.email ?? '')}`);
      const data = await res.json();
      if (data.removed) {
        await supabase.auth.signOut();
        window.location.href = "/auth/login";
      }
    };
    checkAccess();
    const interval = setInterval(checkAccess, 5000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
