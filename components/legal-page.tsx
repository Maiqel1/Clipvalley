import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SiteFooter } from "@/components/site-footer";
import { SITE_NAME, LEGAL_LAST_UPDATED } from "@/lib/site";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="ambient-bg" />

      <header className="mx-auto flex w-full max-w-(--container-max) items-center justify-between px-margin-mobile py-6 md:px-margin-desktop">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={36} height={36} className="size-9 object-contain" />
          <span className="text-headline-md text-primary">{SITE_NAME}</span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-label-md font-semibold text-on-surface-variant transition-colors duration-200 hover:text-primary"
        >
          <Icon name="arrow_back" size={18} />
          Back
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-margin-mobile pb-20 md:px-margin-desktop">
        <h1 className="text-headline-lg text-on-surface md:text-display-lg">{title}</h1>
        <p className="mt-3 text-body-sm text-on-surface-variant">
          Last updated {LEGAL_LAST_UPDATED}
        </p>
        <div className="mt-10 flex flex-col gap-8">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-headline-md text-on-surface">{title}</h2>
      <div className="flex flex-col gap-3 text-body-md text-on-surface-variant">{children}</div>
    </section>
  );
}

export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-outline-variant">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
