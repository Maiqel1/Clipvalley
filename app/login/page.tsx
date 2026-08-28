import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; next?: string; error?: string; notice?: string }>;
}) {
  const { tab, next, error, notice } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center p-margin-mobile md:p-margin-desktop">
      <div className="ambient-bg" />
      <AuthCard
        initialTab={tab === "signup" || tab === "reset" ? tab : "login"}
        next={next}
        error={error}
        notice={notice}
      />
    </div>
  );
}
