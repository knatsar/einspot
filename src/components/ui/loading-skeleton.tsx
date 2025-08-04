import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
  card?: boolean;
}

export function LoadingSkeleton({ 
  className, 
  lines = 3, 
  avatar = false, 
  card = false 
}: LoadingSkeletonProps) {
  if (card) {
    return (
      <div className={cn("space-y-4 p-4 border rounded-lg", className)}>
        <div className="flex items-center space-x-4">
          {avatar && <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />}
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-3 bg-muted rounded animate-pulse",
                i === lines - 1 ? "w-2/3" : "w-full"
              )} 
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {avatar && (
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-32" />
            <div className="h-3 bg-muted rounded animate-pulse w-24" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-3 bg-muted rounded animate-pulse",
              i === 0 ? "w-full" : i === lines - 1 ? "w-2/3" : "w-5/6"
            )} 
          />
        ))}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="aspect-video bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded animate-pulse" />
          <div className="h-3 bg-muted rounded animate-pulse w-4/5" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-muted rounded animate-pulse w-20" />
          <div className="h-8 bg-muted rounded animate-pulse w-24" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded animate-pulse flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className={cn(
                "h-8 bg-muted rounded animate-pulse flex-1",
                colIndex === 0 ? "w-1/4" : colIndex === columns - 1 ? "w-1/6" : ""
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}