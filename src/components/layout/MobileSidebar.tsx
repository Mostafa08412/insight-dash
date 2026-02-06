import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  BarChart3, 
  Users, 
  FolderOpen,
  Settings,
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: ('admin' | 'manager' | 'staff')[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard', roles: ['admin', 'manager', 'staff'] },
  { icon: Package, label: 'Products', path: 'products', roles: ['admin', 'manager', 'staff'] },
  { icon: ShoppingCart, label: 'Transactions', path: 'transactions', roles: ['admin', 'manager', 'staff'] },
  { icon: AlertTriangle, label: 'Low Stock Alerts', path: 'alerts', roles: ['admin', 'manager', 'staff'] },
  { icon: BarChart3, label: 'Reports', path: 'reports', roles: ['admin', 'manager'] },
  { icon: FolderOpen, label: 'Categories', path: 'categories', roles: ['admin', 'manager'] },
  { icon: Users, label: 'User Management', path: 'users', roles: ['admin'] },
  { icon: Settings, label: 'Settings', path: 'settings', roles: ['admin'] },
];

interface MobileSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function MobileSidebar({ activePage, onNavigate }: MobileSidebarProps) {
  const { currentUser, currentRole, setCurrentRole, hasPermission } = useRole();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
    setOpen(false);
  };

  const roleColors = {
    admin: 'bg-destructive/20 text-destructive',
    manager: 'bg-warning/20 text-warning',
    staff: 'bg-info/20 text-info',
  };

  const filteredNavItems = navItems.filter(item => hasPermission(item.roles));

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors lg:hidden">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg tracking-tight">InventoryPro</h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin max-h-[calc(100vh-280px)]">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={cn(
                  'nav-item w-full text-left',
                  isActive && 'active'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Role Switcher */}
        <div className="px-3 py-2 border-t border-sidebar-border">
          <p className="text-xs text-muted-foreground px-4 mb-2">Switch Role (Demo)</p>
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className={cn('px-2 py-0.5 rounded text-xs font-medium', roleColors[currentRole])}>
                  {currentRole.toUpperCase()}
                </span>
              </span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', roleDropdownOpen && 'rotate-180')} />
            </button>
            
            {roleDropdownOpen && (
              <div className="absolute bottom-full left-0 w-full mb-1 bg-card rounded-lg border border-border shadow-lg overflow-hidden animate-scale-in z-50">
                {(['admin', 'manager', 'staff'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setCurrentRole(role);
                      setRoleDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2',
                      currentRole === role && 'bg-accent'
                    )}
                  >
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', roleColors[role])}>
                      {role.toUpperCase()}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {role === 'admin' ? 'Full Access' : role === 'manager' ? 'Products & Reports' : 'View Only'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Section */}
        <div className="px-3 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
