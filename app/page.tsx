import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
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

        <section className="grid gap-gutter pb-16 md:grid-cols-3">
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

        <Reveal whileInView>
          <section className="mx-auto max-w-3xl pb-24">
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-level-1 md:p-8">
              <h2 className="text-headline-md text-on-surface">What Clipvalley does</h2>
              <p className="mt-3 text-body-md text-on-surface-variant">
                Clipvalley is a personal clipboard that syncs across your devices. You paste text or
                an image into your dashboard, and it becomes a card saved to your account. Sign in on
                a different device and the same cards are there, ready to copy back. Sync is tied to
                your account rather than your hardware, so there is no pairing step, no device list,
                and no cable. You can also turn any single clip into a public read-only link, and
                switch that link off again at any time.
              </p>

              <h2 className="mt-8 text-headline-md text-on-surface">
                Why Clipvalley asks for your Google account
              </h2>
              <p className="mt-3 text-body-md text-on-surface-variant">
                Signing in with Google is optional — you can use an email address and password
                instead. If you do choose Google, Clipvalley requests only your email address and
                basic profile information, and uses them for one purpose: to create your account and
                recognise you when you sign in again. Your email address is what links your clips
                together across devices.
              </p>
              <p className="mt-3 text-body-md text-on-surface-variant">
                Clipvalley never requests access to Gmail, Drive, Contacts, Calendar, or any other
                Google service, and cannot read or change anything in your Google account. We do not
                sell your data, show advertising, or run analytics or tracking cookies. Full detail
                is in our{" "}
                <Link className="text-primary hover:underline" href="/privacy">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link className="text-primary hover:underline" href="/terms">
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </section>
        </Reveal>
      </main>

      <SiteFooter />
    </div>
  );
}
