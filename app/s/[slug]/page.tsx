import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { findSharedClip } from "@/lib/data/clips";
import { detectLink } from "@/lib/detect-link";
import { formatBytes } from "@/lib/clipboard";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { ToastProvider } from "@/components/ui/toast";
import { SharedClipActions } from "@/components/shared-clip-actions";
import { SiteFooter } from "@/components/site-footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!/^[a-z0-9]{6,32}$/.test(slug)) return { title: "Shared clip" };

  const shared = await findSharedClip(slug);

  return {
    title: shared?.clip.title?.trim() || "Shared clip",
    robots: { index: false, follow: false },
  };
}

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!/^[a-z0-9]{6,32}$/.test(slug)) notFound();

  // Admin SDK read, by slug. There is no client-reachable read path to another
  // user's clip, so public slugs cannot be enumerated.
  const shared = await findSharedClip(slug);
  if (!shared) notFound();

  const { clip, imageUrl } = shared;

  const link = clip.type === "text" ? detectLink(clip.content) : null;

  return (
    <ToastProvider>
      <div className="relative flex min-h-screen flex-col px-margin-mobile py-10 md:px-margin-desktop">
        <div className="ambient-bg" />

        <header className="mx-auto mb-10 flex w-full max-w-2xl items-center gap-4">
          <Image src="/logo.png" alt="" width={44} height={44} className="size-11 object-contain" />
          <h1 className="text-headline-md text-on-surface md:text-headline-lg">
            Shared via Clipvalley
          </h1>
        </header>

        <main className="mx-auto w-full max-w-2xl">
          <article className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-level-1 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              {clip.type === "image" ? (
                <Chip icon="image" tone="tertiary">
                  Image
                </Chip>
              ) : clip.type === "file" ? (
                <Chip icon="description" tone="tertiary">
                  File
                </Chip>
              ) : link ? (
                <Chip icon="link" tone="primary">
                  Link
                </Chip>
              ) : (
                <Chip icon="subject">Text Snippet</Chip>
              )}
              <Chip tone="primary">Read-only</Chip>
            </div>

            {clip.title && (
              <h2 className="mb-4 text-headline-md break-words text-on-surface">{clip.title}</h2>
            )}

            {clip.type === "file" ? (
              <div className="flex items-center gap-4 rounded-md border border-outline-variant/20 bg-surface-container-low p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                  <Icon name="description" size={24} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-body-md font-semibold text-on-surface">
                    {clip.file_name ?? "File"}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {[formatBytes(clip.size), clip.mime_type].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            ) : clip.type === "image" ? (
              imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full rounded-md border border-outline-variant/20 object-contain"
                />
              ) : (
                <p className="rounded-md bg-surface-container-low p-6 text-body-md text-on-surface-variant">
                  This image is no longer available.
                </p>
              )
            ) : (
              <pre className="max-h-[60vh] overflow-auto rounded-md bg-surface-container-low p-5 font-sans text-body-md break-words whitespace-pre-wrap text-on-surface">
                {clip.content}
              </pre>
            )}

            <SharedClipActions
              type={clip.type}
              content={clip.content}
              imageUrl={imageUrl}
              clipId={clip.id}
              fileName={clip.file_name}
            />
          </article>

          <section className="mt-16 text-center">
            <h2 className="text-headline-md text-on-surface md:text-headline-lg">
              Want instant sync across devices?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-body-md text-on-surface-variant">
              Stop emailing links to yourself. Get Clipvalley to share text and images between every
              device you sign in on.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg border border-primary px-6 text-label-md font-semibold text-primary transition-colors duration-200 hover:bg-primary/8"
            >
              Get Clipvalley
              <Icon name="arrow_forward" size={18} />
            </Link>
          </section>
        </main>

        <SiteFooter className="mt-20" />
      </div>
    </ToastProvider>
  );
}
