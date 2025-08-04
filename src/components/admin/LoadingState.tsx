import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function AdminPageLoading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-[200px] animate-pulse rounded-lg bg-muted" />
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 w-full animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
