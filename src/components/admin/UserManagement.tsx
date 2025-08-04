import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Mail, UserPlus } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminHeader } from './AdminHeader';
import { DataTable } from './DataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserData extends User {
  role: string;
  last_sign_in: string;
}

export function UserManagement() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const { toast } = useToast();

  const columns: ColumnDef<UserData>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      accessorKey: 'last_sign_in',
      header: 'Last Sign In',
      cell: ({ row }) => {
        const date = row.getValue('last_sign_in');
        return date ? format(new Date(date as string), 'PP') : 'Never';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(user.email || '')}
              >
                Copy email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSendPasswordReset(user.email)}>
                Reset password
              </DropdownMenuItem>
              {user.role !== 'superadmin' && (
                <DropdownMenuItem onClick={() => handleUpdateRole(user.id)}>
                  Change role
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleInviteUser = async () => {
    try {
      const { error } = await supabase.from('admin_invitations').insert({
        email: inviteEmail,
        role: selectedRole,
      });

      if (error) throw error;

      toast({
        title: 'Invitation sent',
        description: `Successfully invited ${inviteEmail}`,
      });

      setIsInviteOpen(false);
      setInviteEmail('');
      setSelectedRole('user');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleSendPasswordReset = async (email: string | undefined) => {
    if (!email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the password reset link',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send password reset email',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: selectedRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Role updated',
        description: 'Successfully updated user role',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="User Management"
        description="Manage user accounts and permissions"
      >
        <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="role">Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleInviteUser}>
                <Mail className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </AdminHeader>

      <DataTable
        columns={columns}
        data={[]} // TODO: Add real user data
        searchColumn="email"
        searchPlaceholder="Search users..."
      />
    </div>
  );
}
