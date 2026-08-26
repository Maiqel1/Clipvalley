import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/firebase/session";
import { Icon, type IconName } from "@/components/ui/icon";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "content_copy",
    title: "Paste it here",
    body: "Hit Ctrl+V anywhere on your dashboard. Text, screenshots, links — it lands as a card instantly.",
  },
  {
    icon: "person",
    title: "Sign in anywhere",
    body: "No pairing, no codes, no cables. Your clips follow your account, not your devices.",
  },
  {
    icon: "check",
    title: "Copy it back",
    body: "One tap puts it back on the system clipboard, ready to paste wherever you needed it.",
  },
];

export default async function LandingPage() {
  let signedIn = false;

  try {
    signedIn = Boolean(await currentUser());
  } catch {
    signedIn = false;
  }

  if (signedIn) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="ambient-bg" />

      <header className="mx-auto flex w-full max-w-(--container-max) items-center justify-between px-margin-mobile py-6 md:px-margin-desktop">
        <span className="flex items-center gap-3">
          <Image src="/logo.png" alt="" width={36} height={36} className="size-9 object-contain" />
          <span className="text-headline-md text-primary">Clipvalley</span>
        </span>
        <Link
          href="/login"
          className="text-label-md font-semibold text-on-surface-variant transition-colors duration-200 hover:text-primary"
        >
          Log in
        </Link>
      </header>

      <main className="mx-auto w-full max-w-(--container-max) flex-1 px-margin-mobile md:px-margin-desktop">
        <section className="flex flex-col items-center py-16 text-center md:py-28">
          <Reveal index={0}>
            <Image
              src="/logo.png"
              alt=""
              width={96}
              height={96}
              priority
              className="mb-8 size-24 object-contain"
            />
          </Reveal>

          <Reveal index={1}>
            <h1 className="max-w-3xl text-headline-lg text-on-surface md:text-display-lg">
              Your clipboard, on every device you sign in to.
            </h1>
          </Reveal>

          <Reveal index={2}>
            <p className="mt-5 max-w-xl text-body-lg text-on-surface-variant">
              Paste text or an image on one device. Sign in on another. Copy it straight back. No
              pairing step, no cable, no emailing links to yourself.
            </p>
          </Reveal>

          <Reveal index={3}>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/login?tab=signup"
                className="inline-flex h-14 items-center gap-2 rounded-lg bg-primary px-7 text-label-md font-semibold text-on-primary shadow-level-1 transition-[filter] duration-200 hover:brightness-110"
              >
                Get started free
                <Icon name="arrow_forward" size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-14 items-center rounded-lg border border-outline-variant px-7 text-label-md font-semibold text-on-surface transition-colors duration-200 hover:border-primary hover:text-primary"
              >
                I already have an account
              </Link>
            </div>
          </Reveal>
        </section>

        <section className="grid gap-gutter pb-24 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} index={index} whileInView>
              <div className="h-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-level-1">
                <span className="mb-4 grid size-12 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon name={step.icon} size={24} />
                </span>
                <h2 className="text-headline-md text-on-surface">{step.title}</h2>
                <p className="mt-2 text-body-md text-on-surface-variant">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
