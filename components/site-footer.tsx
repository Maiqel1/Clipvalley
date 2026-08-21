import Link from "next/link";
import { cn } from "@/lib/cn";
import { SITE_NAME } from "@/lib/site";

const LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-outline-variant/20 py-6", className)}>
      <div className="mx-auto flex w-full max-w-(--container-max) flex-col gap-3 px-margin-mobile sm:flex-row sm:items-center sm:justify-between md:px-margin-desktop">
        <p className="text-label-sm text-on-surface-variant">
          {SITE_NAME} — 2-way clipboard sync.
        </p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-label-sm text-on-surface-variant transition-colors duration-200 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
