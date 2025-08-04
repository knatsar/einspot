import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Users, UserCheck, Shield, Ban, History, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  is_suspended?: boolean;
  last_sign_in?: string;
  confirmed?: boolean;
}

const AdminUserManager = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const { userRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with all user information using a join
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          auth_users:auth.users!user_id(
            email,
            confirmed_at,
            last_sign_in_at
          )
        `);

      if (profilesError) throw profilesError;

      const combinedUsers: UserProfile[] = profiles?.map(profile => ({
        ...profile,
        email: profile.auth_users?.email || profile.email,
        confirmed: profile.auth_users?.confirmed_at ? true : false,
        last_sign_in: profile.auth_users?.last_sign_in_at
      })) || [];

      setUsers(combinedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .rpc('change_user_role', {
          target_user_id: userId,
          new_role: newRole,
          reason: 'Admin role change'
        });

      if (error) throw error;

      await logUserActivity(userId, 'role_change', `Role changed to ${newRole}`);
      
      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });

      fetchUsers();
    } catch (error: Error) {
      console.error('Error changing user role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to change user role",
        variant: "destructive"
      });
    }
  };

  const toggleUserSuspension = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .rpc('toggle_user_suspension', {
          target_user_id: userId,
          suspend: !currentStatus
        });

      if (error) throw error;

      await logUserActivity(
        userId, 
        'suspension_toggle', 
        `User ${currentStatus ? 'unsuspended' : 'suspended'}`
      );

      toast({
        title: "Success",
        description: `User ${currentStatus ? 'unsuspended' : 'suspended'} successfully`,
      });

      fetchUsers();
    } catch (error: Error) {
      console.error('Error toggling user suspension:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user suspension status",
        variant: "destructive"
      });
    }
  };

  const logUserActivity = async (userId: string, action: string, details: string) => {
    try {
      const { error } = await supabase
        .from('user_activity_logs')
        .insert({
          user_id: userId,
          action,
          details,
          performed_by: userRole,
          ip_address: window.location.hostname
        });

      if (error) throw error;
    } catch (error: Error) {
      console.error('Error logging user activity:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'customer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStats = () => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
    const customers = users.filter(u => u.role === 'customer').length;
    return { total, admins, customers };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email / Status</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{user.email}</div>
                          <div className="flex gap-2">
                            <Badge 
                              variant={user.confirmed ? "success" : "secondary"}
                              className="text-xs"
                            >
                              {user.confirmed ? "Verified" : "Unverified"}
                            </Badge>
                            {user.is_suspended && (
                              <Badge 
                                variant="destructive"
                                className="text-xs"
                              >
                                Suspended
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.last_sign_in ? (
                          <div className="flex flex-col gap-1">
                            <div>{new Date(user.last_sign_in).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(user.last_sign_in).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {userRole === 'superadmin' && (
                            <>
                              <Select
                                value={user.role}
                                onValueChange={(newRole) => changeUserRole(user.user_id, newRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="customer">Customer</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="superadmin">Super Admin</SelectItem>
                                </SelectContent>
                              </Select>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => toggleUserSuspension(user.user_id, user.is_suspended || false)}
                                    className={user.is_suspended ? "text-green-600" : "text-red-600"}
                                  >
                                    {user.is_suspended ? (
                                      <>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        <span>Unsuspend User</span>
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="mr-2 h-4 w-4" />
                                        <span>Suspend User</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => window.location.href = `/admin/user-activity/${user.user_id}`}
                                  >
                                    <History className="mr-2 h-4 w-4" />
                                    <span>View Activity</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManager;