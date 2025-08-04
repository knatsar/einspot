import { Loader2 } from 'lucide-react';

export const AdminLoadingState = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-lg font-medium">Loading admin dashboard...</p>
        <p className="text-sm text-muted-foreground">Please wait while we fetch your data</p>
      </div>
    </div>
  );
};
