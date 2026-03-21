import type { Metadata } from "next";
import "./globals.css";
import { AccessGuard } from "@/components/AccessGuard";

export const metadata: Metadata = {
  title: "Recuria — AI Assistant",
  description:
    "Recuria powered by Aidoe — A ready AI assistant platform.",
  keywords: ["AI", "assistant", "Recuria"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AccessGuard />
        {children}
      </body>
    </html>
  );
}
