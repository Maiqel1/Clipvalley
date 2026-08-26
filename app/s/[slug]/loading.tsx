import { Skeleton } from "@/components/ui/skeleton";

export default function SharedClipLoading() {
  return (
    <div className="relative min-h-screen">
      <div className="ambient-bg" />
      <main className="mx-auto w-full max-w-xl px-margin-mobile py-12 md:px-margin-desktop md:py-20">
        <div className="mb-8 flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <Skeleton className="h-7 w-52" />
        </div>

        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-level-1">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-8/12" />
          </div>
          <Skeleton className="mt-6 h-14 w-full rounded-lg" />
        </div>
      </main>
    </div>
  );
}
