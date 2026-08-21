"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { snappy } from "@/lib/motion";
import { Icon, type IconName } from "@/components/ui/icon";
import { Button, IconButton } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { SyncChip, type SyncState } from "@/components/sync-chip";

type NavItem = { href: string; label: string; icon: IconName };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Recent Clips", icon: "content_copy" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

type AppShellProps = {
  username: string | null;
  syncState: SyncState;
  onNewClip?: () => void;
  children: React.ReactNode;
};

export function AppShell({ username, syncState, onNewClip, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const newClip = onNewClip ?? (() => router.push("/dashboard"));

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-outline-variant/30 bg-surface-container-low p-6 shadow-level-1 md:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-3">
          <Image src="/logo.png" alt="" width={40} height={40} className="size-10 object-contain" />
          <span className="text-headline-md text-primary">Clipvalley</span>
        </Link>

        <Button size="md" className="mb-6 w-full" onClick={newClip}>
          <Icon name="add" size={18} />
          New Clip
        </Button>

        <nav className="flex flex-1 flex-col gap-2">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-md px-4 py-3 text-label-md font-semibold",
                  "transition-colors duration-200",
                  active
                    ? "text-on-primary-container"
                    : "text-on-surface-variant hover:bg-secondary-container/50",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-md bg-primary-container"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative flex items-center gap-3">
                  <Icon name={item.icon} size={20} filled={active} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <form action={signOut} className="mt-auto border-t border-outline-variant/30 pt-6">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-label-md font-semibold text-on-surface-variant transition-colors duration-200 hover:bg-secondary-container/50"
          >
            <Icon name="logout" size={20} />
            Logout
          </button>
        </form>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-20 border-b border-outline-variant/20 bg-surface/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-(--container-max) items-center justify-between px-margin-mobile md:px-margin-desktop">
            <Link href="/dashboard" className="flex items-center gap-3 md:hidden">
              <Image src="/logo.png" alt="" width={32} height={32} className="size-8 object-contain" />
              <span className="text-headline-md text-primary">Clipvalley</span>
            </Link>
            <span className="hidden md:block" />

            <div className="flex items-center gap-3">
              <SyncChip state={syncState} />
              <Link
                href="/dashboard/settings"
                aria-label={username ? `Signed in as ${username}` : "Account"}
                title={username ? `Signed in as ${username}` : "Account"}
                className="grid size-10 place-items-center rounded-full bg-surface-container text-primary transition-colors duration-200 hover:bg-primary/12"
              >
                <Icon name="person" size={20} filled />
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-(--container-max) flex-1 px-margin-mobile pt-8 pb-28 md:px-margin-desktop md:pb-12">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around rounded-t-xl border-t border-outline-variant/20 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="relative flex h-full flex-1 flex-col items-center justify-center gap-1"
            >
              <motion.span
                animate={{ scale: active ? 1.08 : 1 }}
                transition={snappy}
                className={cn(
                  "grid place-items-center rounded-full px-5 py-1 transition-colors duration-200",
                  active ? "text-primary" : "text-on-surface-variant",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="bottomnav-active"
                    className="absolute inset-x-4 top-2 bottom-2 -z-10 rounded-full bg-primary/12"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon name={item.icon} size={22} filled={active} />
              </motion.span>
              <span
                className={cn(
                  "text-label-sm transition-colors duration-200",
                  active ? "text-primary" : "text-on-surface-variant",
                )}
              >
                {item.label === "Recent Clips" ? "Clips" : item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <IconButton
        label="New clip"
        onClick={newClip}
        className="fixed right-5 bottom-20 z-30 size-14 bg-primary text-on-primary shadow-level-2 hover:bg-primary hover:brightness-110 md:hidden"
      >
        <Icon name="add" size={26} />
      </IconButton>
    </div>
  );
}
