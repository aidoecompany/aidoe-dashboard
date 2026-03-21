"use client";
import { AccessGuard } from "./AccessGuard";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AccessGuard />
      {children}
    </>
  );
}
