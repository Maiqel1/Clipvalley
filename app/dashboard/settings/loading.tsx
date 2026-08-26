import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-level-1">
      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-5 w-64" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
        <Skeleton className="h-11 w-40 rounded-lg" />
      </div>
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <AppShell username={null} syncState="idle">
      <header className="mb-8">
        <Skeleton className="h-8 w-40 md:h-10 md:w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </header>
      <div className="flex max-w-2xl flex-col gap-6">
        <CardSkeleton rows={1} />
        <CardSkeleton rows={2} />
      </div>
    </AppShell>
  );
}
