import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, Eye } from 'lucide-react';

const AuthDebug = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Authentication Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">User Status:</label>
            <div className="flex items-center gap-2 mt-1">
              <User className="h-4 w-4" />
              <Badge variant={user ? "default" : "destructive"}>
                {user ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>
          </div>

          {user && (
            <>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email:</label>
                <p className="mt-1 font-mono text-sm">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID:</label>
                <p className="mt-1 font-mono text-xs break-all">{user.id}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Role:</label>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4" />
                  <Badge variant={
                    userRole === 'superadmin' ? 'destructive' : 
                    userRole === 'admin' ? 'default' : 
                    'secondary'
                  }>
                    {userRole || 'Loading...'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Access Permissions:</label>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Customer Dashboard: ✅ Available
                    </Badge>
                  </div>
                  {(userRole === 'admin' || userRole === 'superadmin') && (
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        Admin Panel: ✅ Available
                      </Badge>
                    </div>
                  )}
                  {userRole === 'superadmin' && (
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-xs">
                        Super Admin: ✅ Full Access
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebug;