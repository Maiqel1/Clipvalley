import { AppShell } from "@/components/app-shell";
import { Skeleton, ClipGridSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <AppShell username={null} syncState="idle">
      <header className="mb-8">
        <Skeleton className="h-8 w-52 md:h-10 md:w-64" />
        <Skeleton className="mt-2 h-5 w-72" />
      </header>
      <ClipGridSkeleton />
    </AppShell>
  );
}
