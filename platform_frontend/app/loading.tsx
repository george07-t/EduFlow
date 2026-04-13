import Skeleton from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen p-6 sm:p-8 lg:p-10 bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton height={56} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Skeleton height={420} />
          <div className="lg:col-span-3 space-y-4">
            <Skeleton height={36} width="66%" />
            <Skeleton height={20} width="50%" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 pt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height={176} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
