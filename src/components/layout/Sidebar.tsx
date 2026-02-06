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
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
  { icon: Package, label: 'Products', path: 'products' },
  { icon: ShoppingCart, label: 'Transactions', path: 'transactions' },
  { icon: AlertTriangle, label: 'Low Stock Alerts', path: 'alerts' },
  { icon: BarChart3, label: 'Reports', path: 'reports' },
  { icon: FolderOpen, label: 'Categories', path: 'categories' },
  { icon: Users, label: 'User Management', path: 'users' },
  { icon: Settings, label: 'Settings', path: 'settings' },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border flex-col hidden lg:flex">
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
       <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
         {navItems.map((item) => {
           const Icon = item.icon;
           const isActive = activePage === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
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

       {/* User Section */}
       <div className="px-3 py-4 border-t border-sidebar-border">
         {user && (
           <div className="flex items-center gap-3 px-4 py-2">
             <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
               {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-foreground truncate">{user.firstName} {user.lastName}</p>
               <p className="text-xs text-muted-foreground truncate">{user.email}</p>
             </div>
             <button 
               onClick={handleLogout}
               className="p-2 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
               title="Sign out"
             >
               <LogOut className="w-4 h-4" />
             </button>
           </div>
         )}
       </div>
    </aside>
  );
}
