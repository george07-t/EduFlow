import SkeletonBase, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface SkeletonProps {
  count?: number;
  height?: number | string;
  width?: number | string;
  circle?: boolean;
  className?: string;
}

export default function Skeleton({ count = 1, height, width, circle, className }: SkeletonProps) {
  return (
    <SkeletonTheme baseColor="#e5e7eb" highlightColor="#f3f4f6">
      <SkeletonBase
        count={count}
        height={height}
        width={width}
        circle={circle}
        className={className}
      />
    </SkeletonTheme>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <Skeleton height={20} width="60%" />
      <Skeleton count={2} height={14} />
      <Skeleton height={14} width="30%" />
    </div>
  );
}

export function ArticlePageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height={36} width="70%" />
      <Skeleton height={16} width="40%" />
      <Skeleton count={6} height={16} />
      <Skeleton count={4} height={16} />
    </div>
  );
}
