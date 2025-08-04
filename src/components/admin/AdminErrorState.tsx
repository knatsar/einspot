import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminErrorStateProps {
  error: string;
  retry?: () => void;
}

export const AdminErrorState = ({ error, retry }: AdminErrorStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Dashboard Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          {retry && (
            <Button 
              onClick={retry} 
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
