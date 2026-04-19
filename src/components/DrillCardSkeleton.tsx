import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DrillCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title and category */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        {/* Meta info (likes, comments, etc) */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </Card>
  );
};

export const DrillCardSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <DrillCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const DrillCardExploreSkeleton = () => {
  return (
    <div className="aspect-square bg-muted rounded-lg animate-pulse" />
  );
};

export const DrillCardExploreSkeletonGrid = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 md:gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <DrillCardExploreSkeleton key={i} />
      ))}
    </div>
  );
};
