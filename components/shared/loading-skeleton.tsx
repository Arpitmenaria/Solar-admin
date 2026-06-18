import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-white/[0.05]", className)} />;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0d1321] p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/[0.05]">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-16 rounded" />
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-3.5 w-16" />
    </div>
  );
}

export { Skeleton };
