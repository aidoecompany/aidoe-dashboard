"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthBridgePage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState("Finishing sign-in...");

  useEffect(() => {
    const hash = window.location.hash?.replace(/^#/, "");
    const search = window.location.search?.replace(/^\?/, "");
    const params = new URLSearchParams(hash || search);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setStatus("Missing sign-in token. Please log in again.");
      return;
    }

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setStatus("Could not finish sign-in. Please try again.");
          return;
        }

        window.history.replaceState({}, document.title, "/");
        router.replace("/");
        router.refresh();
      });
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-4 py-12 text-[#1d1d1f]">
      <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-[0_18px_45px_rgba(17,24,39,0.12)]">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
          Recuria
        </p>
        <h1 className="mt-3 text-2xl font-semibold">Signing you in</h1>
        <p className="mt-3 text-sm text-[#6e6e73]">{status}</p>
      </div>
    </div>
  );
}
