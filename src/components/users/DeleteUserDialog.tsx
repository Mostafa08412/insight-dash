import { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { User } from '@/types/inventory';

interface DeleteUserDialogProps {
  isOpen: boolean;
  user: User | null;
  currentUserId: string;
  onClose: () => void;
  onDelete: (userId: string) => void;
}

export default function DeleteUserDialog({ isOpen, user, currentUserId, onClose, onDelete }: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !user) return null;

  const isCurrentUser = user.id === currentUserId;

  const handleDelete = async () => {
    if (isCurrentUser) {
      toast({ title: 'Error', description: 'You cannot delete your own account.', variant: 'destructive' });
      return;
    }

    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onDelete(user.id);
      toast({ title: 'User Deleted', description: `${user.name} has been deleted successfully.` });
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Delete User</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isCurrentUser ? (
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Cannot Delete</h3>
                <p className="text-sm text-muted-foreground">
                  You cannot delete your own account. Please contact another administrator.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Are you sure?</h3>
                  <p className="text-sm text-muted-foreground">
                    You are about to delete <span className="font-medium text-foreground">{user.name}</span> ({user.email}).
                  </p>
                </div>
              </div>

              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-destructive">
                  <strong>Warning:</strong> This action cannot be undone. All transactions and activity associated with this user will be retained but the user will no longer be able to access the system.
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {isCurrentUser ? 'Close' : 'Cancel'}
            </Button>
            {!isCurrentUser && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex-1">
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Delete User
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
