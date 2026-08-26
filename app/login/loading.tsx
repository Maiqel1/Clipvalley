import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-margin-mobile md:p-margin-desktop">
      <div className="ambient-bg" />
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Skeleton className="size-24 rounded-xl" />
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-5 w-60" />
        </div>
        <div className="glass-card rounded-xl p-6 md:p-8">
          <div className="mb-8 flex gap-4">
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-6 flex-1" />
          </div>
          <div className="space-y-5">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
