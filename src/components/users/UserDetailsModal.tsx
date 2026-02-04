import { X, Shield, UserCheck, User as UserIcon, Mail, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/types/inventory';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface UserDetailsModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onEdit: () => void;
}

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

export default function UserDetailsModal({ isOpen, user, onClose, onEdit }: UserDetailsModalProps) {
  if (!isOpen || !user) return null;

  const RoleIcon = roleIcons[user.role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">User Details</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* User Avatar & Name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
              {user.avatar}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full',
                  user.status === 'active' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                )}>
                  {user.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <div className={cn('w-5 h-5 rounded flex items-center justify-center', roleColors[user.role])}>
                <RoleIcon className="w-3 h-3" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium text-foreground capitalize">{user.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium text-foreground">{format(user.createdAt, 'MMM d, yyyy')}</p>
              </div>
            </div>

            {user.lastLogin && (
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Login</p>
                  <p className="text-sm font-medium text-foreground">{format(user.lastLogin, 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button type="button" onClick={onEdit} className="flex-1">
              Edit User
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
