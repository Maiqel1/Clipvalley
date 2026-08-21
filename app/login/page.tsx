import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; next?: string }>;
}) {
  const { tab, next } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center p-margin-mobile md:p-margin-desktop">
      <div className="ambient-bg" />
      <AuthCard initialTab={tab === "signup" ? "signup" : "login"} next={next} />
    </div>
  );
}
