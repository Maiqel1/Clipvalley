import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "shimmer-sweep block rounded-md bg-surface-container-high/60 motion-reduce:animate-none",
        className,
      )}
    />
  );
}

// Mirrors ClipCard's real dimensions so nothing shifts when data arrives.
export function ClipCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-level-1"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="min-h-32 flex-1 space-y-2.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-9/12" />
        <Skeleton className="h-4 w-10/12" />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-outline-variant/20 pt-4">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <div className="flex gap-1.5">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ClipGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ClipCardSkeleton key={i} />
      ))}
    </div>
  );
}
