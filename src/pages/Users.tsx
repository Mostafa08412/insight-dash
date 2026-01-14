import { useState } from 'react';
import { Plus, Edit2, Trash2, Shield, UserCheck, User as UserIcon, MoreVertical } from 'lucide-react';
import { mockUsers } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function Users() {
  const roleIcons = {
    admin: Shield,
    manager: UserCheck,
    staff: UserIcon,
  };

  const roleColors = {
    admin: 'bg-destructive/20 text-destructive',
    manager: 'bg-warning/20 text-warning',
    staff: 'bg-info/20 text-info',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-foreground">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage users and their roles</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockUsers.map((user, index) => {
                const RoleIcon = roleIcons[user.role];
                
                return (
                  <tr key={user.id} className="table-row-hover">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                          {user.avatar}
                        </div>
                        <span className="text-sm font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', roleColors[user.role])}>
                          <RoleIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-foreground capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge-success">Active</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="font-semibold text-foreground">Admin</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Full system access</li>
            <li>• User management</li>
            <li>• All reports & analytics</li>
            <li>• Settings configuration</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground">Manager</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Product management</li>
            <li>• Category management</li>
            <li>• View reports</li>
            <li>• Transaction oversight</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-info" />
            </div>
            <h3 className="font-semibold text-foreground">Staff</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• View products</li>
            <li>• Record transactions</li>
            <li>• View stock alerts</li>
            <li>• Limited dashboard access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
