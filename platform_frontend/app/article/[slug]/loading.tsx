import Skeleton from "@/components/ui/Skeleton";

export default function ArticleLoading() {
  return (
    <div className="min-h-screen p-6 sm:p-8 lg:p-10 bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton height={56} />
        <Skeleton height={20} width="50%" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2" height={620} />
          <div className="space-y-3">
            <Skeleton height={128} />
            <Skeleton height={128} />
            <Skeleton height={128} />
          </div>
        </div>
      </div>
    </div>
  );
}
