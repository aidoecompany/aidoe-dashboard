// ============================================
// RECURIA -- Root Page
// ============================================

import { redirect } from "next/navigation";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const TRIAL_DAYS = 7;
const EXEMPT_EMAILS = new Set([
  "sanchaykrishna15@gmail.com",
  "hari8haran8@gmail.com",
  "aidoecompnay@gmail.com",
]);

const TRIAL_EXPIRED_MESSAGE =
  "Your 7 day free trial has ended. Please subscribe to continue using Recuria.";

export default async function Home() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/auth/login");
  }

  const user = data.user;
  const email = (user.email ?? "").toLowerCase();
  const isExempt = EXEMPT_EMAILS.has(email);

let trialExpired = false;
if (!isExempt && user.created_at) {
  // Check if user has been extended in extended_users table
  const { data: extData } = await supabase.from("extended_users").select("email").eq("email", email).single();
const { data: removedData } = await supabase.from("removed_users").select("email").eq("email", email).single();

if (removedData) {
  trialExpired = true;
} else if (!extData) {
  const createdAt = new Date(user.created_at);
  const trialEnd = new Date(createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  trialExpired = new Date() > trialEnd;
}
}

  if (trialExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-4 py-12 text-[#1d1d1f]">
        <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-[0_18px_45px_rgba(17,24,39,0.12)]">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6e6e73]">
            Recuria
          </p>
          <h1 className="mt-3 text-2xl font-semibold">Trial expired</h1>
          <p className="mt-3 text-sm text-[#6e6e73]">{TRIAL_EXPIRED_MESSAGE}</p>
        </div>
      </div>
    );
  }

  return <ChatWindow />;
}
